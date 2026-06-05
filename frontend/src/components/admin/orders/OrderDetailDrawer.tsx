"use client";

import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import { Drawer, Modal } from "antd";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Order } from "./OrderTable";
import type { ChiTietDonHangItem } from "@/services/admin/orderService";

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
  items?: ChiTietDonHangItem[];
  customerEmail: string;
  shippingAddress: string;
  shippingCarrier: string;
  subTotalVnd: number;
  designFeeVnd: number;
  shippingFeeVnd: number;
  designPreviewUrl?: string;
  timeline: TimelineStep[];
};

// Danh sách các trạng thái có thể cập nhật (theo thứ tự quy trình)
const TRANG_THAI_CO_THE_CHON = [
  { value: "cho_xac_nhan", label: "Chờ xác nhận" },
  { value: "da_xac_nhan", label: "Đã xác nhận" },
  { value: "dang_san_xuat", label: "Đang xử lý in" },
  { value: "cho_giao", label: "Chờ giao hàng" },
  { value: "dang_giao", label: "Đang giao hàng" },
  { value: "hoan_tat", label: "Hoàn tất" },
];

const TRANG_THAI_CO_THE_HUY = ["cho_xac_nhan", "da_xac_nhan"];

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

function OrderItemsCompactTable({
  order,
  onPreviewDesign,
}: {
  order: OrderDetail;
  onPreviewDesign: (previewUrl?: string | null) => void;
}) {
  const items = order.items?.length
    ? order.items
    : [
        {
          id: order.id,
          productId: 0,
          variantId: 0,
          designId: null,
          tenSanPham: order.product.name,
          mauSac: "",
          kichCo: order.product.sizes,
          sku: "",
          soLuong: 1,
          donGiaVnd: order.subTotalVnd,
          phiThietKeVnd: order.designFeeVnd,
          thanhTienVnd: order.subTotalVnd + order.designFeeVnd,
          loai: order.product.type,
          anhUrl: order.product.imageUrl ?? null,
          anhXemTruocThietKe: order.designPreviewUrl ?? null,
          viTriIn: null,
          phuongPhapIn: null,
        },
      ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-alt">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-xs font-bold uppercase text-text-secondary">
            <th className="p-2 text-left">Sản phẩm</th>
            <th className="p-2 text-left">Phân loại</th>
            <th className="p-2 text-center">SL</th>
            <th className="p-2 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const imageUrl = item.anhXemTruocThietKe || item.anhUrl;
            const coAnhThietKe = Boolean(item.anhXemTruocThietKe);

            return (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="p-2 align-top">
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      disabled={!coAnhThietKe}
                      onClick={() => onPreviewDesign(item.anhXemTruocThietKe)}
                      className={`h-11 w-11 shrink-0 overflow-hidden rounded border border-border bg-surface ${
                        coAnhThietKe ? "cursor-zoom-in" : "cursor-default"
                      }`}
                    >
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={item.tenSanPham}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs text-text-muted">
                          Ảnh
                        </span>
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="max-w-[180px] truncate font-semibold text-text-main">
                        {item.tenSanPham}
                      </div>
                      {item.designId ? (
                        <button
                          type="button"
                          onClick={() => onPreviewDesign(item.anhXemTruocThietKe)}
                          className="mt-1 text-xs font-semibold text-[#006591] disabled:text-text-muted"
                          disabled={!coAnhThietKe}
                        >
                          Design #{item.designId}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="p-2 align-top text-xs text-text-secondary">
                  <div>
                    {item.mauSac || "Chưa có màu"} / {item.kichCo || "Chưa có size"}
                  </div>
                  {item.sku ? <div className="text-text-muted">SKU: {item.sku}</div> : null}
                </td>
                <td className="p-2 text-center align-top font-bold text-text-main">
                  {item.soLuong}
                </td>
                <td className="p-2 text-right align-top">
                  <div className="font-bold text-text-main">
                    {formatCurrency(item.thanhTienVnd)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {formatCurrency(item.donGiaVnd)} / áo
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

export default function OrderDetailDrawer({
  order,
  isLoading = false,
  onClose,
  onCapNhatTrangThai,
  onHuyDon,
}: OrderDetailDrawerProps) {
  // State modal cập nhật trạng thái
  const [capNhatOrderId, setCapNhatOrderId] = useState<number | null>(null);
  const [trangThaiMoi, setTrangThaiMoi] = useState("");
  const [dangCapNhat, setDangCapNhat] = useState(false);

  // State modal hủy đơn
  const [huyOrderId, setHuyOrderId] = useState<number | null>(null);
  const [lyDoHuy, setLyDoHuy] = useState("");
  const [dangHuy, setDangHuy] = useState(false);

  // State lightbox xem trước thiết kế
  const [designPreviewUrlDangXem, setDesignPreviewUrlDangXem] = useState<string | null>(null);

  // Thông báo kết quả
  const [thongBao, setThongBao] = useState<{
    loai: "success" | "error";
    noi_dung: string;
    orderId: number;
  } | null>(null);

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
      setThongBao({
        loai: "success",
        noi_dung: "Cập nhật trạng thái thành công!",
        orderId: order.id,
      });
      setCapNhatOrderId(null);
      setTrangThaiMoi("");
    } catch {
      setThongBao({
        loai: "error",
        noi_dung: "Cập nhật thất bại. Vui lòng thử lại.",
        orderId: order.id,
      });
    } finally {
      setDangCapNhat(false);
      // Ẩn thông báo sau 3 giây
      setTimeout(() => setThongBao(null), 3000);
    }
  }

  // Hàm xử lý hủy đơn
  async function handleHuy() {
    if (!order || !lyDoHuyHopLe) return;
    setDangHuy(true);
    try {
      await onHuyDon(order.id, lyDoHuyDaNhap);
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-order-detail", order.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
      setThongBao({
        loai: "success",
        noi_dung: "Đã hủy đơn hàng thành công!",
        orderId: order.id,
      });
      setHuyOrderId(null);
      setLyDoHuy("");
      handleClose(); // Đóng drawer sau khi hủy
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setThongBao({
        loai: "error",
        noi_dung: msg || "Hủy đơn thất bại. Vui lòng thử lại.",
        orderId: order.id,
      });
    } finally {
      setDangHuy(false);
      setTimeout(() => setThongBao(null), 3000);
    }
  }

  // Xác định drawer có mở không: mở khi đang loading HOẶC đã có dữ liệu
  const isOpen = isLoading || Boolean(order);
  const coTheHuyDon = Boolean(
    order && TRANG_THAI_CO_THE_HUY.includes(order.status)
  );
  const coTheThaoTacDon = Boolean(
    order && order.status !== "da_huy" && order.status !== "hoan_tat"
  );
  const lyDoHuyDaNhap = lyDoHuy.trim();
  const lyDoHuyHopLe = lyDoHuyDaNhap.length >= 5;

  function dongModalCapNhat() {
    setCapNhatOrderId(null);
    setTrangThaiMoi("");
  }

  function dongModalHuy() {
    setHuyOrderId(null);
    setLyDoHuy("");
  }

  function handleClose() {
    setDesignPreviewUrlDangXem(null);
    dongModalCapNhat();
    dongModalHuy();
    setThongBao(null);
    onClose();
  }

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={handleClose}
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
            onClick={handleClose}
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
          {thongBao && order && thongBao.orderId === order.id && (
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
                <OrderItemsCompactTable
                  order={order}
                  onPreviewDesign={(previewUrl) => {
                    if (previewUrl) setDesignPreviewUrlDangXem(previewUrl);
                  }}
                />
              </div>

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
                    <div key={`${step.time}-${index}`} className={`relative ${step.isActive ? "" : "opacity-60"}`}>
                      <span
                        className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 ${
                          step.isActive ? "border-[#0ea5e9] bg-surface" : "bg-border"
                        }`}
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
          )}
        </div>

        {/* ======== Chân ngăn kéo: nút hành động ======== */}
        {order && (
          <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface p-4">
            {/* Nút hủy đơn (trái, đỏ) – chỉ hiện khi chưa hủy/hoàn tất */}
            {coTheThaoTacDon && (
              <button
                type="button"
                disabled={!coTheHuyDon}
                title={
                  coTheHuyDon
                    ? "Hủy đơn hàng"
                    : "Chỉ có thể hủy đơn đang chờ xác nhận hoặc đã xác nhận"
                }
                onClick={() => {
                  if (!coTheHuyDon) return;
                  setLyDoHuy("");
                  setHuyOrderId(order.id);
                  setCapNhatOrderId(null);
                }}
                className="mr-auto h-control-h rounded-lg border border-[#ea580c]/30 bg-surface px-4 text-button-text font-semibold text-[#ea580c] transition-colors hover:bg-[#ffdad6] disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted disabled:hover:bg-surface"
              >
                Hủy đơn
              </button>
            )}

            {/* Nút cập nhật trạng thái (chính, xanh) */}
            {coTheThaoTacDon && (
              <button
                type="button"
                onClick={() => {
                  setTrangThaiMoi("");
                  setCapNhatOrderId(order.id);
                  setHuyOrderId(null);
                }}
                className="flex h-control-h items-center gap-2 rounded-lg bg-[#0ea5e9] px-4 text-button-text font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
              >
                Cập nhật trạng thái
              </button>
            )}
          </div>
        )}
      </div>
      </Drawer>
      <Modal
        open={Boolean(order && capNhatOrderId === order.id)}
        title="Cập nhật trạng thái"
        centered
        footer={null}
        width={460}
        onCancel={dongModalCapNhat}
        mask={{ closable: true }}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              Trạng thái mới
            </label>
            <select
              value={trangThaiMoi}
              onChange={(e) => setTrangThaiMoi(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary-container"
            >
              <option value="">-- Chọn trạng thái --</option>
              {TRANG_THAI_CO_THE_CHON.map((tt) => (
                <option key={tt.value} value={tt.value}>
                  {tt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={dongModalCapNhat}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-alt"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={!trangThaiMoi || dangCapNhat}
              onClick={handleCapNhat}
              className="rounded-lg bg-[#0ea5e9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dangCapNhat ? "Đang lưu..." : "Xác nhận"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(order && huyOrderId === order.id)}
        title="Hủy đơn hàng"
        centered
        footer={null}
        width={520}
        onCancel={dongModalHuy}
        mask={{ closable: true }}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-red-700">
              Lý do hủy
            </label>
            <textarea
              value={lyDoHuy}
              onChange={(e) => setLyDoHuy(e.target.value)}
              placeholder="Ví dụ: Khách yêu cầu hủy, không liên hệ được khách hàng..."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-lg border border-border bg-surface p-3 text-sm text-text-main outline-none focus:border-red-300"
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-text-muted">Tối thiểu 5 ký tự.</span>
              <span className={lyDoHuyDaNhap.length > 0 && !lyDoHuyHopLe ? "text-red-600" : "text-text-muted"}>
                {lyDoHuyDaNhap.length}/500
              </span>
            </div>
            {lyDoHuyDaNhap.length > 0 && !lyDoHuyHopLe && (
              <p className="mt-1 text-xs font-medium text-red-600">
                Lý do hủy cần ít nhất 5 ký tự.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={dongModalHuy}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-alt"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={!lyDoHuyHopLe || dangHuy}
              onClick={handleHuy}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dangHuy ? "Đang hủy..." : "Xác nhận hủy"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(designPreviewUrlDangXem)}
        title="Xem thiết kế"
        centered
        footer={null}
        width={760}
        onCancel={() => setDesignPreviewUrlDangXem(null)}
        mask={{ closable: true }}
      >
        {designPreviewUrlDangXem && (
          <img
            src={designPreviewUrlDangXem}
            alt="Xem trước thiết kế"
            className="max-h-[70vh] w-full rounded object-contain"
          />
        )}
      </Modal>
    </>
  );
}
