const { PAYMENT_METHOD, PAYMENT_STATUS } = require("../../../common/constants/paymentStatus");
const {
  truyVanGiaoDichMomo,
  laGiaoDichMomoThanhCong,
  laGiaoDichMomoDangXuLy,
} = require("../momo.service");

function parseMomoResponseTime(value) {
  const timestamp = Number(value);
  const date = Number.isFinite(timestamp) ? new Date(timestamp) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function createMomoReconciliationStrategy({
  queryTransaction = truyVanGiaoDichMomo,
} = {}) {
  return Object.freeze({
    paymentMethod: PAYMENT_METHOD.MOMO,

    async reconcile(payment) {
      const result = await queryTransaction({
        transactionRef: payment.transactionId,
      });

      if (String(result.orderId || "") !== String(payment.transactionId)) {
        throw new Error("Mã giao dịch MoMo đối soát không khớp");
      }

      const isSuccessful = laGiaoDichMomoThanhCong(result.resultCode);
      const isPending = laGiaoDichMomoDangXuLy(result.resultCode);
      const hasAmount = result.amount !== undefined && result.amount !== null;

      // Phản hồi lỗi cuối cùng (ví dụ 1005: hết hạn/không tồn tại) của MoMo
      // không có amount. Chỉ bắt buộc amount với giao dịch thành công hoặc còn xử lý.
      if ((isSuccessful || isPending) && !hasAmount) {
        throw new Error("Phản hồi đối soát MoMo thiếu số tiền giao dịch");
      }

      if (hasAmount && Number(result.amount) !== Number(payment.amount)) {
        throw new Error("Số tiền giao dịch MoMo đối soát không khớp");
      }

      if (isSuccessful) {
        return {
          nextStatus: PAYMENT_STATUS.COMPLETED,
          paidAt: parseMomoResponseTime(result.responseTime),
          gatewayResult: result,
        };
      }

      return {
        nextStatus: isPending
          ? PAYMENT_STATUS.PENDING
          : PAYMENT_STATUS.FAILED,
        paidAt: null,
        gatewayResult: result,
      };
    },
  });
}

module.exports = {
  createMomoReconciliationStrategy,
  momoReconciliationStrategy: createMomoReconciliationStrategy(),
};
