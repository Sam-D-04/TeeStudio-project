const { PAYMENT_METHOD, PAYMENT_STATUS } = require("../../../common/constants/paymentStatus");
const { truyVanGiaoDichVnpay } = require("../vnpay.service");

function parseGatewayResponse(gatewayResponse) {
  if (!gatewayResponse) return {};
  if (typeof gatewayResponse === "object") return gatewayResponse;

  try {
    return JSON.parse(gatewayResponse);
  } catch {
    return {};
  }
}

function getTransactionDate(payment) {
  const gatewayResponse = parseGatewayResponse(payment.gatewayResponse);
  if (gatewayResponse.transactionDate) return gatewayResponse.transactionDate;

  try {
    const createDate = new URL(gatewayResponse.paymentUrl).searchParams.get(
      "vnp_CreateDate"
    );
    return createDate || payment.createdAt;
  } catch {
    return payment.createdAt;
  }
}

function parseVnpayDate(value) {
  const match = String(value || "").match(
    /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/
  );
  if (!match) return new Date();

  const date = new Date(
    `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}+07:00`
  );
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function createVnpayReconciliationStrategy({
  queryTransaction = truyVanGiaoDichVnpay,
} = {}) {
  return Object.freeze({
    paymentMethod: PAYMENT_METHOD.VNPAY,

    async reconcile(payment) {
      const result = await queryTransaction({
        transactionRef: payment.transactionId,
        transactionDate: getTransactionDate(payment),
      });
      const responseCode = String(result.vnp_ResponseCode || "");

      // ResponseCode phản ánh kết quả gọi QueryDR, không phải trạng thái giao dịch.
      // Khi QueryDR chưa trả kết quả hợp lệ, giữ PENDING để thử lại ở chu kỳ sau.
      if (responseCode !== "00") {
        return {
          nextStatus: PAYMENT_STATUS.PENDING,
          paidAt: null,
          gatewayResult: result,
        };
      }

      if (String(result.vnp_TxnRef || "") !== String(payment.transactionId)) {
        throw new Error("Mã giao dịch VNPAY đối soát không khớp");
      }

      const expectedAmount = Math.round(Number(payment.amount) * 100);
      if (
        !Number.isSafeInteger(expectedAmount) ||
        Number(result.vnp_Amount) !== expectedAmount
      ) {
        throw new Error("Số tiền giao dịch VNPAY đối soát không khớp");
      }

      const transactionStatus = String(result.vnp_TransactionStatus || "");
      if (transactionStatus === "00") {
        return {
          nextStatus: PAYMENT_STATUS.COMPLETED,
          paidAt: parseVnpayDate(result.vnp_PayDate),
          gatewayResult: result,
        };
      }

      return {
        // 01 là giao dịch chưa hoàn tất; các mã còn lại là kết quả cuối không thành công.
        nextStatus:
          transactionStatus === "01"
            ? PAYMENT_STATUS.PENDING
            : PAYMENT_STATUS.FAILED,
        paidAt: null,
        gatewayResult: result,
      };
    },
  });
}

module.exports = {
  createVnpayReconciliationStrategy,
  vnpayReconciliationStrategy: createVnpayReconciliationStrategy(),
};
