import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import {
  getOrderPaymentState,
  getOrderPaymentMethodLabel,
  isOrderStatusLockedByPayment,
} from "@/lib/paymentDisplay";
import type { OrderStatus } from "./OrderStatusBadge";
import OrderStatusBadge from "./OrderStatusBadge";

/**
 * OrderTable – bảng danh sách đơn hàng.
 *
 * Mỗi hàng (row) hiển thị:
 * - Mã đơn hàng + ngày tạo
 * - Tên khách hàng + số điện thoại
 * - Hình ảnh sản phẩm, tên sản phẩm, loại đơn, size
 * - Tổng tiền + trạng thái thanh toán
 * - Badge trạng thái xử lý đơn
 * - Nút thao tác ở cột cuối (xem chi tiết, cập nhật trạng thái)
 *
 * Khi bấm vào hàng → gọi onRowClick để chuyển sang trang chi tiết theo ID.
 */

// Kiểu dữ liệu cho một mục thanh toán
export type PaymentInfo = {
  method: string;   // Phương thức: "VNPAY", "MOMO", "COD"
  type?: string;
  amountVnd?: number;
  status?: string | null;
  isPaid: boolean;  // Đã thanh toán hay chưa
};

// Kiểu dữ liệu cho một sản phẩm trong đơn hàng (chỉ thông tin tóm tắt cho bảng)
export type OrderProductSummary = {
  name: string;        // Tên sản phẩm
  type: "custom_design" | "ao_mau"; // Loại đơn
  sizes: string;       // Ví dụ: "Size L, XL"
  imageUrl?: string;   // URL ảnh (nếu có từ Cloudinary)
  extraCount?: number;  // Số dòng sản phẩm khác ngoài dòng đại diện
  totalQuantity?: number; // Tổng số lượng áo trong đơn
};

// Kiểu dữ liệu cho một đơn hàng (hiển thị trong bảng)
export type Order = {
  id: number;                     // ID trong database
  orderCode: string;              // Mã đơn hàng: "#TS-2026-00128"
  createdAt: string;              // Ngày tạo (ISO string hoặc chuỗi hiển thị)
  customerName: string;           // Tên khách hàng
  customerPhone: string;          // Số điện thoại
  product: OrderProductSummary;   // Thông tin sản phẩm
  totalAmountVnd: number;         // Tổng tiền (số nguyên VND)
  payment: PaymentInfo;           // Thông tin thanh toán
  status: OrderStatus;            // Trạng thái xử lý
};

type OrderTableProps = {
  orders: Order[];
  onViewDetail: (order: Order) => void;
  onEditStatus?: (order: Order) => void;
};

// Hàm định dạng số tiền VND: 429000 → "429.000đ"
function formatCurrency(amountVnd: number): string {
  return amountVnd.toLocaleString("vi-VN") + "đ";
}

function OrderPaymentSummary({ payment }: { payment: PaymentInfo }) {
  const paymentState = getOrderPaymentState({
    paymentType: payment.type,
    status: payment.status,
  });
  const paymentStateLabel =
    payment.type === "DEPOSIT" &&
    ["PAID", "da_thanh_toan"].includes(payment.status || "")
      ? "Đã thanh toán 100%"
      : paymentState.label;
  const methodLabel = getOrderPaymentMethodLabel({
    method: payment.method,
    paymentType: payment.type,
  });

  return (
    <div className="mt-2 min-w-[220px] space-y-1.5">
      <div className="whitespace-nowrap text-xs font-semibold text-text-secondary">
        {methodLabel}
      </div>
      <span
        className={`inline-flex min-h-6 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${paymentState.badgeClassName}`}
      >
        {paymentStateLabel}
      </span>
    </div>
  );
}

function isStatusUpdateLocked(order: Order): boolean {
  return isOrderStatusLockedByPayment({
    method: order.payment.method,
    paymentType: order.payment.type,
    status: order.payment.status,
  });
}

export default function OrderTable({ orders, onViewDetail, onEditStatus }: OrderTableProps) {
  return (
    // Wrapper cho phép cuộn ngang trên màn hình nhỏ
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">

        {/* ---- Đầu bảng ---- */}
        <thead>
          <tr className="border-b border-border bg-surface-alt text-label-bold font-bold uppercase text-text-secondary">
            <th className="whitespace-nowrap p-4">Đơn hàng</th>
            <th className="whitespace-nowrap p-4">Khách hàng</th>
            <th className="whitespace-nowrap p-4">Sản phẩm / Thiết kế</th>
            <th className="min-w-[260px] whitespace-nowrap p-4">Tổng tiền / Thanh toán</th>
            <th className="whitespace-nowrap p-4">Trạng thái</th>
            <th className="whitespace-nowrap p-4 text-right">Thao tác</th>
          </tr>
        </thead>

        {/* ---- Thân bảng ---- */}
        <tbody className="text-sm">
          {orders.map((order) => (
            <tr
              key={order.id}
              // Khi hover: nền xám rất nhạt
              className="border-b border-border transition-colors hover:bg-surface-alt"
            >
              {/* Cột 1: Mã đơn + ngày tạo */}
              <td className="p-4 align-top">
                {/* Mã đơn màu xanh primary */}
                <div className="font-medium text-[#006591]">{order.orderCode}</div>
                {/* Ngày giờ màu xám */}
                <div className="mt-1 text-xs text-text-secondary">{order.createdAt}</div>
              </td>

              {/* Cột 2: Tên khách hàng + SĐT */}
              <td className="p-4 align-top">
                <div className="font-medium text-text-main">{order.customerName}</div>
                <div className="mt-1 text-xs text-text-secondary">{order.customerPhone}</div>
              </td>

              {/* Cột 3: Sản phẩm (ảnh thumbnail + tên + loại + size) */}
              <td className="p-4 align-top">
                <div className="flex items-start gap-3">
                  {/* Ô thumbnail ảnh sản phẩm (48x48px) */}
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-border bg-surface-container">
                    {order.product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.product.imageUrl}
                        alt={order.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      // Placeholder khi chưa có ảnh
                      <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">
                        Ảnh
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    {/* Tên sản phẩm */}
                    <div className="max-w-[220px] truncate font-medium text-text-main">
                      {order.product.name}
                    </div>
                    {order.product.extraCount && order.product.extraCount > 0 ? (
                      <div className="mt-1 text-xs font-semibold text-[#006591]">
                        + {order.product.extraCount} sản phẩm khác
                      </div>
                    ) : null}
                    <div className="mt-1 flex items-center gap-2">
                      {/* Nhãn loại đơn: "Thiết kế tùy chỉnh" hoặc "Áo mẫu" */}
                      {order.product.type === "custom_design" ? (
                        <span className="rounded bg-[#c9e6ff] px-2 py-0.5 text-[10px] font-bold uppercase text-[#004c6e]">
                          Tùy chỉnh
                        </span>
                      ) : (
                        <span className="rounded bg-[#eaeef2] px-2 py-0.5 text-[10px] font-bold uppercase text-[#475569]">
                          Áo mẫu
                        </span>
                      )}
                      {/* Kích cỡ */}
                      <span className="text-xs text-text-secondary">{order.product.sizes}</span>
                    </div>
                    {order.product.totalQuantity && order.product.totalQuantity > 0 ? (
                      <div className="mt-1 text-xs text-text-muted">
                        Tổng SL: {order.product.totalQuantity}
                      </div>
                    ) : null}
                  </div>
                </div>
              </td>

              {/* Cột 4: Tổng tiền + trạng thái thanh toán */}
              <td className="min-w-[260px] p-4 align-top">
                {/* Số tiền */}
                <div className="font-medium text-text-main">
                  {formatCurrency(order.totalAmountVnd)}
                </div>

                <OrderPaymentSummary payment={order.payment} />
              </td>

              {/* Cột 5: Badge trạng thái xử lý */}
              <td className="p-4 align-top">
                <OrderStatusBadge status={order.status} />

              </td>

              {/* Cột 6: Nút thao tác */}
              <td className="p-4 align-top text-right">
                <div className="flex items-center justify-end gap-2">
                  {/* Nút xem chi tiết */}
                  <button
                    type="button"
                    title="Xem chi tiết"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(order);
                    }}
                    className="rounded p-1.5 text-text-secondary transition-colors hover:bg-surface-dim hover:text-[#006591]"
                  >
                    <EyeOutlined style={{ fontSize: 18 }} />
                  </button>

                  {/* Nút cập nhật trạng thái */}
                  {onEditStatus && (
                    <button
                      type="button"
                      title={
                        isStatusUpdateLocked(order)
                          ? "Đơn đang chờ thanh toán online hoặc tiền cọc; chỉ có thể hủy đơn"
                          : "Cập nhật trạng thái"
                      }
                      disabled={isStatusUpdateLocked(order)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditStatus(order);
                      }}
                      className="rounded p-1.5 text-text-secondary transition-colors hover:bg-surface-dim hover:text-primary-container disabled:cursor-not-allowed disabled:text-text-muted disabled:hover:bg-transparent"
                    >
                      <EditOutlined style={{ fontSize: 18 }} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Hiển thị khi không có đơn hàng nào */}
      {orders.length === 0 && (
        <div className="py-16 text-center text-text-muted">
          Không có đơn hàng nào phù hợp.
        </div>
      )}
    </div>
  );
}
