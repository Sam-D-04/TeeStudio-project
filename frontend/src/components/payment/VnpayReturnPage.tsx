"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  SafetyCertificateOutlined,
  WarningFilled,
} from "@ant-design/icons";
import { Alert, Button, Spin, Tag, Modal } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  isPaymentVerificationConnectionError,
  xacThucKetQuaThanhToan,
  type OnlinePaymentGateway,
  type OnlinePaymentReturnResult,
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
const MOMO_UNCERTAIN_CODES = new Set(["10", "43", "1000", "7000", "7002"]);
const MOMO_CANCELLED_CODES = new Set(["1006", "1017"]);

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

export function PaymentReturnLoading() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
      <Spin indicator={<LoadingOutlined spin />} size="large" />
      <div>
        <h1 className="text-xl font-extrabold text-text-main">
          Đang xác minh thanh toán
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          TeeStudio đang kiểm tra kết quả với cổng thanh toán, vui lòng chờ trong giây lát.
        </p>
      </div>
    </div>
  );
}

export default function OnlinePaymentReturnPage() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const detectedGateway: OnlinePaymentGateway = searchParams.get("partnerCode")
    ? "MOMO"
    : "VNPAY";
  const gatewayName = detectedGateway === "MOMO" ? "MoMo" : "VNPAY";
  const missingRequiredParams = !queryString ||
    (detectedGateway === "MOMO"
      ? !searchParams.get("signature") || !searchParams.get("orderId")
      : !searchParams.get("vnp_SecureHash"));
  // Đơn COD (thanh toán khi nhận hàng) không đi qua cổng VNPAY/MoMo nên không
  // có chữ ký để xác minh — checkout.tsx redirect thẳng về đây với method=COD,
  // phải nhận diện riêng để không rơi vào nhánh "thiếu dữ liệu xác minh".
  const isCodOrder = searchParams.get("method") === "COD";
  const codOrderCode = searchParams.get("orderCode");
  const [result, setResult] = useState<OnlinePaymentReturnResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    let active = true;

    if (missingRequiredParams || isCodOrder) return;

    xacThucKetQuaThanhToan(detectedGateway, queryString)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (isPaymentVerificationConnectionError(error)) {
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
  }, [detectedGateway, missingRequiredParams, isCodOrder, queryString]);

  if (isCodOrder) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-lg md:p-8">
        <div className="text-center">
          <CheckCircleFilled className="text-6xl text-success" />
          <h1 className="mt-5 text-2xl font-extrabold text-text-main md:text-3xl">
            Đặt hàng thành công!
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-text-secondary">
            TeeStudio đã ghi nhận đơn hàng của quý khách và sẽ xử lý trong thời
            gian sớm nhất. Quý khách vui lòng thanh toán khi nhận được hàng
            (COD).
          </p>
        </div>

        {codOrderCode ? (
          <div className="mt-6 rounded-xl border border-border bg-surface-alt px-4">
            <PaymentInfoRow label="Mã đơn hàng" value={codOrderCode} />
            <PaymentInfoRow
              label="Phương thức thanh toán"
              value="Thanh toán khi nhận hàng (COD)"
            />
            <PaymentInfoRow
              label="Trạng thái"
              value={
                <Tag color="green" className="m-0">
                  Chờ xác nhận
                </Tag>
              }
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="primary"
            href="/tai-khoan/don-hang"
            className="h-10 rounded-lg font-semibold"
          >
            Xem đơn hàng của tôi
          </Button>
          <Button href="/" className="h-10 rounded-lg font-semibold">
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const displayedErrorMessage = missingRequiredParams
    ? `Đường dẫn thanh toán không có đủ dữ liệu xác minh từ ${gatewayName}.`
    : errorMessage;

  if (!result && !displayedErrorMessage && !hasConnectionError) {
    return <PaymentReturnLoading />;
  }

  const responseCode = result?.responseCode ||
    searchParams.get(
      detectedGateway === "MOMO" ? "resultCode" : "vnp_ResponseCode"
    ) || "";
  const isSuccessful = Boolean(
    result?.isSuccessful || result?.databaseStatus === "COMPLETED"
  );
  const isInvalidChecksum = Boolean(result && !result.isValidChecksum);
  const isUncertain =
    !isSuccessful &&
    (hasConnectionError ||
      (detectedGateway === "MOMO"
        ? MOMO_UNCERTAIN_CODES.has(responseCode)
        : UNCERTAIN_CODES.has(responseCode)));
  const isCancelled = Boolean(
    !isUncertain &&
    result?.isValidChecksum &&
    (detectedGateway === "MOMO"
      ? MOMO_CANCELLED_CODES.has(responseCode)
      : responseCode === "24")
  );
  const isBankRejected = Boolean(
    !isUncertain &&
    result?.isValidChecksum &&
    (detectedGateway === "MOMO"
      ? Boolean(responseCode) &&
      !["0", "9000"].includes(responseCode) &&
      !isCancelled &&
      !isSuccessful
      : BANK_REJECT_CODES.has(responseCode))
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
      ? "Giao dịch đã được hủy theo yêu cầu của quý khách. Quý khách vui lòng liên hệ TeeStudio để được tạo lại mã thanh toán."
      : isBankRejected
        ? "Vui lòng liên hệ TeeStudio để được hỗ trợ tạo lại mã thanh toán bằng thẻ/tài khoản khác."
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

  const showContact = () => {
    modal.info({
      title: "Liên hệ bộ phận hỗ trợ TeeStudio",
      content: (
        <div className="mt-3">
          <p className="mb-2 text-sm">Quý khách vui lòng liên hệ qua các kênh sau để được hỗ trợ xử lý giao dịch:</p>
          <ul className="ml-4 list-disc space-y-1 text-sm">
            <li><strong>Hotline / Zalo:</strong> 0901 234 567</li>
            <li><strong>Email:</strong> teestudiocompany@gmail.com</li>
            <li><strong>Fanpage:</strong> TeeStudio Official</li>
          </ul>
        </div>
      ),
      okText: "Đóng",
      centered: true,
    });
  };

  return (
    <>
      {contextHolder}
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
          description={`Dữ liệu trên đường dẫn không khớp với chữ ký ${gatewayName}. Không nên sử dụng thông tin này để xác nhận đã thanh toán.`}
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
            <PaymentInfoRow
              label={`Mã giao dịch ${gatewayName}`}
              value={result.transactionNo}
            />
          ) : null}
          {result.bankCode ? (
            <PaymentInfoRow
              label={detectedGateway === "MOMO" ? "Hình thức" : "Ngân hàng"}
              value={result.bankCode}
            />
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
          chính thức được cập nhật tự động qua IPN và tiến trình đối soát {gatewayName}.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          type={isSuccessful ? "default" : "primary"}
          onClick={showContact}
          className="h-10 rounded-lg font-semibold"
        >
          Liên hệ hỗ trợ
        </Button>
        <Button
          type={isSuccessful ? "primary" : "default"}
          href="/"
          className="h-10 rounded-lg font-semibold"
        >
          Về trang chủ
        </Button>
      </div>
    </div>
    </>
  );
}
