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
 * - Phương thức (VNPAY / COD)
 * - Trạng thái (badge màu)
 * - Mã cổng TT (mã từ cổng thanh toán VNPAY)
 *
 * Khi bấm vào một hàng → gọi onRowClick để mở ngăn kéo chi tiết.
 */

// Kiểu dữ liệu của một giao dịch thanh toán
export type Payment = {
  id: number;
  payCode: string;         // Mã GD nội bộ, ví dụ "PAY-000128"
  orderCode: string;       // Mã đơn hàng liên kết, ví dụ "ORD-20260602-001"
  customerName: string;    // Tên khách hàng
  amountVnd: number;       // Số tiền (đơn vị VNĐ)
  method: "VNPAY" | "COD"; // Phương thức thanh toán
  status: PaymentStatus;   // Trạng thái giao dịch
  gatewayCode: string;     // Mã cổng thanh toán từ VNPAY (ví dụ: "VNPAY-842193")
};

type PaymentTableProps = {
  payments: Payment[];                  // Danh sách giao dịch
  onRowClick: (payment: Payment) => void; // Khi bấm vào hàng
};

// Hàm định dạng số tiền sang dạng "850.000đ"
function formatVnd(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function PaymentTable({ payments, onRowClick }: PaymentTableProps) {
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
            <th className="p-4">Phương thức</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4">Mã cổng TT</th>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
