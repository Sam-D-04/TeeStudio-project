/**
 * order.service.js – Xử lý logic nghiệp vụ đơn hàng (phía Admin).
 * Thực hiện truy vấn MySQL và trả về dữ liệu đã được định dạng cho Frontend.
 */

const db = require("../../database/mysql");

// =====================================================================
// MAP TRẠNG THÁI: DB (tiếng Anh) → Frontend (tiếng Việt snake_case)
// =====================================================================
const MAP_TRANG_THAI_DB_SANG_FE = {
  PENDING: "cho_xac_nhan",
  CONFIRMED: "da_xac_nhan",
  PROCESSING: "dang_san_xuat",
  PRINTING: "dang_in",
  READY_TO_SHIP: "cho_giao",
  SHIPPING: "dang_giao",
  COMPLETED: "hoan_tat",
  CANCELLED: "da_huy",
};

// MAP ngược lại: Frontend → DB (dùng khi nhận request cập nhật)
const MAP_TRANG_THAI_FE_SANG_DB = Object.fromEntries(
  Object.entries(MAP_TRANG_THAI_DB_SANG_FE).map(([db, fe]) => [fe, db])
);

/**
 * Hàm định dạng ngày giờ sang chuỗi "HH:mm, DD/MM/YYYY"
 */
function formatNgayGio(date) {
  if (!date) return null;
  const d = new Date(date);
  const gio = String(d.getHours()).padStart(2, "0");
  const phut = String(d.getMinutes()).padStart(2, "0");
  const ngay = String(d.getDate()).padStart(2, "0");
  const thang = String(d.getMonth() + 1).padStart(2, "0");
  const nam = d.getFullYear();
  return `${gio}:${phut}, ${ngay}/${thang}/${nam}`;
}

/**
 * Xây dựng timeline lịch sử xử lý đơn từ các cột thời gian trong DB.
 * DB không có bảng lịch sử riêng, nên tái tạo từ các mốc thời gian có sẵn.
 */
function xayDungTimeline(donHang, thanhToan) {
  const timeline = [];
  const trangThai = donHang.status;

  // Bước mới nhất (bước đang hiện tại) luôn ở trên cùng
  if (trangThai === "CANCELLED" && donHang.cancelReason) {
    timeline.push({
      moTa: `Đã hủy đơn hàng – Lý do: ${donHang.cancelReason}`,
      thoiGian: formatNgayGio(donHang.updatedAt),
      nguoiThucHien: "Admin",
      laDangHienTai: true,
    });
  } else if (trangThai === "COMPLETED" && donHang.deliveredAt) {
    timeline.push({
      moTa: "Giao hàng thành công – Đơn hàng hoàn tất",
      thoiGian: formatNgayGio(donHang.deliveredAt),
      nguoiThucHien: "Hệ thống",
      laDangHienTai: true,
    });
  } else if (
    (trangThai === "SHIPPING" || trangThai === "COMPLETED") &&
    donHang.shippedAt
  ) {
    timeline.push({
      moTa: `Đang giao hàng${donHang.trackingCode ? " – Mã vận đơn: " + donHang.trackingCode : ""}`,
      thoiGian: formatNgayGio(donHang.shippedAt),
      nguoiThucHien: donHang.shippingCarrier || "Đơn vị vận chuyển",
      laDangHienTai: trangThai === "SHIPPING",
    });
  } else if (["READY_TO_SHIP", "PRINTING", "PROCESSING"].includes(trangThai)) {
    timeline.push({
      moTa:
        trangThai === "READY_TO_SHIP"
          ? "Chờ giao hàng – Đơn đã đóng gói"
          : trangThai === "PRINTING"
            ? "Đang xử lý in – Đã xuất thông số"
            : "Đang xử lý in – Chờ xuất thông số",
      thoiGian: formatNgayGio(donHang.updatedAt),
      nguoiThucHien: "Admin",
      laDangHienTai: true,
    });
  } else if (trangThai === "CONFIRMED") {
    timeline.push({
      moTa: "Đã xác nhận đơn hàng",
      thoiGian: formatNgayGio(donHang.updatedAt),
      nguoiThucHien: "Admin",
      laDangHienTai: true,
    });
  } else {
    // PENDING
    timeline.push({
      moTa: "Đơn hàng mới – Chờ xác nhận",
      thoiGian: formatNgayGio(donHang.createdAt),
      nguoiThucHien: "Hệ thống",
      laDangHienTai: true,
    });
  }

  // Thêm mốc đã thanh toán (nếu có)
  if (thanhToan && thanhToan.paidAt && thanhToan.status === "COMPLETED") {
    timeline.push({
      moTa: `Đã thanh toán qua ${thanhToan.paymentMethod}`,
      thoiGian: formatNgayGio(thanhToan.paidAt),
      nguoiThucHien: "Hệ thống",
      laDangHienTai: false,
    });
  }

  // Mốc tạo đơn luôn ở cuối timeline
  timeline.push({
    moTa: "Tạo đơn hàng mới",
    thoiGian: formatNgayGio(donHang.createdAt),
    nguoiThucHien: "Khách hàng",
    laDangHienTai: false,
  });

  return timeline;
}

// =====================================================================
// SERVICE 1: Lấy thống kê KPI (4 thẻ đầu trang)
// =====================================================================
async function layThongKe() {
  // Đếm đơn mới (PENDING)
  const [rowsDonMoi] = await db.pool.query(
    "SELECT COUNT(*) AS so_luong FROM CustomerOrder WHERE status = 'PENDING'"
  );

  // Đếm đơn đang xử lý in (PROCESSING + PRINTING)
  const [rowsDangIn] = await db.pool.query(
    "SELECT COUNT(*) AS so_luong FROM CustomerOrder WHERE status IN ('PROCESSING', 'PRINTING')"
  );

  // Đếm đơn chờ thanh toán: có Payment ở trạng thái PENDING
  const [rowsChoThanhToan] = await db.pool.query(
    `SELECT COUNT(DISTINCT co.id) AS so_luong
     FROM CustomerOrder co
     JOIN Payment p ON p.orderId = co.id
     WHERE p.status = 'PENDING'`
  );

  // Đếm đơn hoàn tất hôm nay
  const [rowsHoanTatHomNay] = await db.pool.query(
    `SELECT COUNT(*) AS so_luong
     FROM CustomerOrder
     WHERE status = 'COMPLETED'
       AND DATE(updatedAt) = CURDATE()`
  );

  return {
    donMoi: rowsDonMoi[0].so_luong,
    dangXuLyIn: rowsDangIn[0].so_luong,
    choThanhToan: rowsChoThanhToan[0].so_luong,
    hoanTatHomNay: rowsHoanTatHomNay[0].so_luong,
  };
}

// =====================================================================
// SERVICE 2: Lấy danh sách đơn hàng (phân trang + lọc)
// =====================================================================
async function layDanhSachDonHang({ trang, soMoiTrang, trangThai, thanhToan, thoiGian, loai, tuKhoa }) {
  const trangHienTai = parseInt(trang) || 1;
  const soMoi = parseInt(soMoiTrang) || 10;
  const offset = (trangHienTai - 1) * soMoi;

  // Xây dựng điều kiện WHERE động
  const dieuKien = [];
  const thamSo = [];

  // Lọc theo trạng thái (FE gửi key FE, cần chuyển sang DB)
  if (trangThai && trangThai !== "tat_ca") {
    // "dang_xu_ly_in" trên FE = PROCESSING + PRINTING trên DB
    if (trangThai === "dang_xu_ly_in") {
      dieuKien.push("co.status IN ('PROCESSING', 'PRINTING')");
    } else {
      const statusDB = MAP_TRANG_THAI_FE_SANG_DB[trangThai];
      if (statusDB) {
        dieuKien.push("co.status = ?");
        thamSo.push(statusDB);
      }
    }
  }

  // Lọc theo thanh toán
  if (thanhToan === "da_thanh_toan") {
    dieuKien.push("p.status = 'COMPLETED'");
  } else if (thanhToan === "cho_thanh_toan") {
    dieuKien.push("p.status = 'PENDING'");
  }

  // Lọc theo thời gian
  if (thoiGian === "hom_nay") {
    dieuKien.push("DATE(co.createdAt) = CURDATE()");
  } else if (thoiGian === "tuan_nay") {
    dieuKien.push("YEARWEEK(co.createdAt, 1) = YEARWEEK(CURDATE(), 1)");
  } else if (thoiGian === "thang_nay") {
    dieuKien.push("MONTH(co.createdAt) = MONTH(CURDATE()) AND YEAR(co.createdAt) = YEAR(CURDATE())");
  }

  // Lọc theo loại đơn (custom_design hay ao_mau)
  if (loai === "custom_design") {
    dieuKien.push("oi.designId IS NOT NULL");
  } else if (loai === "ao_mau") {
    dieuKien.push("oi.designId IS NULL");
  }

  // Tìm kiếm theo từ khóa (mã đơn hoặc tên khách)
  if (tuKhoa && tuKhoa.trim()) {
    dieuKien.push("(co.orderCode LIKE ? OR a.fullName LIKE ?)");
    thamSo.push(`%${tuKhoa.trim()}%`, `%${tuKhoa.trim()}%`);
  }

  const menh_de_where = dieuKien.length > 0 ? "WHERE " + dieuKien.join(" AND ") : "";

  // Query đếm tổng số bản ghi (để tính tổng trang)
  const sqlDem = `
    SELECT COUNT(DISTINCT co.id) AS tong_so
    FROM CustomerOrder co
    JOIN Account a ON a.id = co.userId
    LEFT JOIN Payment p ON p.orderId = co.id
    LEFT JOIN OrderItem oi ON oi.orderId = co.id
    ${menh_de_where}
  `;
  const [rowsDem] = await db.pool.query(sqlDem, thamSo);
  const tongSo = rowsDem[0].tong_so;

  // Query lấy dữ liệu trang hiện tại
  const sqlData = `
    SELECT
      co.id,
      co.orderCode,
      co.createdAt,
      co.totalAmount,
      co.status,
      co.shippedAt,
      a.fullName       AS tenKhachHang,
      a.phone          AS sdtKhachHang,
      p.paymentMethod,
      p.status         AS trangThaiThanhToan,
      p.paidAt,
      -- Lấy sản phẩm đầu tiên trong đơn (đơn thường chỉ có 1 loại áo)
      pr.name          AS tenSanPham,
      pv.color         AS mauSac,
      pv.size          AS kichCo,
      pi_img.imageUrl  AS anhUrl,
      oi.designId,
      -- Kiểm tra đơn có nhiều size không
      GROUP_CONCAT(DISTINCT pv.size ORDER BY pv.size SEPARATOR ', ') AS tatCaSize,
      op.status        AS trangThaiSanXuat
    FROM CustomerOrder co
    JOIN Account a ON a.id = co.userId
    LEFT JOIN Payment p ON p.orderId = co.id
    LEFT JOIN OrderItem oi ON oi.orderId = co.id
    LEFT JOIN ProductVariant pv ON pv.id = oi.variantId
    LEFT JOIN Product pr ON pr.id = pv.productId
    LEFT JOIN ProductImage pi_img ON pi_img.productId = pr.id AND pi_img.isPrimary = 1
    LEFT JOIN OrderProduction op ON op.orderItemId = oi.id
    ${menh_de_where}
    GROUP BY co.id, p.id
    ORDER BY co.createdAt DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.pool.query(sqlData, [...thamSo, soMoi, offset]);

  // Định dạng dữ liệu trả về cho Frontend
  const danhSach = rows.map((row) => {
    const loaiDon = row.designId ? "custom_design" : "ao_mau";
    const daThanh = row.trangThaiThanhToan === "COMPLETED";

    return {
      id: row.id,
      maDonHang: row.orderCode,
      ngayTao: formatNgayGio(row.createdAt),
      tenKhachHang: row.tenKhachHang,
      sdtKhachHang: row.sdtKhachHang,
      sanPham: {
        ten: row.tenSanPham || "Sản phẩm",
        loai: loaiDon,
        sizes: row.tatCaSize ? `Cỡ ${row.tatCaSize}` : `Cỡ ${row.kichCo || ""}`,
        anhUrl: row.anhUrl || null,
      },
      tongTienVnd: Number(row.totalAmount),
      thanhToan: {
        phuongThuc: row.paymentMethod || "COD",
        daThanh: daThanh,
      },
      trangThai: MAP_TRANG_THAI_DB_SANG_FE[row.status] || "cho_xac_nhan",
      daXuatThongSoIn: row.trangThaiSanXuat === "PRINTING" || row.trangThaiSanXuat === "PRINTED",
    };
  });

  return {
    danhSach,
    tongSo,
    trang: trangHienTai,
    soMoiTrang: soMoi,
    tongSoTrang: Math.ceil(tongSo / soMoi),
  };
}

// =====================================================================
// SERVICE 3: Lấy chi tiết 1 đơn hàng (dùng cho Drawer)
// =====================================================================
async function layChiTietDonHang(id) {
  // Query đơn hàng + khách hàng + địa chỉ + thanh toán
  const [rowsDonHang] = await db.pool.query(
    `SELECT
       co.*,
       a.fullName   AS tenKhachHang,
       a.phone      AS sdtKhachHang,
       a.email      AS emailKhachHang,
       ua.recipientName,
       ua.phone     AS sdtNhanHang,
       ua.addressLine,
       ua.ward,
       ua.district,
       ua.city,
       p.paymentMethod,
       p.status     AS trangThaiThanhToan,
       p.paidAt
     FROM CustomerOrder co
     JOIN Account a ON a.id = co.userId
     LEFT JOIN UserAddress ua ON ua.id = co.addressId
     LEFT JOIN Payment p ON p.orderId = co.id
     WHERE co.id = ?
     LIMIT 1`,
    [id]
  );

  if (!rowsDonHang || rowsDonHang.length === 0) {
    const err = new Error("Không tìm thấy đơn hàng");
    err.statusCode = 404;
    throw err;
  }

  const donHang = rowsDonHang[0];

  // Query các mục trong đơn (sản phẩm, thiết kế)
  const [rowsItems] = await db.pool.query(
    `SELECT
       oi.id,
       oi.quantity,
       oi.unitPrice,
       oi.designFee,
       oi.lineTotal,
       oi.productionStatus,
       oi.designId,
       pv.color,
       pv.size,
       pr.name AS tenSanPham,
       pi_img.imageUrl AS anhUrl,
       cd.previewUrl AS anhXemTruocThietKe,
       cd.baseColor,
       pp.name AS viTriIn,
       pm.name AS phuongPhapIn
     FROM OrderItem oi
     JOIN ProductVariant pv ON pv.id = oi.variantId
     JOIN Product pr ON pr.id = pv.productId
     LEFT JOIN ProductImage pi_img ON pi_img.productId = pr.id AND pi_img.isPrimary = 1
     LEFT JOIN CustomDesign cd ON cd.id = oi.designId
     LEFT JOIN DesignPrintPosition dpp ON dpp.designId = cd.id
     LEFT JOIN PrintPosition pp ON pp.id = dpp.printPositionId
     LEFT JOIN DesignPrintMethod dpm ON dpm.designId = cd.id
     LEFT JOIN PrintMethod pm ON pm.id = dpm.printMethodId
     WHERE oi.orderId = ?`,
    [id]
  );

  // Lấy item đầu tiên để hiển thị thông tin sản phẩm chính
  const itemDau = rowsItems[0] || {};
  const loaiDon = itemDau.designId ? "custom_design" : "ao_mau";

  // Ghép địa chỉ giao hàng
  const diaChiGiaoHang = donHang.addressLine
    ? [donHang.addressLine, donHang.ward, donHang.district, donHang.city]
        .filter(Boolean)
        .join(", ")
    : "Chưa có địa chỉ";

  // Ghép sizes từ tất cả items
  const tatCaSize = [...new Set(rowsItems.map((i) => i.size).filter(Boolean))].join(", ");

  // Tính tạm tính (subtotal = tổng unitPrice * quantity của các item)
  const tamTinh = rowsItems.reduce((tong, item) => tong + Number(item.unitPrice) * item.quantity, 0);
  const tongPhiThietKe = rowsItems.reduce((tong, item) => tong + Number(item.designFee || 0), 0);

  const thanhToan = {
    phuongThuc: donHang.paymentMethod || "COD",
    daThanh: donHang.trangThaiThanhToan === "COMPLETED",
    paidAt: donHang.paidAt,
    status: donHang.trangThaiThanhToan,
  };

  const timeline = xayDungTimeline(donHang, thanhToan);

  return {
    id: donHang.id,
    maDonHang: donHang.orderCode,
    ngayTao: formatNgayGio(donHang.createdAt),
    tenKhachHang: donHang.tenKhachHang,
    sdtKhachHang: donHang.sdtKhachHang,
    emailKhachHang: donHang.emailKhachHang,
    sanPham: {
      ten: itemDau.tenSanPham || "Sản phẩm",
      loai: loaiDon,
      sizes: tatCaSize ? `Cỡ ${tatCaSize}` : "",
      anhUrl: itemDau.anhUrl || null,
    },
    tongTienVnd: Number(donHang.totalAmount),
    tamTinhVnd: tamTinh,
    phiThietKeVnd: tongPhiThietKe,
    phiVanChuyenVnd: Number(donHang.shippingFee || 0),
    giamGiaVnd: Number(donHang.discountAmount || 0),
    thanhToan,
    trangThai: MAP_TRANG_THAI_DB_SANG_FE[donHang.status] || "cho_xac_nhan",
    diaChiGiaoHang,
    donViVanChuyen: donHang.shippingCarrier || "Chưa có thông tin",
    maVanDon: donHang.trackingCode || null,
    lyDoHuy: donHang.cancelReason || null,
    viTriIn: itemDau.viTriIn || null,
    phuongPhapIn: itemDau.phuongPhapIn || null,
    anhXemTruocThietKe: itemDau.anhXemTruocThietKe || null,
    thoiGianXuLy: timeline,
  };
}

// =====================================================================
// SERVICE 4: Cập nhật trạng thái đơn hàng
// =====================================================================
async function capNhatTrangThai(id, trangThaiFE) {
  // Chuyển từ FE key sang DB status
  const trangThaiDB = MAP_TRANG_THAI_FE_SANG_DB[trangThaiFE];
  if (!trangThaiDB) {
    const err = new Error(`Trạng thái "${trangThaiFE}" không hợp lệ`);
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra đơn hàng tồn tại
  const [rows] = await db.pool.query(
    "SELECT id, status FROM CustomerOrder WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy đơn hàng");
    err.statusCode = 404;
    throw err;
  }

  const donHienTai = rows[0];

  // Không cho phép cập nhật đơn đã hủy hoặc đã hoàn tất
  if (donHienTai.status === "CANCELLED") {
    const err = new Error("Không thể cập nhật đơn hàng đã hủy");
    err.statusCode = 400;
    throw err;
  }
  if (donHienTai.status === "COMPLETED" && trangThaiDB !== "CANCELLED") {
    const err = new Error("Không thể thay đổi trạng thái đơn đã hoàn tất");
    err.statusCode = 400;
    throw err;
  }

  // Cập nhật trạng thái
  const capNhatThem = {};
  if (trangThaiDB === "SHIPPING") {
    capNhatThem.shippedAt = new Date();
  }
  if (trangThaiDB === "COMPLETED") {
    capNhatThem.deliveredAt = new Date();
  }

  await db.pool.query(
    `UPDATE CustomerOrder SET status = ?, ${Object.keys(capNhatThem).map((k) => `${k} = ?`).join(", ")} WHERE id = ?`,
    [trangThaiDB, ...Object.values(capNhatThem), id]
  );

  // Cập nhật productionStatus trong OrderItem nếu cần
  if (["PROCESSING", "PRINTING"].includes(trangThaiDB)) {
    await db.pool.query(
      "UPDATE OrderItem SET productionStatus = ? WHERE orderId = ?",
      [trangThaiDB, id]
    );
  }

  return { id: Number(id), trangThai: trangThaiFE };
}

// =====================================================================
// SERVICE 5: Hủy đơn hàng
// =====================================================================
async function huyDonHang(id, lyDo) {
  // Kiểm tra đơn hàng tồn tại
  const [rows] = await db.pool.query(
    "SELECT id, status FROM CustomerOrder WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy đơn hàng");
    err.statusCode = 404;
    throw err;
  }

  const donHienTai = rows[0];

  // Chỉ hủy được khi đơn đang ở PENDING hoặc CONFIRMED
  const coTheHuy = ["PENDING", "CONFIRMED"].includes(donHienTai.status);
  if (!coTheHuy) {
    const err = new Error(
      "Chỉ có thể hủy đơn hàng đang ở trạng thái Chờ xác nhận hoặc Đã xác nhận"
    );
    err.statusCode = 400;
    throw err;
  }

  await db.pool.query(
    "UPDATE CustomerOrder SET status = 'CANCELLED', cancelReason = ? WHERE id = ?",
    [lyDo || "Không có lý do", id]
  );

  return { id: Number(id), trangThai: "da_huy" };
}

module.exports = {
  layThongKe,
  layDanhSachDonHang,
  layChiTietDonHang,
  capNhatTrangThai,
  huyDonHang,
};
