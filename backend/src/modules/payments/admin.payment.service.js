/**
 * payment.service.js – Nghiệp vụ thanh toán.
 *
 * Bao gồm:
 * - Phần 1: Logic VNPAY Return / IPN (giữ nguyên từ trước)
 * - Phần 2: Logic Admin quản lý thanh toán (mới)
 */

const db = require("../../database/mysql");
const { xacThucPhanHoiVnpay } = require("./vnpay.service");
const {
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  mapStatusToFrontend,
} = require("../../common/constants/paymentStatus");
const { taoBoLocThanhToan } = require("./payment-filter.util");

// =====================================================================
// PHẦN 1: LOGIC VNPAY RETURN / IPN (GIỮ NGUYÊN)
// =====================================================================

function parseVnpayAmount(query) {
  const amount = Number(query.vnp_Amount);
  return Number.isFinite(amount) ? amount / 100 : 0;
}

function isVnpayTransactionSuccessful(query) {
  return (
    query.vnp_ResponseCode === "00" &&
    (!query.vnp_TransactionStatus || query.vnp_TransactionStatus === "00")
  );
}

async function findVnpayPayment(executor, transactionRef, lockForUpdate = false) {
  const [rows] = await executor.query(
    `SELECT
       p.id,
       p.orderId,
       p.amount,
       p.status,
       p.paymentMethod,
       p.paymentType,
       p.paidAt,
       co.orderCode,
       co.status AS orderStatus
     FROM Payment p
     JOIN CustomerOrder co ON co.id = p.orderId
     WHERE p.transactionId = ?
       AND p.paymentMethod = 'VNPAY'
     LIMIT 1${lockForUpdate ? " FOR UPDATE" : ""}`,
    [transactionRef]
  );

  return rows[0] || null;
}

function buildPublicResult(query, payment, isValidChecksum) {
  const amount = isValidChecksum ? parseVnpayAmount(query) : 0;
  const amountMatches = Boolean(payment) && Number(payment.amount) === amount;
  const isSuccessful =
    isValidChecksum && amountMatches && isVnpayTransactionSuccessful(query);

  return {
    isValidChecksum,
    isSuccessful,
    responseCode: isValidChecksum ? String(query.vnp_ResponseCode || "") : "",
    transactionStatus: isValidChecksum
      ? String(query.vnp_TransactionStatus || "")
      : "",
    transactionRef: isValidChecksum ? String(query.vnp_TxnRef || "") : "",
    transactionNo: isValidChecksum ? String(query.vnp_TransactionNo || "") : "",
    bankCode: isValidChecksum ? String(query.vnp_BankCode || "") : "",
    orderCode: payment?.orderCode || null,
    amount,
    paymentType: payment?.paymentType || null,
    databaseStatus: payment?.status || null,
    paidAt: payment?.paidAt || null,
  };
}

async function xacThucKetQuaTraVeVnpay(query) {
  const isValidChecksum = xacThucPhanHoiVnpay(query);
  const transactionRef = String(query.vnp_TxnRef || "");

  // VNPAY không thể gọi IPN vào localhost. Vì vậy Return hợp lệ cũng đồng bộ
  // trạng thái như một fallback an toàn; khi deploy public, IPN vẫn là luồng chính.
  if (isValidChecksum && transactionRef) {
    await dongBoTrangThaiVnpay(query);
  }

  const payment = isValidChecksum && transactionRef
    ? await findVnpayPayment(db.pool, transactionRef)
    : null;

  return buildPublicResult(query, payment, isValidChecksum);
}

async function dongBoTrangThaiVnpay(query) {
  const transactionRef = String(query.vnp_TxnRef || "");
  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();
    const payment = await findVnpayPayment(conn, transactionRef, true);

    if (!payment) {
      await conn.rollback();
      return { RspCode: "01", Message: "Order not found" };
    }

    if (payment.status === "COMPLETED") {
      await conn.rollback();
      return { RspCode: "02", Message: "Order already confirmed" };
    }

    if (payment.status !== "PENDING" || payment.orderStatus === "CANCELLED") {
      await conn.rollback();
      return { RspCode: "02", Message: "Payment is no longer available" };
    }

    if (Number(payment.amount) !== parseVnpayAmount(query)) {
      await conn.rollback();
      return { RspCode: "04", Message: "Invalid Amount" };
    }

    const isSuccessful = isVnpayTransactionSuccessful(query);
    const [updateResult] = await conn.query(
      `UPDATE Payment
       SET status = ?,
           paidAt = ?,
           gatewayResponse = ?
       WHERE id = ?
         AND status = 'PENDING'`,
      [
        isSuccessful ? "COMPLETED" : "FAILED",
        isSuccessful ? new Date() : null,
        JSON.stringify(query),
        payment.id,
      ]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return { RspCode: "02", Message: "Order already confirmed" };
    }

    await conn.commit();

    return { RspCode: "00", Message: "Confirm Success" };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function xuLyIpnVnpay(query) {
  if (!xacThucPhanHoiVnpay(query)) {
    return { RspCode: "97", Message: "Invalid Checksum" };
  }

  return dongBoTrangThaiVnpay(query);
}

// =====================================================================
// PHẦN 2: LOGIC ADMIN QUẢN LÝ THANH TOÁN (MỚI)
// =====================================================================

/**
 * Định dạng ngày giờ sang "dd/MM/yyyy HH:mm".
 */
function formatDateVn(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return null;

  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Tạo mã giao dịch hiển thị: PAY-000128
 */
function formatPayCode(paymentId) {
  return `PAY-${String(paymentId).padStart(6, "0")}`;
}

// ── Thống kê KPI ──────────────────────────────────────────────────────

async function layThongKeThanhToan() {
  // Tổng tiền đã thanh toán hôm nay
  const [tongTienRows] = await db.pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS tongTien
     FROM Payment
     WHERE status = 'COMPLETED'
       AND DATE(paidAt) = CURDATE()`
  );

  // Tổng tiền hôm qua (dùng để tính % tăng/giảm)
  const [tongTienHomQuaRows] = await db.pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS tongTien
     FROM Payment
     WHERE status = 'COMPLETED'
       AND DATE(paidAt) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
  );

  // Giao dịch chờ thanh toán (VNPAY PENDING)
  const [choThanhToanRows] = await db.pool.query(
    `SELECT COUNT(*) AS soLuong
     FROM Payment
     WHERE status = 'PENDING'
       AND paymentMethod = 'VNPAY'`
  );

  // Giao dịch COD cần đối soát (COD PENDING)
  const [canDoiSoatRows] = await db.pool.query(
    `SELECT COUNT(*) AS soLuong
     FROM Payment
     WHERE status = 'PENDING'
       AND paymentMethod = 'COD'`
  );

  // Giao dịch thất bại
  const [thatBaiRows] = await db.pool.query(
    `SELECT COUNT(*) AS soLuong
     FROM Payment
     WHERE status IN ('FAILED', 'CANCELLED')`
  );

  const tongTienHomNay = Number(tongTienRows[0].tongTien);
  const tongTienHomQua = Number(tongTienHomQuaRows[0].tongTien);

  // Tính phần trăm thay đổi
  let phanTramThayDoi = 0;
  if (tongTienHomQua > 0) {
    phanTramThayDoi = Math.round(
      ((tongTienHomNay - tongTienHomQua) / tongTienHomQua) * 100
    );
  }

  return {
    tongTienHomNay,
    phanTramThayDoi,
    choThanhToan: Number(choThanhToanRows[0].soLuong),
    canDoiSoat: Number(canDoiSoatRows[0].soLuong),
    thatBai: Number(thatBaiRows[0].soLuong),
  };
}

// ── Danh sách giao dịch (phân trang + lọc) ───────────────────────────

async function layDanhSachThanhToan(queryParams) {
  const trang = Math.max(1, parseInt(queryParams.trang) || 1);
  const soMoiTrang = Math.min(100, Math.max(1, parseInt(queryParams.soMoiTrang) || 10));
  const offset = (trang - 1) * soMoiTrang;

  const { whereClause, params } = taoBoLocThanhToan(queryParams);

  // Đếm tổng
  const [countRows] = await db.pool.query(
    `SELECT COUNT(*) AS total
     FROM Payment p
     JOIN CustomerOrder co ON co.id = p.orderId
     JOIN Account a ON a.id = co.userId
     ${whereClause}`,
    params
  );
  const tongSo = Number(countRows[0].total);

  // Lấy danh sách
  const [rows] = await db.pool.query(
    `SELECT
       p.id,
       p.orderId,
       p.amount,
       p.paymentMethod,
       p.paymentType,
       p.status,
       p.transactionId,
       p.paidAt,
       p.createdAt,
       p.note,
       co.orderCode,
       a.fullName AS customerName,
       a.phone AS customerPhone
     FROM Payment p
     JOIN CustomerOrder co ON co.id = p.orderId
     JOIN Account a ON a.id = co.userId
     ${whereClause}
     ORDER BY p.createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, soMoiTrang, offset]
  );

  // Map sang format frontend
  const danhSach = rows.map((row) => ({
    id: row.id,
    payCode: formatPayCode(row.id),
    orderCode: row.orderCode,
    customerName: row.customerName,
    amountVnd: Number(row.amount),
    paymentType: row.paymentType,
    method: row.paymentMethod,
    status: mapStatusToFrontend(row.status, row.paymentMethod),
    gatewayCode: row.transactionId || `${row.paymentMethod}-${String(row.id).padStart(6, "0")}`,
    paidAt: formatDateVn(row.paidAt),
    createdAt: formatDateVn(row.createdAt),
  }));

  return {
    danhSach,
    tongSo,
    trang,
    soMoiTrang,
    tongSoTrang: Math.ceil(tongSo / soMoiTrang),
  };
}

// ── Chi tiết 1 giao dịch ─────────────────────────────────────────────

async function layChiTietThanhToan(id) {
  const [rows] = await db.pool.query(
    `SELECT
       p.id,
       p.orderId,
       p.amount,
       p.paymentMethod,
       p.paymentType,
       p.status,
       p.transactionId,
       p.paidAt,
       p.gatewayResponse,
       p.createdAt,
       p.note,
       co.orderCode,
       a.fullName AS customerName,
       a.phone AS customerPhone
     FROM Payment p
     JOIN CustomerOrder co ON co.id = p.orderId
     JOIN Account a ON a.id = co.userId
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    const error = new Error("Không tìm thấy giao dịch thanh toán");
    error.statusCode = 404;
    throw error;
  }

  const row = rows[0];

  // Parse gatewayResponse thành timeline IPN
  const ipnHistory = buildIpnHistory(row);

  return {
    id: row.id,
    payCode: formatPayCode(row.id),
    orderCode: row.orderCode,
    customerName: row.customerName,
    customerPhone: row.customerPhone || null,
    amountVnd: Number(row.amount),
    paymentType: row.paymentType,
    method: row.paymentMethod,
    status: mapStatusToFrontend(row.status, row.paymentMethod),
    gatewayCode: row.transactionId || `${row.paymentMethod}-${String(row.id).padStart(6, "0")}`,
    paidAt: formatDateVn(row.paidAt),
    createdAt: formatDateVn(row.createdAt),
    note: row.note || "",
    ipnHistory,
  };
}

/**
 * Dựng timeline IPN từ gatewayResponse (JSON) và trạng thái thanh toán.
 * Timeline mô phỏng các bước xử lý thanh toán.
 */
function buildIpnHistory(paymentRow) {
  const steps = [];

  // Bước 1: Khởi tạo giao dịch
  steps.push({
    description: "Khởi tạo giao dịch",
    time: formatDateVn(paymentRow.createdAt) || "",
    note: "Chờ thanh toán",
    isSuccess: false,
  });

  // Nếu có gatewayResponse → parse thêm bước
  if (paymentRow.gatewayResponse) {
    let gwData = null;
    try {
      gwData = typeof paymentRow.gatewayResponse === "string"
        ? JSON.parse(paymentRow.gatewayResponse)
        : paymentRow.gatewayResponse;
    } catch {
      // Bỏ qua nếu parse lỗi
    }

    if (gwData) {
      const isSuccess = gwData.vnp_ResponseCode === "00";
      steps.push({
        description: isSuccess ? "Nhận IPN thành công" : `Nhận IPN – Mã lỗi: ${gwData.vnp_ResponseCode || "N/A"}`,
        time: formatDateVn(paymentRow.paidAt) || formatDateVn(paymentRow.createdAt) || "",
        note: isSuccess ? "Payload matched" : `ResponseCode: ${gwData.vnp_ResponseCode || "N/A"}`,
        isSuccess,
      });
    }
  }

  // Nếu đã thanh toán thành công
  if (paymentRow.status === PAYMENT_STATUS.COMPLETED && paymentRow.paidAt) {
    if (paymentRow.paymentMethod === PAYMENT_METHOD.COD) {
      steps.push({
        description: "Xác nhận thu COD",
        time: formatDateVn(paymentRow.paidAt) || "",
        note: "Admin đã xác nhận",
        isSuccess: true,
      });
    }
  }

  // Đảo ngược: bước mới nhất lên trên
  return steps.reverse();
}

// ── Xác nhận thu COD ──────────────────────────────────────────────────

async function xacNhanThuCod(id) {
  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT p.id, p.status, p.paymentMethod, p.orderId
       FROM Payment p
       WHERE p.id = ?
       LIMIT 1
       FOR UPDATE`,
      [id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      const error = new Error("Không tìm thấy giao dịch thanh toán");
      error.statusCode = 404;
      throw error;
    }

    const payment = rows[0];

    if (payment.paymentMethod !== PAYMENT_METHOD.COD) {
      await conn.rollback();
      const error = new Error("Giao dịch này không phải COD");
      error.statusCode = 400;
      throw error;
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      await conn.rollback();
      const error = new Error("Chỉ có thể xác nhận giao dịch COD đang ở trạng thái chờ");
      error.statusCode = 400;
      throw error;
    }

    await conn.query(
      `UPDATE Payment
       SET status = 'COMPLETED',
           paidAt = NOW()
       WHERE id = ?`,
      [id]
    );

    await conn.commit();

    return { id, trangThai: "da_thanh_toan" };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// ── Đồng bộ lại VNPAY ────────────────────────────────────────────────

async function dongBoLaiVnpay(id) {
  const [rows] = await db.pool.query(
    `SELECT p.id, p.status, p.paymentMethod, p.transactionId
     FROM Payment p
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    const error = new Error("Không tìm thấy giao dịch thanh toán");
    error.statusCode = 404;
    throw error;
  }

  const payment = rows[0];

  if (payment.paymentMethod !== PAYMENT_METHOD.VNPAY) {
    const error = new Error("Giao dịch này không phải VNPAY");
    error.statusCode = 400;
    throw error;
  }

  // Trả về trạng thái hiện tại – trong thực tế sẽ gọi VNPAY QueryDR API
  // Hiện tại chỉ trả lại trạng thái trong DB (Sandbox không hỗ trợ QueryDR)
  return {
    id: payment.id,
    trangThai: mapStatusToFrontend(payment.status, payment.paymentMethod),
    dbStatus: payment.status,
    transactionId: payment.transactionId,
    thongBao: "Đã kiểm tra trạng thái giao dịch",
  };
}

// ── Lưu ghi chú kế toán ──────────────────────────────────────────────

async function luuGhiChu(id, note) {
  const [rows] = await db.pool.query(
    `SELECT id FROM Payment WHERE id = ? LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    const error = new Error("Không tìm thấy giao dịch thanh toán");
    error.statusCode = 404;
    throw error;
  }

  await db.pool.query(
    `UPDATE Payment SET note = ? WHERE id = ?`,
    [note || null, id]
  );

  return { id, note: note || "" };
}

module.exports = {
  // VNPAY Return / IPN (giữ nguyên)
  xacThucKetQuaTraVeVnpay,
  xuLyIpnVnpay,
  // Admin quản lý thanh toán (mới)
  layThongKeThanhToan,
  layDanhSachThanhToan,
  layChiTietThanhToan,
  xacNhanThuCod,
  dongBoLaiVnpay,
  luuGhiChu,
};
