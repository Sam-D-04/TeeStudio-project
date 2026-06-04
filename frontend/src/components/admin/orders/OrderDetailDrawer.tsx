"use client";

import { CloseOutlined, DownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import { Drawer } from "antd";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Order } from "./OrderTable";

/**
 * OrderDetailDrawer – Ngăn kéo chi tiết đơn hàng (đã kết nối API thực tế).
 *
 * Nhận dữ liệu đã được fetch từ OrdersPage (qua React Query).
 * Hỗ trợ:
 * - Xem chi tiết đơn hàng (khách hàng, giao hàng, sản phẩm, thanh toán, timeline)
 * - Cập nhật trạng thái đơn hàng
 * - Hủy đơn hàng kèm lý do
 */

type TimelineStep = {
  description: string;
  time: string;
  actor: string;
  isActive?: boolean;
};

export type OrderDetail = Order & {
  customerEmail: string;
  shippingAddress: string;
  shippingCarrier: string;
  subTotalVnd: number;
  designFeeVnd: number;
  shippingFeeVnd: number;
  printPosition?: string;
  printSizeCm?: string;
  printFileUrl?: string;
  timeline: TimelineStep[];
};

// Danh sách các trạng thái có thể cập nhật (theo thứ tự quy trình)
const TRANG_THAI_CO_THE_CHON = [
  { value: "cho_xac_nhan", label: "Chờ xác nhận" },
  { value: "da_xac_nhan", label: "Đã xác nhận" },
  { value: "dang_san_xuat", label: "Đang xử lý in" },
  { value: "dang_in", label: "Đang in" },
  { value: "cho_giao", label: "Chờ giao hàng" },
  { value: "dang_giao", label: "Đang giao hàng" },
  { value: "hoan_tat", label: "Hoàn tất" },
];

type OrderDetailDrawerProps = {
  order: OrderDetail | null;
  isLoading?: boolean;         // Đang fetch chi tiết đơn hàng từ API
  onClose: () => void;
  onCapNhatTrangThai: (id: number, trangThai: string) => Promise<void>;
  onHuyDon: (id: number, lyDo: string) => Promise<void>;
};

function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function OrderDetailDrawer({
  order,
  isLoading = false,
  onClose,
  onCapNhatTrangThai,
  onHuyDon,
}: OrderDetailDrawerProps) {
  // State modal cập nhật trạng thái
  const [showCapNhat, setShowCapNhat] = useState(false);
  const [trangThaiMoi, setTrangThaiMoi] = useState("");
  const [dangCapNhat, setDangCapNhat] = useState(false);

  // State modal hủy đơn
  const [showHuy, setShowHuy] = useState(false);
  const [lyDoHuy, setLyDoHuy] = useState("");
  const [dangHuy, setDangHuy] = useState(false);

  // Thông báo kết quả
  const [thongBao, setThongBao] = useState<{ loai: "success" | "error"; noi_dung: string } | null>(null);

  const queryClient = useQueryClient();

  // Hàm xử lý cập nhật trạng thái
  async function handleCapNhat() {
    if (!order || !trangThaiMoi) return;
    setDangCapNhat(true);
    try {
      await onCapNhatTrangThai(order.id, trangThaiMoi);
      // Làm mới cache để bảng và drawer đều cập nhật
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-order-detail", order.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
      setThongBao({ loai: "success", noi_dung: "Cập nhật trạng thái thành công!" });
      setShowCapNhat(false);
      setTrangThaiMoi("");
    } catch {
      setThongBao({ loai: "error", noi_dung: "Cập nhật thất bại. Vui lòng thử lại." });
    } finally {
      setDangCapNhat(false);
      // Ẩn thông báo sau 3 giây
      setTimeout(() => setThongBao(null), 3000);
    }
  }

  // Hàm xử lý hủy đơn
  async function handleHuy() {
    if (!order || !lyDoHuy.trim()) return;
    setDangHuy(true);
    try {
      await onHuyDon(order.id, lyDoHuy.trim());
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-order-detail", order.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
      setThongBao({ loai: "success", noi_dung: "Đã hủy đơn hàng thành công!" });
      setShowHuy(false);
      setLyDoHuy("");
      onClose(); // Đóng drawer sau khi hủy
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setThongBao({ loai: "error", noi_dung: msg || "Hủy đơn thất bại. Vui lòng thử lại." });
    } finally {
      setDangHuy(false);
      setTimeout(() => setThongBao(null), 3000);
    }
  }

  // Xác định drawer có mở không: mở khi đang loading HOẶC đã có dữ liệu
  const isOpen = isLoading || Boolean(order);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      size={600}
      closable={false}
      title={null}
      styles={{
        body: { padding: 0 },
        wrapper: { boxShadow: "none" },
      }}
      style={{ borderLeft: "1px solid #e2e8f0" }}
    >
      <div className="flex h-full flex-col bg-surface">

        {/* ======== Phần đầu ngăn kéo ======== */}
        <div className="flex items-center justify-between border-b border-border bg-surface-alt px-6 py-5">
          <div>
            <h3 className="text-headline-lg-mobile font-extrabold text-text-main">
              Chi tiết đơn hàng
            </h3>
            {order && (
              <p className="mt-1 font-medium text-[#006591]">{order.orderCode}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Đóng ngăn kéo"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition-colors hover:bg-surface-dim"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* ======== Nội dung ======== */}
        <div className="flex-1 overflow-y-auto">

          {/* Loading state khi đang fetch chi tiết */}
          {isLoading && !order && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-text-secondary">
                <LoadingOutlined style={{ fontSize: 32 }} spin />
                <p className="mt-3 text-sm">Đang tải chi tiết đơn hàng...</p>
              </div>
            </div>
          )}

          {/* Thông báo kết quả thao tác */}
          {thongBao && (
            <div
              className={`mx-4 mt-4 rounded-lg p-3 text-sm font-medium ${
                thongBao.loai === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {thongBao.noi_dung}
            </div>
          )}

          {/* Nội dung chi tiết (chỉ hiển thị khi có dữ liệu) */}
          {order && (
            <div className="space-y-6 p-6">

              {/* ---- Lưới 2 cột: Khách hàng | Giao hàng ---- */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="mb-3 border-b border-border pb-1 text-label-bold font-bold uppercase text-text-secondary">
                    Khách hàng
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-text-main">{order.customerName}</p>
                    <p className="flex items-center gap-2 text-text-secondary">
                      <span>📞</span><span>{order.customerPhone}</span>
                    </p>
                    <p className="flex items-center gap-2 text-text-secondary">
                      <span>✉</span><span>{order.customerEmail}</span>
                    </p>
                  </div>
                </div>

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
                      <span>🚚</span><span>{order.shippingCarrier}</span>
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
                      <span className="font-medium text-text-main">
                        {formatCurrency(order.subTotalVnd)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">Cỡ: {order.product.sizes}</p>
                    {order.product.type === "custom_design" && (
                      <div className="mt-2 inline-block rounded bg-[#c9e6ff] px-2 py-1 text-[10px] font-bold uppercase text-[#004c6e]">
                        Thiết kế tùy chỉnh
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ---- Xem trước thiết kế (chỉ với custom_design) ---- */}
              {order.product.type === "custom_design" && (
                <div>
                  <h4 className="mb-3 border-b border-border pb-1 text-label-bold font-bold uppercase text-text-secondary">
                    Thiết kế in
                  </h4>
                  <div className="rounded-lg border border-border bg-surface p-4 text-center">
                    <div className="mb-3 flex aspect-[4/3] items-center justify-center rounded border border-dashed border-border bg-surface-container-low overflow-hidden">
                      {order.printFileUrl ? (
                        <img
                          src={order.printFileUrl}
                          alt="Xem trước thiết kế"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm text-text-secondary">
                          Vùng xem trước thiết kế
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-left text-text-secondary">
                        {order.printPosition && <p>Vị trí: {order.printPosition}</p>}
                        {order.printSizeCm && <p>Kích thước in: {order.printSizeCm}</p>}
                      </div>
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
                  <div className="flex justify-between text-text-secondary">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(order.subTotalVnd)}</span>
                  </div>
                  {order.designFeeVnd > 0 && (
                    <div className="flex justify-between text-text-secondary">
                      <span>Phí thiết kế tùy chỉnh</span>
                      <span>{formatCurrency(order.designFeeVnd)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary">
                    <span>Phí vận chuyển</span>
                    <span>{formatCurrency(order.shippingFeeVnd)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold text-text-main">
                    <span>Tổng tiền</span>
                    <span className="text-[#006591]">{formatCurrency(order.totalAmountVnd)}</span>
                  </div>
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

              {/* ---- Timeline lịch sử xử lý ---- */}
              <div>
                <h4 className="mb-3 border-b border-border pb-1 text-label-bold font-bold uppercase text-text-secondary">
                  Lịch sử xử lý
                </h4>
                <div className="relative ml-2 space-y-4 border-l-2 border-border pl-6">
                  {order.timeline.map((step, index) => (
                    <div key={index} className={step.isActive ? "" : "opacity-60"}>
                      <span
                        className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${
                          step.isActive ? "border-[#0ea5e9] bg-surface" : "bg-border"
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

              {/* ---- Modal nhập trạng thái mới ---- */}
              {showCapNhat && (
                <div className="rounded-lg border border-[#0ea5e9]/30 bg-blue-50 p-4">
                  <p className="mb-2 text-sm font-medium text-text-main">Chọn trạng thái mới:</p>
                  <div className="relative mb-3">
                    <select
                      value={trangThaiMoi}
                      onChange={(e) => setTrangThaiMoi(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none"
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      {TRANG_THAI_CO_THE_CHON.map((tt) => (
                        <option key={tt.value} value={tt.value}>
                          {tt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!trangThaiMoi || dangCapNhat}
                      onClick={handleCapNhat}
                      className="rounded-lg bg-[#0ea5e9] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#0284c7]"
                    >
                      {dangCapNhat ? "Đang lưu..." : "Xác nhận"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCapNhat(false); setTrangThaiMoi(""); }}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-alt"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              )}

              {/* ---- Modal nhập lý do hủy ---- */}
              {showHuy && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="mb-2 text-sm font-medium text-red-700">Nhập lý do hủy đơn:</p>
                  <textarea
                    value={lyDoHuy}
                    onChange={(e) => setLyDoHuy(e.target.value)}
                    placeholder="Ví dụ: Khách yêu cầu hủy, không liên hệ được khách hàng..."
                    rows={3}
                    className="mb-3 w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-main outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!lyDoHuy.trim() || dangHuy}
                      onClick={handleHuy}
                      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-red-600"
                    >
                      {dangHuy ? "Đang hủy..." : "Xác nhận hủy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowHuy(false); setLyDoHuy(""); }}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-alt"
                    >
                      Quay lại
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======== Chân ngăn kéo: nút hành động ======== */}
        {order && (
          <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface p-4">
            {/* Nút hủy đơn (trái, đỏ) – chỉ hiện khi chưa hủy/hoàn tất */}
            {order.status !== "da_huy" && order.status !== "hoan_tat" && (
              <button
                type="button"
                onClick={() => { setShowHuy(!showHuy); setShowCapNhat(false); }}
                className="mr-auto h-control-h rounded-lg border border-[#ea580c]/30 bg-surface px-4 text-button-text font-semibold text-[#ea580c] transition-colors hover:bg-[#ffdad6]"
              >
                {showHuy ? "Đóng" : "Hủy đơn"}
              </button>
            )}

            {/* Nút in hóa đơn */}
            <button
              type="button"
              className="flex h-control-h items-center gap-2 rounded-lg border border-border bg-surface px-4 text-button-text font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
            >
              🖨 In hóa đơn
            </button>

            {/* Nút cập nhật trạng thái (chính, xanh) */}
            {order.status !== "da_huy" && order.status !== "hoan_tat" && (
              <button
                type="button"
                onClick={() => { setShowCapNhat(!showCapNhat); setShowHuy(false); }}
                className="flex h-control-h items-center gap-2 rounded-lg bg-[#0ea5e9] px-4 text-button-text font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
              >
                {showCapNhat ? "Đóng" : "Cập nhật trạng thái"}
              </button>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
