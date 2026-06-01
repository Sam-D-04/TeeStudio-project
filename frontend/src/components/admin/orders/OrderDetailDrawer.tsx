import { CloseOutlined, DownloadOutlined } from "@ant-design/icons";
import type { Order } from "./OrderTable";
import OrderStatusBadge from "./OrderStatusBadge";

/**
 * OrderDetailDrawer – ngăn kéo chi tiết đơn hàng.
 *
 * Khi admin bấm vào một hàng trong bảng, ngăn kéo này trượt ra từ bên phải,
 * hiển thị đầy đủ thông tin đơn hàng:
 * - Thông tin khách hàng và địa chỉ giao hàng
 * - Danh sách sản phẩm
 * - Khu vực xem trước thiết kế in (cho đơn custom)
 * - Bảng tính tiền chi tiết
 * - Dòng thời gian trạng thái xử lý
 *
 * Props:
 * - order: đơn hàng đang xem (null = không hiển thị ngăn kéo)
 * - onClose: hàm đóng ngăn kéo
 */

// Một bước trong dòng thời gian (timeline) xử lý đơn
type TimelineStep = {
  description: string; // Mô tả bước: "Đang sản xuất – Đã xuất thông số"
  time: string;        // Thời gian: "14:30, 24/10/2023"
  actor: string;       // Người thực hiện: "Admin", "Hệ thống", "Khách hàng"
  isActive?: boolean;  // Bước hiện tại (highlight)
};

// Mở rộng kiểu Order để thêm thông tin chi tiết cần cho ngăn kéo
export type OrderDetail = Order & {
  customerEmail: string;
  shippingAddress: string;
  shippingCarrier: string;   // Đơn vị vận chuyển: "GHTK – Standard"

  // Bảng tính tiền
  subTotalVnd: number;       // Tạm tính (giá áo)
  designFeeVnd: number;      // Phí thiết kế custom (0 nếu áo mẫu)
  shippingFeeVnd: number;    // Phí vận chuyển

  // Thông tin thiết kế in (chỉ có với đơn custom_design)
  printPosition?: string;    // Ví dụ: "Mặt trước (Ngực giữa)"
  printSizeCm?: string;      // Ví dụ: "20x28 cm"
  printFileUrl?: string;     // URL file in (từ Cloudinary)

  timeline: TimelineStep[];  // Lịch sử trạng thái
};

type OrderDetailDrawerProps = {
  order: OrderDetail | null;
  onClose: () => void;
};

// Hàm định dạng số tiền VND
function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function OrderDetailDrawer({ order, onClose }: OrderDetailDrawerProps) {
  // Nếu không có đơn hàng nào được chọn, không render gì
  if (!order) return null;

  return (
    <>
      {/* ---- Lớp phủ mờ phía sau ngăn kéo ---- */}
      {/* Bấm vào lớp phủ cũng đóng ngăn kéo */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ---- Ngăn kéo chính (trượt từ phải sang) ---- */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[600px] flex-col border-l border-border bg-surface shadow-2xl">

        {/* ======== Phần đầu ngăn kéo ======== */}
        <div className="flex items-center justify-between border-b border-border bg-surface-alt px-6 py-5">
          <div>
            <h3 className="text-headline-lg-mobile font-extrabold text-text-main">
              Chi tiết đơn hàng
            </h3>
            {/* Mã đơn màu xanh */}
            <p className="mt-1 font-medium text-[#006591]">{order.orderCode}</p>
          </div>

          {/* Nút đóng (X) */}
          <button
            type="button"
            aria-label="Đóng ngăn kéo"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition-colors hover:bg-surface-dim"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* ======== Phần nội dung có thể cuộn ======== */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">

          {/* ---- Lưới 2 cột: Khách hàng | Giao hàng ---- */}
          <div className="grid grid-cols-2 gap-6">

            {/* Thông tin khách hàng */}
            <div>
              <h4 className="mb-3 border-b border-border pb-1 text-label-bold font-bold uppercase text-text-secondary">
                Khách hàng
              </h4>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-text-main">{order.customerName}</p>
                <p className="flex items-center gap-2 text-text-secondary">
                  {/* Icon điện thoại */}
                  <span>📞</span>
                  <span>{order.customerPhone}</span>
                </p>
                <p className="flex items-center gap-2 text-text-secondary">
                  {/* Icon email */}
                  <span>✉</span>
                  <span>{order.customerEmail}</span>
                </p>
              </div>
            </div>

            {/* Thông tin giao hàng */}
            <div>
              <h4 className="mb-3 border-b border-border pb-1 text-label-bold font-bold uppercase text-text-secondary">
                Giao hàng
              </h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-start gap-2 text-text-secondary">
                  <span className="mt-0.5 shrink-0">📍</span>
                  <span>{order.shippingAddress}</span>
                </p>
                <p className="flex items-center gap-2 text-text-secondary">
                  <span>🚚</span>
                  <span>{order.shippingCarrier}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ---- Thông tin sản phẩm ---- */}
          <div>
            <h4 className="mb-3 border-b border-border pb-1 text-label-bold font-bold uppercase text-text-secondary">
              Sản phẩm
            </h4>
            <div className="flex gap-4 rounded-lg border border-border bg-surface-alt p-3">
              {/* Ảnh sản phẩm (80x80px) */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded border border-border bg-surface">
                {order.product.imageUrl ? (
                  <img
                    src={order.product.imageUrl}
                    alt={order.product.name}
                    className="h-full w-full rounded object-cover"
                  />
                ) : (
                  <span className="text-xs text-text-muted">Ảnh</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h5 className="font-medium text-text-main">{order.product.name}</h5>
                  {/* Tổng tiền sản phẩm bên phải */}
                  <span className="font-medium text-text-main">
                    {formatCurrency(order.subTotalVnd)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  Cỡ: {order.product.sizes}
                </p>
                {/* Nhãn loại đơn */}
                {order.product.type === "custom_design" && (
                  <div className="mt-2 inline-block rounded bg-[#c9e6ff] px-2 py-1 text-[10px] font-bold uppercase text-[#004c6e]">
                    Thiết kế tùy chỉnh
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ---- Khu vực xem trước thiết kế (chỉ cho đơn custom_design) ---- */}
          {order.product.type === "custom_design" && (
            <div>
              <h4 className="mb-3 border-b border-border pb-1 text-label-bold font-bold uppercase text-text-secondary">
                Thiết kế in
              </h4>
              <div className="rounded-lg border border-border bg-surface p-4 text-center">
                {/* Vùng preview thiết kế (tỷ lệ 4:3) */}
                {/* Sau này Backend trả về URL ảnh preview, thay thế phần này */}
                <div className="mb-3 flex aspect-[4/3] items-center justify-center rounded border border-dashed border-border bg-surface-container-low">
                  <span className="text-sm text-text-secondary">
                    Vùng xem trước thiết kế
                    {/* TODO: <img src={designPreviewUrl} ... /> */}
                  </span>
                </div>

                {/* Thông số in + nút tải file */}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-left text-text-secondary">
                    {order.printPosition && (
                      <p>Vị trí: {order.printPosition}</p>
                    )}
                    {order.printSizeCm && (
                      <p>Kích thước in: {order.printSizeCm}</p>
                    )}
                  </div>
                  {/* Nút tải file in */}
                  <button
                    type="button"
                    className="flex h-8 items-center gap-1 rounded bg-[#006398] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#006591]"
                  >
                    <DownloadOutlined />
                    Tải file in
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---- Bảng tính tiền ---- */}
          <div>
            <h4 className="mb-3 border-b border-border pb-1 text-label-bold font-bold uppercase text-text-secondary">
              Thanh toán
            </h4>
            <div className="space-y-2 rounded-lg border border-border bg-surface-alt p-4 text-sm">
              {/* Dòng tạm tính */}
              <div className="flex justify-between text-text-secondary">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subTotalVnd)}</span>
              </div>

              {/* Phí thiết kế (chỉ hiện nếu > 0) */}
              {order.designFeeVnd > 0 && (
                <div className="flex justify-between text-text-secondary">
                  <span>Phí thiết kế tùy chỉnh</span>
                  <span>{formatCurrency(order.designFeeVnd)}</span>
                </div>
              )}

              {/* Phí vận chuyển */}
              <div className="flex justify-between text-text-secondary">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(order.shippingFeeVnd)}</span>
              </div>

              {/* Dòng tổng cộng (đậm hơn, tách biệt) */}
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold text-text-main">
                <span>Tổng tiền</span>
                <span className="text-[#006591]">
                  {formatCurrency(order.totalAmountVnd)}
                </span>
              </div>

              {/* Trạng thái thanh toán */}
              {order.payment.isPaid ? (
                <div className="mt-2 flex items-center gap-2 rounded border border-green-100 bg-green-50 p-2 font-medium text-[#059669]">
                  <span>✔</span>
                  <span>Đã thanh toán qua {order.payment.method}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 rounded border border-amber-100 bg-amber-50 p-2 font-medium text-[#d97706]">
                  <span>⏱</span>
                  <span>Chờ thanh toán – {order.payment.method}</span>
                </div>
              )}
            </div>
          </div>

          {/* ---- Dòng thời gian trạng thái xử lý ---- */}
          <div>
            <h4 className="mb-3 border-b border-border pb-1 text-label-bold font-bold uppercase text-text-secondary">
              Lịch sử xử lý
            </h4>

            {/*
              Dùng border-l (đường dọc bên trái) để tạo hiệu ứng timeline.
              Mỗi bước có một chấm tròn trên đường thẳng đó.
            */}
            <div className="relative ml-2 space-y-4 border-l-2 border-border pl-6">
              {order.timeline.map((step, index) => (
                <div
                  key={index}
                  // Bước không phải hiện tại: làm mờ đi
                  className={step.isActive ? "" : "opacity-60"}
                >
                  {/* Chấm tròn trên đường thẳng */}
                  <span
                    className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${
                      step.isActive
                        ? "border-[#0ea5e9] bg-surface"   // Chấm bước hiện tại: viền xanh
                        : "bg-border"                       // Chấm bước cũ: xám
                    }`}
                    style={{ marginTop: index * 64 + "px" }}
                  />
                  <p className="text-sm font-medium text-text-main">{step.description}</p>
                  <p className="text-xs text-text-secondary">
                    {step.time} – {step.actor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======== Phần chân ngăn kéo: các nút hành động ======== */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface p-4">
          {/* Nút hủy đơn (đặt bên trái, màu đỏ) */}
          <button
            type="button"
            className="mr-auto h-control-h rounded-lg border border-[#ea580c]/30 bg-surface px-4 text-button-text font-semibold text-[#ea580c] transition-colors hover:bg-[#ffdad6]"
          >
            Hủy đơn
          </button>

          {/* Nút in hóa đơn */}
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-lg border border-border bg-surface px-4 text-button-text font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            🖨 In hóa đơn
          </button>

          {/* Nút cập nhật trạng thái (nút chính, xanh) */}
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-lg bg-[#0ea5e9] px-4 text-button-text font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            Cập nhật trạng thái
          </button>
        </div>
      </div>
    </>
  );
}
