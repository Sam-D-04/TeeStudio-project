"use client";

import { useState } from "react";
import type { Payment, PaymentType } from "./PaymentTable";
import PaymentStatusBadge from "./PaymentStatusBadge";

/**
 * PaymentDetailDrawer – ngăn kéo chi tiết giao dịch.
 *
 * Hiển thị từ bên phải màn hình khi admin bấm vào hàng trong bảng.
 * Gồm 5 phần:
 * 1. Tiêu đề + mã GD + trạng thái
 * 2. Thông tin thanh toán (số tiền, phương thức, mã cổng, thời gian)
 * 3. Đơn hàng liên quan (mã đơn + thông tin khách)
 * 4. Lịch sử xử lý IPN (timeline)
 * 5. Ghi chú kế toán
 *
 * Props:
 * - payment: null = ẩn ngăn kéo | PaymentDetail = hiển thị ngăn kéo với dữ liệu
 * - onClose: gọi khi bấm nút X
 * - onSaveNote: gọi khi bấm nút Lưu ghi chú
 * - isActionLoading: true khi đang xử lý hành động (disable nút)
 */

// Nhãn tiếng Việt cho từng loại thanh toán (ánh xạ từ DB.paymentType)
const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  DEPOSIT: "Thanh toán cọc",
  FULL: "Thanh toán toàn bộ",
  FULL_PAYMENT: "Thanh toán toàn bộ",
  COD_FINAL: "Thanh toán COD",
};

// Kiểu mở rộng chứa thêm thông tin chi tiết (ngoài các trường cơ bản của Payment)
export type PaymentDetail = Payment & {
  customerPhone?: string;       // Số điện thoại khách hàng
  createdAt: string;            // Thời gian tạo giao dịch (đã format)
  note?: string;                // Ghi chú kế toán
  // paidAt đã được kế thừa từ Payment (Payment.paidAt?: string)
  // Lịch sử IPN: mỗi bước có mô tả và thời gian
  ipnHistory: {
    description: string;        // Ví dụ: "Nhận IPN thành công"
    time: string;               // Ví dụ: "02/06/2026 14:31:05"
    note?: string;              // Ghi chú thêm, ví dụ "Payload matched"
    isSuccess: boolean;         // true = chấm xanh | false = chấm xám
  }[];
};

type PaymentDetailDrawerProps = {
  payment: PaymentDetail | null;           // null = ẩn ngăn kéo
  onClose: () => void;                     // Đóng ngăn kéo
  isLoading?: boolean;                     // Đang tải chi tiết
  onSaveNote?: (id: number, note: string) => void; // Lưu ghi chú
  isActionLoading?: boolean;               // Đang xử lý hành động
};

export default function PaymentDetailDrawer({
  payment,
  onClose,
  isLoading = false,
  onSaveNote,
  isActionLoading = false,
}: PaymentDetailDrawerProps) {
  const [noteDraft, setNoteDraft] = useState({ paymentId: 0, value: "" });
  const accountingNote =
    noteDraft.paymentId === payment?.id ? noteDraft.value : payment?.note ?? "";

  // Hàm định dạng số tiền VNĐ
  function formatVnd(amount: number): string {
    return amount.toLocaleString("vi-VN") + "đ";
  }

  // Ngăn kéo ẩn (dịch sang phải) khi không có dữ liệu
  // Hiển thị (dịch về vị trí 0) khi có payment được chọn
  const translateClass = payment ? "translate-x-0" : "translate-x-full";

  return (
    <>
      {/* Lớp phủ tối phía sau ngăn kéo – bấm vào đây cũng đóng ngăn kéo */}
      {payment && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Ngăn kéo trượt từ bên phải */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl transition-transform duration-300 ${translateClass}`}
      >
        {/* ---- Phần đầu ngăn kéo: Tiêu đề + nút đóng ---- */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface-alt px-5">
          <h2 className="text-[17px] font-bold text-text-main">
            Chi tiết giao dịch
          </h2>
          {/* Nút X đóng ngăn kéo */}
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-text-secondary transition-colors hover:bg-surface-container"
          >
            {/* Icon X */}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ---- Nội dung cuộn được ---- */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">

          {/* Trạng thái loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-[#0ea5e9]" />
              <span className="ml-3 text-sm text-text-secondary">Đang tải...</span>
            </div>
          )}

          {/* Phần 1: Mã giao dịch + trạng thái */}
          {payment && !isLoading && (
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs text-text-secondary">Mã Giao Dịch</p>
                <p className="text-lg font-bold text-text-main">{payment.payCode}</p>
              </div>
              <PaymentStatusBadge status={payment.status} />
            </div>
          )}

          {/* Phần 2: Thông tin thanh toán – nền xám nhạt */}
          {payment && !isLoading && (
            <div className="space-y-3 rounded-lg border border-border bg-surface-alt p-4">
              <h3 className="text-xs font-bold uppercase text-text-secondary">
                Thông tin thanh toán
              </h3>
              {/* Grid 2 cột: nhãn bên trái, giá trị bên phải */}
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-text-secondary">Số tiền:</span>
                <span className="text-right font-medium text-text-main">
                  {formatVnd(payment.amountVnd)}
                </span>

                <span className="text-text-secondary">Loại thanh toán:</span>
                <span className="text-right font-medium text-text-main">
                  {PAYMENT_TYPE_LABEL[payment.paymentType]}
                </span>

                <span className="text-text-secondary">Phương thức:</span>
                <span className="text-right font-medium text-text-main">
                  {payment.method}
                </span>

                <span className="text-text-secondary">Mã cổng thanh toán:</span>
                <span className="text-right font-mono text-xs text-text-muted">
                  {payment.gatewayCode}
                </span>

                <span className="text-text-secondary">Thời gian tạo:</span>
                <span className="text-right text-text-main">{payment.createdAt}</span>

                {payment.paidAt && (
                  <>
                    <span className="text-text-secondary">Thời gian thanh toán:</span>
                    <span className="text-right text-text-main">{payment.paidAt}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Phần 3: Đơn hàng liên quan */}
          {payment && !isLoading && (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <h3 className="text-xs font-bold uppercase text-text-secondary">
                Đơn hàng liên quan
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  {/* Link đến đơn hàng – chữ xanh, gạch chân khi hover */}
                  <a
                    href={`/admin/don-hang`}
                    className="block font-medium text-[#0ea5e9] hover:underline"
                  >
                    {payment.orderCode}
                  </a>
                  {payment.customerPhone && (
                    <span className="text-xs text-text-secondary">
                      {payment.customerName} – {payment.customerPhone}
                    </span>
                  )}
                </div>
                {/* Icon mở tab mới */}
                <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" />
                  <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )}

          {/* Phần 4: Lịch sử xử lý IPN – timeline theo chiều dọc */}
          {payment && !isLoading && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase text-text-secondary">
                Lịch sử xử lý IPN
              </h3>

              {payment.ipnHistory.length === 0 ? (
                <p className="text-sm italic text-text-muted">Chưa có lịch sử xử lý</p>
              ) : (
                /* Timeline: đường kẻ dọc bên trái + các điểm tròn */
                <div className="relative ml-2 space-y-4 border-l border-[#cbd5e1] pb-2">
                  {payment.ipnHistory.map((step, index) => (
                    <div key={index} className="relative pl-5">
                      {/* Điểm tròn trên timeline: xanh lá = thành công, xám = đang chờ */}
                      <div
                        className={`absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full ring-4 ring-surface ${
                          step.isSuccess ? "bg-[#10b981]" : "bg-border"
                        }`}
                      />
                      <p className="text-sm font-medium text-text-main">
                        {step.description}
                      </p>
                      <p className="text-xs text-text-muted">
                        {step.time}
                        {step.note && ` – ${step.note}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Phần 5: Ghi chú kế toán */}
          {payment && !isLoading && (
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase text-text-secondary">
                Ghi chú kế toán
              </h3>
              {/* Ô nhập ghi chú tự do */}
              <textarea
                value={accountingNote}
                onChange={(e) =>
                  setNoteDraft({ paymentId: payment.id, value: e.target.value })
                }
                placeholder="Thêm ghi chú đối soát tại đây..."
                className="min-h-[100px] w-full rounded-lg border border-border bg-surface-alt p-3 text-sm text-text-main outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]"
              />
              {/* Nút lưu ghi chú */}
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => {
                  if (payment && onSaveNote) {
                    onSaveNote(payment.id, accountingNote);
                  }
                }}
                className="mt-2 h-control-h w-full rounded-lg border border-border bg-surface text-sm font-semibold text-text-main transition-colors hover:bg-surface-container disabled:opacity-50"
              >
                {isActionLoading ? "Đang lưu..." : "Lưu ghi chú"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
