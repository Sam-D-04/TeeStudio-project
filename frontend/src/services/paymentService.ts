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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function xacThucKetQuaVnpay(
  queryString: string
): Promise<VnpayReturnResult> {
  const response = await fetch(
    `${API_BASE_URL}/payments/vnpay/return?${queryString}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Không thể xác minh kết quả thanh toán");
  }

  const payload = (await response.json()) as {
    success: boolean;
    data: VnpayReturnResult;
  };

  return payload.data;
}
