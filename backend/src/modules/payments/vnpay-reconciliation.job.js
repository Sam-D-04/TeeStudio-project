const db = require("../../database/mysql");
const { truyVanGiaoDichVnpay } = require("./vnpay.service");

const INTERVAL_MS = 15 * 60 * 1000; // 15 phút
let isRunning = false;

function getTransactionDate(payment) {
  try {
    const gateway = JSON.parse(payment.gatewayResponse || "{}");
    if (gateway.transactionDate) return gateway.transactionDate;
    return new URL(gateway.paymentUrl).searchParams.get("vnp_CreateDate") || payment.createdAt;
  } catch {
    return payment.createdAt;
  }
}

function parseVnpayDate(value) {
  const match = String(value || "").match(
    /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/
  );
  return match
    ? new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}+07:00`)
    : new Date();
}

async function doiSoatThanhToanVnpay() {
  if (isRunning) return;
  isRunning = true;

  console.log(`\n[${new Date().toLocaleTimeString()}] --- BẮT ĐẦU QUÉT ĐƠN TREO VNPAY ---`);

  try {
    const [payments] = await db.pool.query(
      `SELECT id, amount, transactionId, gatewayResponse, createdAt
       FROM Payment
       WHERE status = 'PENDING'
         AND paymentMethod = 'VNPAY'
         AND transactionId IS NOT NULL
         AND createdAt <= DATE_SUB(NOW(), INTERVAL 15 MINUTE)`
    );
    // 15 phút

    console.log(`[VNPAY] Tìm thấy ${payments.length} đơn hàng đang treo (PENDING).`);

    let completed = 0;
    for (const payment of payments) {
      try {
        console.log(`>> Đang gọi QueryDR cho mã giao dịch: ${payment.transactionId}...`);

        const result = await truyVanGiaoDichVnpay({
          transactionRef: payment.transactionId,
          transactionDate: getTransactionDate(payment),
        });

        console.log(`<< Phản hồi từ VNPAY cho mã ${payment.transactionId} | Mã lỗi (ResponseCode): ${result.vnp_ResponseCode}`);

        const isSuccessful =
          result.vnp_ResponseCode === "00" &&
          result.vnp_TransactionStatus === "00" &&
          result.vnp_TxnRef === payment.transactionId &&
          Number(result.vnp_Amount) === Math.round(Number(payment.amount) * 100);

        if (isSuccessful) {
          const [update] = await db.pool.query(
            `UPDATE Payment
             SET status = 'COMPLETED', paidAt = ?, gatewayResponse = ?
             WHERE id = ? AND status = 'PENDING'`,
            [parseVnpayDate(result.vnp_PayDate), JSON.stringify(result), payment.id]
          );
          completed += update.affectedRows;

          console.log(`==> Đã cập nhật thành công giao dịch ${payment.transactionId} vào cơ sở dữ liệu.`);
        } else if (result.vnp_ResponseCode === "91") {
          console.log(`-- VNPAY chưa ghi nhận giao dịch ${payment.transactionId} (mã 91).`);
        } else {
          console.log(`-- Giao dịch ${payment.transactionId} chưa thành công (${result.vnp_ResponseCode}: ${result.vnp_Message || "Không có mô tả"}).`);
        }
      } catch (error) {
        console.error(`[VNPAY] Không thể đối soát ${payment.transactionId}:`, error.message);
      }
    }

    if (payments.length > 0) {
      console.log(`[VNPAY] Đã quét ${payments.length} giao dịch treo, cập nhật ${completed} giao dịch.`);
    }
  } catch (error) {
    console.error("[VNPAY] Tiến trình đối soát thất bại:", error.message);
  } finally {
    isRunning = false;
  }
}

function startVnpayReconciliationJob() {
  void doiSoatThanhToanVnpay();
  const timer = setInterval(doiSoatThanhToanVnpay, INTERVAL_MS);
  timer.unref();
  console.log("[VNPAY] Đã bắt đầu đối soát và lên lịch chạy lại mỗi 15 phút.");
}

module.exports = { doiSoatThanhToanVnpay, startVnpayReconciliationJob };
