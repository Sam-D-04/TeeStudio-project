"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Alert, Button, Spin, Tag } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  xacThucKetQuaVnpay,
  type VnpayReturnResult,
} from "@/services/paymentService";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function PaymentInfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-right text-sm font-bold text-text-main">{value}</span>
    </div>
  );
}

export function VnpayReturnLoading() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
      <Spin indicator={<LoadingOutlined spin />} size="large" />
      <div>
        <h1 className="text-xl font-extrabold text-text-main">
          Đang xác minh thanh toán
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          TeeStudio đang kiểm tra kết quả với VNPAY, vui lòng chờ trong giây lát.
        </p>
      </div>
    </div>
  );
}

export default function VnpayReturnPage() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const missingRequiredParams =
    !queryString || !searchParams.get("vnp_SecureHash");
  const [result, setResult] = useState<VnpayReturnResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    if (missingRequiredParams) return;

    xacThucKetQuaVnpay(queryString)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể xác minh kết quả thanh toán."
        );
      });

    return () => {
      active = false;
    };
  }, [missingRequiredParams, queryString]);

  const displayedErrorMessage = missingRequiredParams
    ? "Đường dẫn thanh toán không có đủ dữ liệu xác minh từ VNPAY."
    : errorMessage;

  if (!result && !displayedErrorMessage) {
    return <VnpayReturnLoading />;
  }

  const isSuccessful = Boolean(result?.isSuccessful);
  const isInvalidChecksum = Boolean(result && !result.isValidChecksum);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-lg md:p-8">
      <div className="text-center">
        {isSuccessful ? (
          <CheckCircleFilled className="text-6xl text-success" />
        ) : (
          <CloseCircleFilled className="text-6xl text-error" />
        )}

        <h1 className="mt-5 text-2xl font-extrabold text-text-main md:text-3xl">
          {isSuccessful
            ? "Cảm ơn quý khách đã thanh toán thành công!"
            : "Thanh toán chưa thành công"}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-text-secondary">
          {isSuccessful
            ? "TeeStudio đã ghi nhận giao dịch. Chúng tôi sẽ tiếp tục xử lý đơn hàng của quý khách."
            : "Giao dịch chưa được ghi nhận thành công. Quý khách vui lòng kiểm tra lại hoặc liên hệ TeeStudio để được hỗ trợ."}
        </p>
      </div>

      {displayedErrorMessage ? (
        <Alert
          className="mt-6"
          showIcon
          type="error"
          title="Không thể xác minh giao dịch"
          description={displayedErrorMessage}
        />
      ) : null}

      {isInvalidChecksum ? (
        <Alert
          className="mt-6"
          showIcon
          type="error"
          title="Chữ ký thanh toán không hợp lệ"
          description="Dữ liệu trên đường dẫn không khớp với chữ ký VNPAY. Không nên sử dụng thông tin này để xác nhận đã thanh toán."
        />
      ) : null}

      {result ? (
        <div className="mt-6 rounded-xl border border-border bg-surface-alt px-4">
          <PaymentInfoRow
            label="Mã đơn hàng"
            value={result.orderCode || result.transactionRef || "Chưa xác định"}
          />
          <PaymentInfoRow
            label="Số tiền thanh toán"
            value={formatCurrency(result.amount)}
          />
          <PaymentInfoRow
            label="Trạng thái"
            value={
              <Tag color={isSuccessful ? "green" : "red"} className="m-0">
                {isSuccessful ? "Thanh toán thành công" : "Chưa thành công"}
              </Tag>
            }
          />
          <PaymentInfoRow
            label="Ghi nhận hệ thống"
            value={
              result.databaseStatus === "COMPLETED"
                ? "Đã cập nhật"
                : result.databaseStatus === "FAILED"
                  ? "Đã ghi nhận thất bại"
                  : "Đang đồng bộ qua IPN"
            }
          />
          {result.transactionNo ? (
            <PaymentInfoRow label="Mã giao dịch VNPAY" value={result.transactionNo} />
          ) : null}
          {result.bankCode ? (
            <PaymentInfoRow label="Ngân hàng" value={result.bankCode} />
          ) : null}
          <PaymentInfoRow
            label="Mã phản hồi"
            value={result.responseCode || "Không có"}
          />
        </div>
      ) : null}

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4">
        <SafetyCertificateOutlined className="mt-0.5 text-xl text-primary-container" />
        <p className="text-xs leading-5 text-text-secondary">
          Kết quả trên được xác minh qua backend TeeStudio. Trạng thái thanh toán
          chính thức được cập nhật tự động qua IPN của VNPAY.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button type="primary" href="/" className="h-10 rounded-lg font-semibold">
          Về trang chủ
        </Button>
        <Button href="mailto:hello@teestudio.vn" className="h-10 rounded-lg font-semibold">
          Liên hệ hỗ trợ
        </Button>
      </div>
    </div>
  );
}
