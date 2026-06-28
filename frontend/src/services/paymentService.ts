import axios from "axios";
import apiClient from "@/lib/apiClient";

export type OnlinePaymentGateway = "VNPAY" | "MOMO";

export type OnlinePaymentReturnResult = {
  gateway: OnlinePaymentGateway;
  isValidChecksum: boolean;
  isSuccessful: boolean;
  responseCode: string;
  transactionStatus: string;
  transactionRef: string;
  transactionNo: string;
  bankCode: string;
  orderCode: string | null;
  amount: number;
  paymentType: string | null;
  databaseStatus: string | null;
  paidAt: string | null;
};

export async function xacThucKetQuaThanhToan(
  gateway: OnlinePaymentGateway,
  queryString: string
): Promise<OnlinePaymentReturnResult> {
  const response = await apiClient.get<{
    success: boolean;
    data: OnlinePaymentReturnResult;
  }>(`/payments/${gateway.toLowerCase()}/return?${queryString}`);

  return response.data.data;
}

export function isPaymentVerificationConnectionError(error: unknown) {
  if (!axios.isAxiosError(error)) return false;

  return (
    !error.response ||
    ["ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK"].includes(error.code || "")
  );
}
