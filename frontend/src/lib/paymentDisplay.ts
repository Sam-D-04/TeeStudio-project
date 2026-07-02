export type PaymentType = "DEPOSIT" | "FULL" | "FULL_PAYMENT" | "COD_FINAL";

type PaymentDisplayInput = {
  method?: string | null;
  paymentType?: string | null;
  status?: string | null;
};

const COMPLETED_STATUSES = new Set([
  "COMPLETED",
  "PAID",
  "da_thanh_toan",
  "da_dat_coc",
]);
const ONLINE_PAYMENT_METHODS = new Set(["VNPAY", "MOMO"]);
const PREPAID_PAYMENT_TYPES = new Set(["FULL", "FULL_PAYMENT", "DEPOSIT"]);
const PENDING_PAYMENT_STATUSES = new Set(["PENDING", "cho_thanh_toan"]);

export function isOrderStatusLockedByPayment({
  method,
  paymentType,
  status,
}: PaymentDisplayInput): boolean {
  return (
    ONLINE_PAYMENT_METHODS.has(method || "") &&
    PREPAID_PAYMENT_TYPES.has(paymentType || "") &&
    PENDING_PAYMENT_STATUSES.has(status || "")
  );
}

export function isDepositPayment(paymentType?: string | null): boolean {
  return paymentType === "DEPOSIT";
}

export function isPaymentCompleted(status?: string | null): boolean {
  return COMPLETED_STATUSES.has(status || "");
}

export function getPaymentMethodLabel({
  method,
  paymentType,
  status,
}: PaymentDisplayInput): string {
  const normalizedMethod = method === "MOMO" ? "MoMo" : method || "COD";

  if (isDepositPayment(paymentType)) {
    return `${normalizedMethod} (Cọc 50%) + COD (50%)`;
  }

  if (
    ["VNPAY", "MOMO"].includes(method || "") &&
    isPaymentCompleted(status)
  ) {
    return `${normalizedMethod} (Đã thanh toán 100%)`;
  }

  return normalizedMethod;
}

export function getOrderPaymentMethodLabel({
  method,
  paymentType,
}: Pick<PaymentDisplayInput, "method" | "paymentType">): string {
  const normalizedMethod = method === "MOMO" ? "MoMo" : method || "COD";

  return isDepositPayment(paymentType)
    ? `${normalizedMethod} + COD`
    : normalizedMethod;
}

export function getOrderPaymentState({
  paymentType,
  status,
}: Pick<PaymentDisplayInput, "paymentType" | "status">): {
  label: string;
  className: string;
  badgeClassName: string;
} {
  if (status === "PENDING_RECONCILIATION" || status === "can_doi_soat") {
    return {
      label: "Chờ đối soát COD",
      className: "text-[#854d0e]",
      badgeClassName: "border border-[#fde047] bg-[#fef9c3] text-[#854d0e]",
    };
  }

  if (isDepositPayment(paymentType)) {
    if (status === "PAID" || status === "da_thanh_toan") {
      return {
        label: "Đã thanh toán 100% · Ban đầu đặt cọc 50%",
        className: "text-[#059669]",
        badgeClassName: "border border-[#86efac] bg-[#dcfce7] text-[#15803d]",
      };
    }

    if (status === "PARTIALLY_PAID" || status === "COMPLETED" || status === "da_dat_coc") {
      return {
        label: "Đã đặt cọc 50% · Còn COD 50%",
        className: "text-[#15803d]",
        badgeClassName: "border border-[#86efac] bg-[#dcfce7] text-[#15803d]",
      };
    }

    if (isPaymentCompleted(status)) {
      return {
        label: "Đã đặt cọc 50% · Còn COD 50%",
        className: "text-[#15803d]",
        badgeClassName: "border border-[#86efac] bg-[#dcfce7] text-[#15803d]",
      };
    }

    return {
      label: "Chờ thanh toán cọc 50%",
      className: "text-[#d97706]",
      badgeClassName: "border border-[#fcd34d] bg-[#fef3c7] text-[#b45309]",
    };
  }

  if (isPaymentCompleted(status)) {
    return {
      label: "Đã thanh toán 100%",
      className: "text-[#059669]",
      badgeClassName: "border border-[#86efac] bg-[#dcfce7] text-[#15803d]",
    };
  }

  return {
    label: "Chờ thanh toán",
    className: "text-[#d97706]",
    badgeClassName: "border border-[#fcd34d] bg-[#fef3c7] text-[#b45309]",
  };
}
