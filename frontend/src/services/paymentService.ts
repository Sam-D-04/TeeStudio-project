import axios from "axios";
import apiClient from "@/lib/apiClient";

export type VnpayReturnResult = {
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

export async function xacThucKetQuaVnpay(
  queryString: string
): Promise<VnpayReturnResult> {
  const response = await apiClient.get<{
    success: boolean;
    data: VnpayReturnResult;
  }>(`/payments/vnpay/return?${queryString}`);

  return response.data.data;
}

export function isVnpayVerificationConnectionError(error: unknown) {
  if (!axios.isAxiosError(error)) return false;

  return (
    !error.response ||
    ["ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK"].includes(error.code || "")
  );
}
