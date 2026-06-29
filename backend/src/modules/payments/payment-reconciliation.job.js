const db = require("../../database/mysql");
const { PAYMENT_STATUS } = require("../../common/constants/paymentStatus");
const {
  PAYMENT_RECONCILIATION_STRATEGIES,
} = require("./reconciliation/payment-reconciliation.strategies");

const RECONCILIATION_INTERVAL_MS = 15 * 60 * 1000;
const MINIMUM_PAYMENT_AGE_MINUTES = 15;
const ALLOWED_NEXT_STATUSES = new Set([
  PAYMENT_STATUS.PENDING,
  PAYMENT_STATUS.COMPLETED,
  PAYMENT_STATUS.FAILED,
]);

function parseGatewayResponse(gatewayResponse) {
  if (!gatewayResponse) return {};
  if (typeof gatewayResponse === "object") return gatewayResponse;

  try {
    return JSON.parse(gatewayResponse);
  } catch {
    return {};
  }
}

function mergeGatewayResponse(currentResponse, gatewayResult, checkedAt) {
  return JSON.stringify({
    ...parseGatewayResponse(currentResponse),
    ...(gatewayResult || {}),
    source: "query",
    lastReconciledAt: checkedAt.toISOString(),
  });
}

function normalizeOutcome(outcome) {
  if (!outcome || !ALLOWED_NEXT_STATUSES.has(outcome.nextStatus)) {
    throw new Error("Strategy đối soát trả về trạng thái không hợp lệ");
  }

  let paidAt = null;
  if (outcome.nextStatus === PAYMENT_STATUS.COMPLETED) {
    paidAt = outcome.paidAt instanceof Date
      ? outcome.paidAt
      : new Date(outcome.paidAt);
    if (Number.isNaN(paidAt.getTime())) {
      throw new Error("Strategy đối soát trả về thời gian thanh toán không hợp lệ");
    }
  }

  return { ...outcome, paidAt };
}

function createPaymentReconciliationJob({
  pool = db.pool,
  strategies = PAYMENT_RECONCILIATION_STRATEGIES,
  logger = console,
  intervalMs = RECONCILIATION_INTERVAL_MS,
  minimumPaymentAgeMinutes = MINIMUM_PAYMENT_AGE_MINUTES,
} = {}) {
  const paymentMethods = Object.keys(strategies);
  if (paymentMethods.length === 0) {
    throw new Error("Cần đăng ký ít nhất một strategy đối soát thanh toán");
  }
  if (!Number.isSafeInteger(minimumPaymentAgeMinutes) || minimumPaymentAgeMinutes < 0) {
    throw new Error("Thời gian chờ đối soát không hợp lệ");
  }

  let isRunning = false;
  let timer = null;

  async function doiSoatThanhToanOnline() {
    if (isRunning) {
      logger.warn("[PAYMENT-RECONCILIATION] Bỏ qua vì chu kỳ trước vẫn đang chạy.");
      return { skipped: true, scanned: 0, updated: 0, errors: 0 };
    }

    isRunning = true;
    const summary = {
      skipped: false,
      scanned: 0,
      updated: 0,
      errors: 0,
      completed: 0,
      failed: 0,
      pending: 0,
    };

    try {
      const methodPlaceholders = paymentMethods.map(() => "?").join(", ");
      const [payments] = await pool.query(
        `SELECT id, amount, paymentMethod, transactionId, gatewayResponse, createdAt
         FROM Payment
         WHERE status = 'PENDING'
           AND paymentMethod IN (${methodPlaceholders})
           AND transactionId IS NOT NULL
           AND createdAt <= DATE_SUB(NOW(), INTERVAL ${minimumPaymentAgeMinutes} MINUTE)
         ORDER BY createdAt ASC, id ASC`,
        paymentMethods
      );

      summary.scanned = payments.length;

      for (const payment of payments) {
        const strategy = strategies[payment.paymentMethod];
        if (!strategy) {
          summary.errors += 1;
          logger.error(
            `[PAYMENT-RECONCILIATION] Chưa đăng ký strategy cho ${payment.paymentMethod}.`
          );
          continue;
        }

        try {
          const checkedAt = new Date();
          const outcome = normalizeOutcome(await strategy.reconcile(payment));
          const [updateResult] = await pool.query(
            `UPDATE Payment
             SET status = ?, paidAt = ?, gatewayResponse = ?
             WHERE id = ?
               AND status = 'PENDING'
               AND paymentMethod = ?
               AND transactionId = ?`,
            [
              outcome.nextStatus,
              outcome.paidAt,
              mergeGatewayResponse(
                payment.gatewayResponse,
                outcome.gatewayResult,
                checkedAt
              ),
              payment.id,
              payment.paymentMethod,
              payment.transactionId,
            ]
          );

          if (updateResult.affectedRows > 0) {
            summary[outcome.nextStatus.toLowerCase()] += 1;
            if (outcome.nextStatus !== PAYMENT_STATUS.PENDING) {
              summary.updated += 1;
            }
          }
        } catch (error) {
          summary.errors += 1;
          logger.error(
            `[${payment.paymentMethod}] Không thể đối soát ${payment.transactionId}:`,
            error.message
          );
        }
      }

      if (summary.scanned > 0) {
        logger.log(
          `[PAYMENT-RECONCILIATION] Đã quét ${summary.scanned}, cập nhật trạng thái ${summary.updated}, còn chờ ${summary.pending}, lỗi ${summary.errors}.`
        );
      }
    } catch (error) {
      summary.errors += 1;
      logger.error("[PAYMENT-RECONCILIATION] Tiến trình đối soát thất bại:", error.message);
    } finally {
      isRunning = false;
    }

    return summary;
  }

  function startPaymentReconciliationJob() {
    if (timer) return timer;

    void doiSoatThanhToanOnline();
    timer = setInterval(doiSoatThanhToanOnline, intervalMs);
    timer.unref();
    logger.log(
      `[PAYMENT-RECONCILIATION] Đã lên lịch đối soát VNPAY/MOMO mỗi ${intervalMs / 60000} phút.`
    );
    return timer;
  }

  function stopPaymentReconciliationJob() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  return {
    doiSoatThanhToanOnline,
    startPaymentReconciliationJob,
    stopPaymentReconciliationJob,
  };
}

const paymentReconciliationJob = createPaymentReconciliationJob();

module.exports = {
  createPaymentReconciliationJob,
  doiSoatThanhToanOnline: paymentReconciliationJob.doiSoatThanhToanOnline,
  startPaymentReconciliationJob:
    paymentReconciliationJob.startPaymentReconciliationJob,
  stopPaymentReconciliationJob:
    paymentReconciliationJob.stopPaymentReconciliationJob,
};
