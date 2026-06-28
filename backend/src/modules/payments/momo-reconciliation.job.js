const db = require("../../database/mysql");
const {
  truyVanGiaoDichMomo,
  laGiaoDichMomoThanhCong,
  laGiaoDichMomoDangXuLy,
} = require("./momo.service");

const INTERVAL_MS = 15 * 60 * 1000;
let isRunning = false;

function mergeGatewayResponse(currentResponse, queryResult) {
  try {
    const current = typeof currentResponse === "string"
      ? JSON.parse(currentResponse)
      : currentResponse;
    return JSON.stringify({ ...(current || {}), ...queryResult, source: "query" });
  } catch {
    return JSON.stringify({ ...queryResult, source: "query" });
  }
}

function parseResponseTime(value) {
  const timestamp = Number(value);
  const date = Number.isFinite(timestamp) ? new Date(timestamp) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function doiSoatThanhToanMomo() {
  if (isRunning) return;
  isRunning = true;

  try {
    const [payments] = await db.pool.query(
      `SELECT id, amount, transactionId, gatewayResponse
       FROM Payment
       WHERE status = 'PENDING'
         AND paymentMethod = 'MOMO'
         AND transactionId IS NOT NULL
         AND createdAt <= DATE_SUB(NOW(), INTERVAL 15 MINUTE)`
    );

    let completed = 0;
    for (const payment of payments) {
      try {
        const result = await truyVanGiaoDichMomo({
          transactionRef: payment.transactionId,
        });
        const amountMatches = Number(result.amount) === Number(payment.amount);

        if (!amountMatches) {
          console.error(`[MOMO] Số tiền đối soát không khớp: ${payment.transactionId}`);
          continue;
        }

        if (laGiaoDichMomoThanhCong(result.resultCode)) {
          const [update] = await db.pool.query(
            `UPDATE Payment
             SET status = 'COMPLETED', paidAt = ?, gatewayResponse = ?
             WHERE id = ? AND status = 'PENDING'`,
            [
              parseResponseTime(result.responseTime),
              mergeGatewayResponse(payment.gatewayResponse, result),
              payment.id,
            ]
          );
          completed += update.affectedRows;
        } else if (laGiaoDichMomoDangXuLy(result.resultCode)) {
          await db.pool.query(
            `UPDATE Payment SET gatewayResponse = ? WHERE id = ? AND status = 'PENDING'`,
            [mergeGatewayResponse(payment.gatewayResponse, result), payment.id]
          );
        } else {
          await db.pool.query(
            `UPDATE Payment
             SET status = 'FAILED', gatewayResponse = ?
             WHERE id = ? AND status = 'PENDING'`,
            [mergeGatewayResponse(payment.gatewayResponse, result), payment.id]
          );
        }
      } catch (error) {
        console.error(
          `[MOMO] Không thể đối soát ${payment.transactionId}:`,
          error.message
        );
      }
    }

    if (payments.length > 0) {
      console.log(
        `[MOMO] Đã quét ${payments.length} giao dịch treo, cập nhật ${completed} giao dịch thành công.`
      );
    }
  } catch (error) {
    console.error("[MOMO] Tiến trình đối soát thất bại:", error.message);
  } finally {
    isRunning = false;
  }
}

function startMomoReconciliationJob() {
  void doiSoatThanhToanMomo();
  const timer = setInterval(doiSoatThanhToanMomo, INTERVAL_MS);
  timer.unref();
  console.log("[MOMO] Đã bắt đầu đối soát và lên lịch chạy lại mỗi 15 phút.");
}

module.exports = { doiSoatThanhToanMomo, startMomoReconciliationJob };
