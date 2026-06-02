"use client";

import { Drawer } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import type { InventoryItem } from "./InventoryTable";
import InventoryStatusBadge from "./InventoryStatusBadge";

/**
 * InventoryDetailDrawer – drawer (ngăn trượt từ phải) hiển thị chi tiết phôi áo.
 *
 * Mở khi người dùng bấm nút "Xem chi tiết" trên bảng.
 * Gồm các phần:
 * 1. Header: tiêu đề + nút đóng
 * 2. Thông tin tổng quan: ô màu + tên + SKU + size + badge trạng thái
 * 3. 3 ô mini thống kê: Tồn hiện tại / Đã giữ / Khả dụng
 * 4. Danh sách đơn hàng đang chờ xuất phôi
 * 5. Timeline lịch sử biến động tồn kho gần đây
 * 6. Footer: nút "Điều chỉnh tồn" + nút "Nhập thêm"
 */

// Kiểu dữ liệu cho một mục trong lịch sử biến động
type LichSuBienDong = {
  id: number;
  moTa: string;       // Mô tả biến động, ví dụ "+50 áo (Nhập kho #PO-092)"
  thoiGian: string;   // Thời gian, ví dụ "Hôm nay, 09:42 AM"
  loai: "nhap" | "xuat" | "giu"; // Loại biến động để chọn màu dot
};

// Kiểu dữ liệu cho đơn hàng đang chờ xuất phôi
type DonChoXuat = {
  id: string;     // Mã đơn, ví dụ "ORD-2938"
  soLuong: number; // Số áo cần xuất
};

// Kiểu dữ liệu props nhận từ component cha (InventoryPage)
type InventoryDetailDrawerProps = {
  isOpen: boolean;             // Drawer đang mở hay đóng
  onClose: () => void;         // Hàm gọi khi đóng drawer
  item: InventoryItem | null;  // Dữ liệu phôi áo đang được xem (null nếu chưa chọn)
};

// ===== DỮ LIỆU MẪU – thay bằng API thực sau =====
// Danh sách đơn hàng đang chờ xuất phôi áo (giả lập)
const donChoXuatMau: DonChoXuat[] = [
  { id: "ORD-2938", soLuong: 4 },
  { id: "ORD-2941", soLuong: 6 },
];

// Lịch sử biến động tồn kho gần đây (giả lập)
const lichSuMau: LichSuBienDong[] = [
  { id: 1, moTa: "+50 áo", thoiGian: "Hôm nay, 09:42 SA", loai: "nhap" },
  { id: 2, moTa: "-12 áo (Giữ cho đơn ORD-2938)", thoiGian: "Hôm qua, 14:20 CH", loai: "giu" },
];

// Lấy màu cho điểm tròn trong timeline theo loại biến động
function getMauDotTimeline(loai: LichSuBienDong["loai"]): string {
  if (loai === "nhap") return "bg-[#059669]";   // Xanh lá khi nhập kho
  if (loai === "giu")  return "bg-[#d97706]";   // Vàng khi giữ lại
  return "bg-[#b91c1c]";                         // Đỏ khi xuất kho
}

export default function InventoryDetailDrawer({
  isOpen,
  onClose,
  item,
}: InventoryDetailDrawerProps) {
  // Nếu chưa có item được chọn thì không render nội dung
  if (!item) return null;

  return (
    // Dùng Ant Design Drawer – trượt từ phải sang, rộng 420px
    // Tắt header mặc định của Ant Design (closable=false, title=null)
    // để tự vẽ header theo đúng thiết kế
    <Drawer
      open={isOpen}
      onClose={onClose}
      size={420}
      closable={false}        // Tắt nút X mặc định của Ant Design
      title={null}            // Tắt thanh tiêu đề mặc định
      styles={{
        body: { padding: 0 },                    // Xóa padding mặc định của body
        wrapper: { boxShadow: "none" },
      }}
      style={{ borderLeft: "1px solid #e2e8f0" }} // Viền trái theo thiết kế
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
        {/* flex-1 + overflow-y-auto: phần này cuộn được khi nội dung dài */}
        <div className="flex-1 space-y-8 overflow-y-auto p-6">

          {/* --- 2a. Thông tin tổng quan --- */}
          <div className="flex items-start gap-4">
            {/* Ô màu phôi áo (80×80px) */}
            <div
              className="h-20 w-20 flex-shrink-0 rounded-xl border border-border"
              style={{ backgroundColor: item.mauHex }}
              title={`Màu: ${item.mau}`}
            />
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
                {donChoXuatMau.length} đơn
              </span>
            </div>

            {/* Danh sách đơn */}
            <ul className="space-y-3">
              {donChoXuatMau.map((don) => (
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
          </div>

          {/* --- 2d. Timeline lịch sử biến động --- */}
          <div>
            <h5 className="mb-3 border-b border-border pb-2 text-sm font-semibold text-text-main">
              Lịch sử biến động gần đây
            </h5>
            {/*
              Timeline dạng đường thẳng dọc:
              - "before:" tạo đường kẻ dọc màu xám từ trên xuống dưới
              - Mỗi sự kiện có chấm tròn màu ở bên trái
            */}
            <div className="relative space-y-4 pl-4 before:absolute before:inset-y-0 before:left-[7px] before:w-px before:bg-border">
              {lichSuMau.map((su) => (
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
          </div>

        </div>

        {/* ===== PHẦN 3: FOOTER HÀNH ĐỘNG ===== */}
        {/* Luôn hiển thị ở dưới cùng, không cuộn theo nội dung */}
        <div className="flex gap-3 border-t border-border bg-surface p-4">
          {/* Nút phụ: điều chỉnh tồn kho */}
          <button
            type="button"
            className="h-10 flex-1 rounded-lg border border-border text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            Điều chỉnh tồn
          </button>
          {/* Nút chính: nhập thêm phôi áo vào kho */}
          <button
            type="button"
            className="h-10 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            Nhập thêm
          </button>
        </div>

      </div>
    </Drawer>
  );
}
