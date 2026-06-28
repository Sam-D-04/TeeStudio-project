"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  SafetyCertificateOutlined,
  WarningFilled,
} from "@ant-design/icons";
import { Alert, Button, Spin, Tag } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  isVnpayVerificationConnectionError,
  xacThucKetQuaVnpay,
  type VnpayReturnResult,
} from "@/services/paymentService";

const BANK_REJECT_CODES = new Set([
  "09",
  "10",
  "11",
  "12",
  "13",
  "51",
  "65",
  "75",
  "79",
]);
const UNCERTAIN_CODES = new Set(["07", "99"]);

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
  const [hasConnectionError, setHasConnectionError] = useState(false);

  useEffect(() => {
    let active = true;

    if (missingRequiredParams) return;

    xacThucKetQuaVnpay(queryString)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (isVnpayVerificationConnectionError(error)) {
          setHasConnectionError(true);
          return;
        }
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

  if (!result && !displayedErrorMessage && !hasConnectionError) {
    return <VnpayReturnLoading />;
  }

  const responseCode = result?.responseCode || searchParams.get("vnp_ResponseCode") || "";
  const isSuccessful = Boolean(
    result?.isSuccessful || result?.databaseStatus === "COMPLETED"
  );
  const isInvalidChecksum = Boolean(result && !result.isValidChecksum);
  const isUncertain =
    !isSuccessful &&
    (hasConnectionError || UNCERTAIN_CODES.has(responseCode));
  const isCancelled = Boolean(
    !isUncertain && result?.isValidChecksum && responseCode === "24"
  );
  const isBankRejected = Boolean(
    !isUncertain && result?.isValidChecksum && BANK_REJECT_CODES.has(responseCode)
  );
  const canRetry = isCancelled || isBankRejected;
  const title = isSuccessful
    ? "Cảm ơn quý khách đã thanh toán thành công!"
    : isUncertain
      ? "Trạng thái giao dịch đang được xác minh"
      : isCancelled
        ? "Bạn đã hủy giao dịch thanh toán"
        : isBankRejected
          ? "Giao dịch thất bại do tài khoản không đủ số dư hoặc thẻ bị từ chối"
          : "Không thể xác minh giao dịch";
  const description = isSuccessful
    ? "TeeStudio đã ghi nhận giao dịch. Chúng tôi sẽ tiếp tục xử lý đơn hàng của quý khách."
    : isCancelled
      ? "Giao dịch đã được hủy theo yêu cầu của quý khách. Quý khách có thể thực hiện thanh toán lại."
      : isBankRejected
        ? "Vui lòng kiểm tra số dư, hạn mức hoặc sử dụng thẻ và tài khoản ngân hàng khác."
        : isUncertain
          ? "TeeStudio chưa thể kết luận giao dịch thất bại và sẽ tiếp tục kiểm tra tự động."
          : "Dữ liệu giao dịch chưa thể được xác minh. Quý khách vui lòng liên hệ TeeStudio để được hỗ trợ.";
  const statusLabel = isSuccessful
    ? "Thanh toán thành công"
    : isUncertain
      ? "Đang đối soát"
      : isCancelled
        ? "Đã hủy"
        : "Thất bại";

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-lg md:p-8">
      <div className="text-center">
        {isSuccessful ? (
          <CheckCircleFilled className="text-6xl text-success" />
        ) : isUncertain ? (
          <WarningFilled className="text-6xl text-warning" />
        ) : (
          <CloseCircleFilled className="text-6xl text-error" />
        )}

        <h1 className="mt-5 text-2xl font-extrabold text-text-main md:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>

      {isUncertain ? (
        <Alert
          className="mt-6"
          showIcon
          type="warning"
          title="Giao dịch đang được xử lý hoặc bị gián đoạn do kết nối mạng!"
          description={
            <div className="space-y-2">
              <p>
                Nếu quý khách đã bị trừ tiền trong ứng dụng ngân hàng, xin vui
                lòng <strong>KHÔNG thanh toán lại</strong>. Hệ thống sẽ tự động
                đối soát và cập nhật trạng thái đơn hàng trong ít phút tới.
              </p>
              <p>
                Quý khách có thể kiểm tra lại trạng thái tại mục Lịch sử đơn
                hàng hoặc liên hệ bộ phận hỗ trợ của TeeStudio.
              </p>
            </div>
          }
        />
      ) : null}

      {displayedErrorMessage && !isUncertain ? (
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
              <Tag
                color={isSuccessful ? "green" : isUncertain ? "orange" : "red"}
                className="m-0"
              >
                {statusLabel}
              </Tag>
            }
          />
          <PaymentInfoRow
            label="Ghi nhận hệ thống"
            value={
              result.databaseStatus === "COMPLETED"
                ? "Đã cập nhật"
                : isUncertain
                  ? "Đang chờ đối soát tự động"
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
          chính thức được cập nhật tự động qua IPN và tiến trình đối soát VNPAY.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {canRetry ? (
          <Button
            type="primary"
            onClick={() => window.history.back()}
            className="h-10 rounded-lg font-semibold"
          >
            Thanh toán lại
          </Button>
        ) : null}
        <Button
          type={isUncertain ? "primary" : canRetry ? "default" : "primary"}
          href={isUncertain ? "mailto:hello@teestudio.vn" : "/"}
          className="h-10 rounded-lg font-semibold"
        >
          {isUncertain ? "Liên hệ hỗ trợ" : "Về trang chủ"}
        </Button>
        {!isUncertain && !canRetry ? (
          <Button
            href="mailto:hello@teestudio.vn"
            className="h-10 rounded-lg font-semibold"
          >
            Liên hệ hỗ trợ
          </Button>
        ) : null}
      </div>
    </div>
  );
}
