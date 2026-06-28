import type { MouseEvent } from "react";
import type { PaymentStatus } from "./PaymentStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

/**
 * PaymentTable – bảng danh sách giao dịch thanh toán.
 *
 * Hiển thị các cột:
 * - Mã GD (mã giao dịch nội bộ, ví dụ PAY-000128)
 * - Mã Đơn (mã đơn hàng liên kết, ví dụ ORD-20260602-001)
 * - Khách hàng (tên người mua)
 * - Số tiền (căn phải)
 * - Loại thanh toán (cọc / toàn bộ — ánh xạ từ paymentType trong DB)
 * - Phương thức (VNPAY / COD)
 * - Trạng thái (badge màu)
 * - Mã cổng TT (mã từ cổng thanh toán VNPAY)
 * - Thời gian giao dịch (paidAt — khớp với cột paidAt trong DB)
 * - Thao tác (xem chi tiết, xác nhận thu COD)
 *
 * Khi bấm vào một hàng → gọi onRowClick để mở ngăn kéo chi tiết.
 * Khi bấm icon thao tác → gọi onActionClick thay vì mở ngăn kéo.
 */

// Loại thanh toán ánh xạ từ cột paymentType trong bảng Payment (DB)
export type PaymentType = "DEPOSIT" | "FULL_PAYMENT" | "COD_FINAL";

// Nhãn tiếng Việt cho từng loại thanh toán
const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  DEPOSIT: "Thanh toán cọc",
  FULL_PAYMENT: "Thanh toán toàn bộ",
  COD_FINAL: "Thanh toán COD",
};

// Màu sắc badge loại thanh toán
const PAYMENT_TYPE_CLASS: Record<PaymentType, string> = {
  DEPOSIT: "bg-[#fef3c7] text-[#b45309]",       // Vàng nhạt – thanh toán cọc
  FULL_PAYMENT: "bg-[#dbeafe] text-[#1d4ed8]",  // Xanh dương nhạt – toàn bộ
  COD_FINAL: "bg-[#f0fdf4] text-[#15803d]",     // Xanh lá nhạt – COD
};

// Kiểu dữ liệu của một giao dịch thanh toán
export type Payment = {
  id: number;
  payCode: string;           // Mã GD nội bộ, ví dụ "PAY-000128"
  orderCode: string;         // Mã đơn hàng liên kết, ví dụ "ORD-20260602-001"
  customerName: string;      // Tên khách hàng
  amountVnd: number;         // Số tiền (đơn vị VNĐ)
  paymentType: PaymentType;  // Loại thanh toán: cọc / toàn bộ / COD (ánh xạ từ DB.paymentType)
  method: "VNPAY" | "COD";  // Phương thức thanh toán
  status: PaymentStatus;     // Trạng thái giao dịch
  gatewayCode: string;       // Mã cổng thanh toán từ VNPAY (ví dụ: "VNPAY-842193")
  paidAt?: string;           // Thời gian giao dịch thành công (ánh xạ từ DB.paidAt)
};

type PaymentTableProps = {
  payments: Payment[];                   // Danh sách giao dịch
  onRowClick: (payment: Payment) => void; // Khi bấm vào hàng
  onViewDetail?: (payment: Payment, e: MouseEvent) => void; // Xem chi tiết (icon 👁️)
  onConfirmCod?: (payment: Payment, e: MouseEvent) => void;
};

// Hàm định dạng số tiền sang dạng "850.000đ"
function formatVnd(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function PaymentTable({
  payments,
  onRowClick,
  onViewDetail,
  onConfirmCod,
}: PaymentTableProps) {
  return (
    // Bảng có thể cuộn ngang trên màn hình nhỏ
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">

        {/* Tiêu đề cột: nền xám nhạt, chữ in hoa, đậm */}
        <thead className="border-b border-border bg-surface-alt text-xs font-bold uppercase text-text-secondary">
          <tr>
            <th className="p-4">Mã GD</th>
            <th className="p-4">Mã Đơn</th>
            <th className="p-4">Khách hàng</th>
            <th className="p-4 text-right">Số tiền</th>
            <th className="p-4">Loại thanh toán</th>
            <th className="p-4">Phương thức</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4">Mã cổng TT</th>
            <th className="p-4">Thời gian giao dịch</th>
            <th className="p-4 text-center">Thao tác</th>
          </tr>
        </thead>

        {/* Các hàng dữ liệu */}
        <tbody className="divide-y divide-border">
          {payments.map((payment) => {
            // Hàng thất bại: đổi nền thành đỏ nhạt khi hover
            const rowHoverClass =
              payment.status === "that_bai"
                ? "hover:bg-[#fef2f2]"
                : "hover:bg-surface-alt";

            // Màu chữ mã GD: đỏ nếu thất bại, xanh nếu OK
            const codeTextClass =
              payment.status === "that_bai"
                ? "text-[#b91c1c]"
                : "text-text-main group-hover:text-[#0ea5e9]";

            return (
              // Mỗi hàng có thể bấm vào để mở chi tiết (ngăn kéo)
              <tr
                key={payment.id}
                className={`cursor-pointer transition-colors group ${rowHoverClass}`}
                onClick={() => onRowClick(payment)}
              >
                {/* Mã giao dịch nội bộ */}
                <td className={`p-4 font-medium ${codeTextClass}`}>
                  {payment.payCode}
                </td>

                {/* Mã đơn hàng liên kết */}
                <td className="p-4 text-text-secondary">{payment.orderCode}</td>

                {/* Tên khách hàng */}
                <td className="p-4 text-text-main">{payment.customerName}</td>

                {/* Số tiền – căn phải, chữ đậm */}
                <td className="p-4 text-right font-medium text-text-main">
                  {formatVnd(payment.amountVnd)}
                </td>

                {/* Loại thanh toán: cọc / toàn bộ / COD */}
                <td className="p-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      PAYMENT_TYPE_CLASS[payment.paymentType]
                    }`}
                  >
                    {PAYMENT_TYPE_LABEL[payment.paymentType]}
                  </span>
                </td>

                {/* Phương thức thanh toán: hiển thị badge nhỏ + tên */}
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    {/* Badge nhỏ màu xanh "VN" cho VNPAY */}
                    {payment.method === "VNPAY" ? (
                      <>
                        <span className="flex h-4 w-6 items-center justify-center rounded bg-[#0ea5e9] text-[8px] font-bold text-white">
                          VN
                        </span>
                        <span>VNPAY</span>
                      </>
                    ) : (
                      <>
                        <span className="flex h-4 w-6 items-center justify-center rounded bg-[#f59e0b] text-[8px] font-bold text-white">
                          COD
                        </span>
                        <span>COD</span>
                      </>
                    )}
                  </div>
                </td>

                {/* Nhãn trạng thái màu sắc */}
                <td className="p-4">
                  <PaymentStatusBadge status={payment.status} />
                </td>

                {/* Mã cổng thanh toán – font mono để dễ đọc */}
                <td className="p-4 font-mono text-xs text-text-muted">
                  {payment.gatewayCode}
                </td>

                {/* Thời gian giao dịch – ánh xạ từ DB.paidAt */}
                <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                  {payment.paidAt ?? (
                    <span className="italic text-text-muted">Chưa có</span>
                  )}
                </td>

                {/* Cột thao tác: icon Xem chi tiết và Xác nhận */}
                <td
                  className="p-4"
                  // Ngăn click cột thao tác lan ra hàng (đã có onClick riêng)
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-2">

                    {/* Nút 👁️ Xem chi tiết / Xem Gateway Response */}
                    <button
                      type="button"
                      title="Xem chi tiết giao dịch"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail?.(payment, e);
                        // Fallback: mở ngăn kéo nếu không có handler riêng
                        if (!onViewDetail) onRowClick(payment);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9]"
                    >
                      {/* Icon mắt */}
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>

                    {payment.method === "COD" && (
                      <button
                        type="button"
                        title="Xác nhận thu COD"
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfirmCod?.(payment, e);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#bbf7d0] bg-surface text-[#15803d] transition-colors hover:border-[#15803d] hover:bg-[#f0fdf4]"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
