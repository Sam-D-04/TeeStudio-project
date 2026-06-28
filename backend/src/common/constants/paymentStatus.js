/**
 * paymentStatus.js – Hằng số trạng thái thanh toán.
 *
 * Ánh xạ giữa giá trị lưu trong DB (Payment.status) và key hiển thị
 * trên giao diện admin frontend.
 */

const PAYMENT_STATUS = Object.freeze({
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
});

const PAYMENT_METHOD = Object.freeze({
  VNPAY: "VNPAY",
  MOMO: "MOMO",
  COD: "COD",
});

const PAYMENT_TYPE = Object.freeze({
  FULL_PAYMENT: "FULL_PAYMENT",
  DEPOSIT: "DEPOSIT",
  COD_FINAL: "COD_FINAL",
});

/**
 * Chuyển trạng thái DB → key frontend.
 * COD + PENDING → "can_doi_soat" (cần đối soát thủ công).
 * Các trường hợp khác ánh xạ 1-1.
 */
function mapStatusToFrontend(dbStatus, paymentMethod) {
  if (dbStatus === PAYMENT_STATUS.PENDING && paymentMethod === PAYMENT_METHOD.COD) {
    return "can_doi_soat";
  }

  const MAP = {
    [PAYMENT_STATUS.PENDING]: "cho_thanh_toan",
    [PAYMENT_STATUS.COMPLETED]: "da_thanh_toan",
    [PAYMENT_STATUS.FAILED]: "that_bai",
    [PAYMENT_STATUS.CANCELLED]: "that_bai",
  };

  return MAP[dbStatus] || "cho_thanh_toan";
}

/**
 * Chuyển key frontend → mảng trạng thái DB tương ứng (dùng cho WHERE IN).
 */
function mapFrontendToDbStatuses(frontendStatus, paymentMethod) {
  const MAP = {
    cho_thanh_toan: [PAYMENT_STATUS.PENDING],
    da_thanh_toan: [PAYMENT_STATUS.COMPLETED],
    that_bai: [PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED],
    can_doi_soat: [PAYMENT_STATUS.PENDING], // sẽ kèm AND paymentMethod = 'COD'
  };

  return MAP[frontendStatus] || [];
}

module.exports = {
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_TYPE,
  mapStatusToFrontend,
  mapFrontendToDbStatuses,
};
