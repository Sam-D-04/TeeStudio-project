"use client";

import { Drawer } from "antd";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import type { InventoryItem } from "./InventoryTable";
import InventoryStatusBadge from "./InventoryStatusBadge";
import * as inventoryService from "@/services/admin/inventoryService";

/**
 * InventoryDetailDrawer – drawer (ngăn trượt từ phải) hiển thị chi tiết phôi áo.
 *
 * Đã kết nối API thật:
 * - Lấy danh sách đơn hàng chờ xuất phôi từ API.
 * - Lấy lịch sử biến động tồn kho từ API.
 * - Hiển thị loading skeleton khi đang tải.
 */

// Kiểu dữ liệu props nhận từ component cha (InventoryPage)
type InventoryDetailDrawerProps = {
  isOpen: boolean;              // Drawer đang mở hay đóng
  onClose: () => void;          // Hàm gọi khi đóng drawer
  item: InventoryItem | null;   // Dữ liệu phôi áo đang được xem (null nếu chưa chọn)
  onGiaoDich: (item: InventoryItem) => void; // Mở modal nhập/xuất kho
};

// Lấy màu cho điểm tròn trong timeline theo loại biến động
function getMauDotTimeline(loai: "nhap" | "xuat" | "giu"): string {
  if (loai === "nhap") return "bg-[#059669]";  // Xanh lá khi nhập kho
  if (loai === "giu")  return "bg-[#d97706]";  // Vàng khi giữ lại
  return "bg-[#b91c1c]";                        // Đỏ khi xuất kho
}

export default function InventoryDetailDrawer({
  isOpen,
  onClose,
  item,
  onGiaoDich,
}: InventoryDetailDrawerProps) {
  // ===== GỌI API ĐƠN HÀNG CHỜ XUẤT PHÔI =====
  const {
    data: donChoXuat = [],
    isLoading: dangTaiDon,
  } = useQuery({
    queryKey: ["inventory", "pending-orders", item?.id],
    queryFn: () => inventoryService.layDonChoXuat(item!.id),
    enabled: isOpen && !!item?.id,
    staleTime: 30_000,
  });

  // ===== GỌI API LỊCH SỬ BIẾN ĐỘNG =====
  const {
    data: lichSu = [],
    isLoading: dangTaiLichSu,
  } = useQuery({
    queryKey: ["inventory", "history", item?.id],
    queryFn: () => inventoryService.layLichSuBienDong(item!.id),
    enabled: isOpen && !!item?.id,
    staleTime: 30_000,
  });

  // Nếu chưa có item được chọn thì không render nội dung
  if (!item) return null;

  return (
    // Dùng Ant Design Drawer – trượt từ phải sang, rộng 420px
    <Drawer
      open={isOpen}
      onClose={onClose}
      size={420}
      closable={false}
      title={null}
      styles={{
        body: { padding: 0 },
        wrapper: { boxShadow: "none" },
      }}
      style={{ borderLeft: "1px solid #e2e8f0" }}
    >
      {/* Toàn bộ nội dung drawer chia thành 3 phần theo flexbox dọc */}
      <div className="flex h-full flex-col">

        {/* ===== PHẦN 1: HEADER DRAWER ===== */}
        <div className="flex h-16 items-center justify-between border-b border-border bg-surface-alt px-6">
          <h3 className="text-[17px] font-bold text-text-main">Chi tiết phôi áo</h3>
          {/* Nút đóng drawer */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-dim"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* ===== PHẦN 2: NỘI DUNG CUỘN ĐƯỢC ===== */}
        <div className="flex-1 space-y-8 overflow-y-auto p-6">

          {/* --- 2a. Thông tin tổng quan --- */}
          <div className="flex items-start gap-4">
            {/* Ô màu phôi áo (80×80px) – hiển thị màu tên vì không có mã hex từ API kho */}
            <div
              className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface-alt text-xs font-bold text-text-secondary"
              title={`Màu: ${item.mau}`}
            >
              {item.mau}
            </div>
            <div>
              {/* Tên + màu */}
              <h4 className="text-[16px] font-semibold text-text-main">
                {item.ten} – {item.mau}
              </h4>
              {/* SKU dạng tag đơn sắc */}
              <p className="mt-1 text-sm text-text-secondary">
                SKU:{" "}
                <span className="rounded border border-border bg-surface-alt px-1 py-0.5 font-mono text-xs">
                  {item.sku}
                </span>
              </p>
              {/* Badge size + badge trạng thái */}
              <div className="mt-2 flex gap-2">
                <span className="rounded border border-border bg-surface-alt px-2 py-1 text-xs font-medium text-text-secondary">
                  Size: {item.size}
                </span>
                <InventoryStatusBadge status={item.trangThai} />
              </div>
            </div>
          </div>

          {/* --- 2b. 3 ô mini thống kê tồn kho --- */}
          <div className="grid grid-cols-3 gap-3">
            {/* Ô tồn hiện tại */}
            <div className="rounded-lg border border-border bg-surface-alt p-3 text-center">
              <p className="mb-1 text-xs text-text-secondary">Tồn hiện tại</p>
              <p className="text-lg font-semibold text-text-main">{item.tonHienTai}</p>
            </div>
            {/* Ô đã giữ (Reserved) */}
            <div className="rounded-lg border border-border bg-surface-alt p-3 text-center">
              <p className="mb-1 text-xs text-text-secondary">Đã giữ (Reserved)</p>
              <p className="text-lg font-semibold text-text-main">{item.daGiu}</p>
            </div>
            {/* Ô khả dụng – nền xanh nhạt để nhấn mạnh */}
            <div className="rounded-lg border border-primary-fixed bg-primary-fixed-dim/20 p-3 text-center">
              <p className="mb-1 text-xs text-primary-container">Khả dụng</p>
              <p className="text-lg font-semibold text-primary-container">{item.khaDung}</p>
            </div>
          </div>

          {/* --- 2c. Danh sách đơn hàng đang chờ xuất phôi --- */}
          <div>
            {/* Tiêu đề + số lượng đơn */}
            <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
              <h5 className="text-sm font-semibold text-text-main">
                Đơn hàng đang chờ xuất phôi
              </h5>
              <span className="rounded bg-surface-alt px-2 py-0.5 text-xs text-text-secondary">
                {dangTaiDon ? "..." : `${donChoXuat.length} đơn`}
              </span>
            </div>

            {/* Trạng thái đang tải */}
            {dangTaiDon && (
              <div className="flex items-center gap-2 py-4 text-xs text-text-secondary">
                <LoadingOutlined spin />
                <span>Đang tải danh sách đơn hàng...</span>
              </div>
            )}

            {/* Danh sách đơn */}
            {!dangTaiDon && donChoXuat.length === 0 && (
              <p className="py-4 text-center text-xs text-text-muted">
                Không có đơn hàng nào đang chờ xuất phôi.
              </p>
            )}

            {!dangTaiDon && donChoXuat.length > 0 && (
              <ul className="space-y-3">
                {donChoXuat.map((don) => (
                  <li key={don.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {/* Chấm tròn tím làm điểm nhấn */}
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      {/* Mã đơn – màu xanh, có thể click để xem đơn */}
                      <a
                        href={`/admin/don-hang/${don.id}`}
                        className="font-medium text-primary-container hover:underline"
                      >
                        {don.id}
                      </a>
                      <span className="text-text-secondary">cần {don.soLuong} áo</span>
                    </div>
                    {/* Nút xuất phôi cho đơn này */}
                    <button
                      type="button"
                      className="rounded border border-border px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-alt"
                    >
                      Xuất phôi
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* --- 2d. Timeline lịch sử biến động --- */}
          <div>
            <h5 className="mb-3 border-b border-border pb-2 text-sm font-semibold text-text-main">
              Lịch sử biến động gần đây
            </h5>

            {/* Trạng thái đang tải */}
            {dangTaiLichSu && (
              <div className="flex items-center gap-2 py-4 text-xs text-text-secondary">
                <LoadingOutlined spin />
                <span>Đang tải lịch sử biến động...</span>
              </div>
            )}

            {/* Trống */}
            {!dangTaiLichSu && lichSu.length === 0 && (
              <p className="py-4 text-center text-xs text-text-muted">
                Chưa có biến động tồn kho nào được ghi nhận.
              </p>
            )}

            {/* Timeline */}
            {!dangTaiLichSu && lichSu.length > 0 && (
              /*
                Timeline dạng đường thẳng dọc:
                - "before:" tạo đường kẻ dọc màu xám từ trên xuống dưới
                - Mỗi sự kiện có chấm tròn màu ở bên trái
              */
              <div className="relative space-y-4 pl-4 before:absolute before:inset-y-0 before:left-[7px] before:w-px before:bg-border">
                {lichSu.map((su) => (
                  <div key={su.id} className="relative">
                    {/* Chấm tròn trên đường timeline, màu theo loại biến động */}
                    <span
                      className={`absolute -left-4 top-1 h-2 w-2 rounded-full ring-4 ring-surface ${getMauDotTimeline(su.loai)}`}
                    />
                    {/* Nội dung sự kiện */}
                    <p className="text-sm text-text-main">{su.moTa}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{su.thoiGian}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ===== PHẦN 3: FOOTER HÀNH ĐỘNG ===== */}
        <div className="flex gap-3 border-t border-border bg-surface p-4">
          {/* Nút phụ: điều chỉnh tồn kho */}
          <button
            type="button"
            onClick={() => onGiaoDich(item)}
            className="h-10 flex-1 rounded-lg border border-border text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            Điều chỉnh tồn
          </button>
          {/* Nút chính: nhập thêm phôi áo vào kho */}
          <button
            type="button"
            onClick={() => onGiaoDich(item)}
            className="h-10 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            Nhập thêm
          </button>
        </div>

      </div>
    </Drawer>
  );
}
