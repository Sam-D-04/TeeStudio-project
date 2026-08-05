const db = require("../../database/mysql");
const { huyDonHang } = require("./admin.order.service");

// Hủy đơn tự động sau 24 giờ
const AUTO_CANCEL_INTERVAL_MS = 60 * 60 * 1000; // 1 giờ chạy 1 lần
const HOURS_BEFORE_CANCEL = 24;

function createCancelUnpaidOrdersJob({
  pool = db.pool,
  logger = console,
  intervalMs = AUTO_CANCEL_INTERVAL_MS,
  hoursBeforeCancel = HOURS_BEFORE_CANCEL,
} = {}) {
  let isRunning = false;
  let timer = null;

  async function cancelUnpaidOrders() {
    if (isRunning) {
      logger.warn("[AUTO-CANCEL] Bỏ qua vì chu kỳ trước vẫn đang chạy.");
      return;
    }

    isRunning = true;
    let canceledCount = 0;
    let errorCount = 0;

    try {
      // Chỉ lấy các đơn:
      // - Đang ở trạng thái PENDING
      // - Có paymentStatus PENDING
      // - Quá hạn (createdAt <= NOW - 24 hours)
      // - Bắt buộc phải có thanh toán online PENDING (loại trừ COD vì COD không thanh toán trước)
      const [orders] = await pool.query(
        `SELECT DISTINCT co.id 
         FROM CustomerOrder co
         JOIN Payment p ON p.orderId = co.id
         WHERE co.status = 'PENDING'
           AND co.paymentStatus = 'PENDING'
           AND p.status = 'PENDING'
           AND p.paymentMethod IN ('VNPAY', 'MOMO')
           AND co.createdAt <= DATE_SUB(NOW(), INTERVAL ? HOUR)`,
        [hoursBeforeCancel]
      );

      for (const order of orders) {
        try {
          await huyDonHang(
            order.id, 
            `Hủy tự động do quá hạn thanh toán ${hoursBeforeCancel} giờ`, 
            "System"
          );
          canceledCount++;
        } catch (err) {
          logger.error(`[AUTO-CANCEL] Lỗi hủy đơn ID=${order.id}:`, err.message);
          errorCount++;
        }
      }

      if (orders.length > 0) {
        logger.info(`[AUTO-CANCEL] Đã xử lý ${orders.length} đơn rác. Hủy thành công: ${canceledCount}, Lỗi: ${errorCount}.`);
      }
    } catch (error) {
      logger.error("[AUTO-CANCEL] Lỗi khi quét đơn hàng chưa thanh toán:", error);
    } finally {
      isRunning = false;
    }
  }

  function start() {
    if (timer) return;
    logger.info(`[AUTO-CANCEL] Khởi động job hủy đơn rác sau ${hoursBeforeCancel}h, chu kỳ ${intervalMs}ms`);
    timer = setInterval(cancelUnpaidOrders, intervalMs);
    // Chạy ngay lần đầu
    setImmediate(cancelUnpaidOrders);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
      logger.info("[AUTO-CANCEL] Đã dừng job hủy đơn rác");
    }
  }

  return { start, stop };
}

let defaultJob = null;
function startCancelUnpaidOrdersJob() {
  if (!defaultJob) {
    defaultJob = createCancelUnpaidOrdersJob();
    defaultJob.start();
  }
  return defaultJob;
}

module.exports = {
  createCancelUnpaidOrdersJob,
  startCancelUnpaidOrdersJob,
};
