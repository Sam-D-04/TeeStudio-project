"use client";

import { SyncOutlined, EyeOutlined } from "@ant-design/icons";
import InventoryStatusBadge, { type InventoryStatus } from "./InventoryStatusBadge";

/**
 * InventoryTable – bảng dữ liệu tồn kho chính.
 *
 * Mỗi hàng hiển thị một biến thể áo (SKU cụ thể: tên + màu + size).
 * Mỗi hàng luôn hiển thị hai nút hành động:
 * - "Nhập/Xuất" (icon sync_alt): ghi nhận biến động tồn kho
 * - "Xem chi tiết" (icon visibility): mở drawer xem chi tiết
 *
 * Cột dữ liệu:
 * Phôi áo | Biến thể | SKU | Tồn hiện tại | Đã giữ | Khả dụng | Trạng thái | Hành động
 */

// Kiểu dữ liệu cho một biến thể phôi áo trong kho
export type InventoryItem = {
  id: number;
  ten: string;           // Tên sản phẩm, ví dụ "Basic Cotton Tee"
  mau: string;           // Màu sắc, ví dụ "Trắng"
  mauHex?: string;       // Mã màu hex để vẽ ô màu, ví dụ "#ffffff"
  size: string;          // Kích cỡ, ví dụ "M"
  sku: string;           // Mã SKU duy nhất, ví dụ "TS-TEE-WHT-M"
  tonHienTai: number;    // Tổng số áo đang có trong kho
  daGiu: number;         // Số áo đang bị giữ lại cho các đơn đang xử lý (Reserved)
  khaDung: number;       // Số áo còn có thể bán/xuất; stock đã được trừ khi tạo đơn
  trangThai: InventoryStatus; // Trạng thái: "con_hang" | "sap_het" | "het_hang"
};

// Kiểu dữ liệu props của bảng
type InventoryTableProps = {
  items: InventoryItem[];              // Danh sách biến thể cần hiển thị
  onViewDetail: (item: InventoryItem) => void; // Hàm mở drawer xem chi tiết
  onGiaoDich: (item: InventoryItem) => void;   // Hàm mở modal nhập/xuất kho
};

export default function InventoryTable({
  items,
  onViewDetail,
  onGiaoDich,
}: InventoryTableProps) {
  return (
    // Wrapper cho phép scroll ngang khi màn hình nhỏ
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">

        {/* ===== HEADER BẢNG ===== */}
        <thead>
          <tr className="border-b border-border bg-surface-container-low text-text-secondary">

            {/* Cột tên phôi áo (ảnh minh họa màu + tên + màu sắc) */}
            <th className="p-4 text-xs font-semibold uppercase tracking-wider">Phôi áo</th>

            {/* Cột biến thể (size) */}
            <th className="p-4 text-xs font-semibold uppercase tracking-wider">Biến thể</th>

            {/* Cột mã SKU */}
            <th className="p-4 text-xs font-semibold uppercase tracking-wider">SKU</th>

            {/* Cột số lượng tồn hiện tại */}
            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider">
              Tồn hiện tại
            </th>

            {/* Cột số lượng đã giữ (Reserved) */}
            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider">
              Đã giữ
            </th>

            {/* Cột số lượng khả dụng (có thể xuất/bán) */}
            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider">
              Khả dụng
            </th>

            {/* Cột trạng thái tồn kho */}
            <th className="p-4 text-xs font-semibold uppercase tracking-wider">Trạng thái</th>

            {/* Cột hành động */}
            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>

        {/* ===== NỘI DUNG BẢNG ===== */}
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            // Chọn màu hiển thị cho cột "Khả dụng" theo tình trạng tồn kho
            const khaDungColor =
              item.trangThai === "het_hang"
                ? "text-[#b91c1c]"    // Đỏ khi hết hàng
                : item.trangThai === "sap_het"
                ? "text-[#d97706]"    // Vàng khi sắp hết
                : "text-primary-container"; // Xanh khi còn hàng

            return (
              // Mỗi hàng đổi nền khi hover
              <tr
                key={item.id}
                className="transition-colors hover:bg-surface-alt"
              >
                {/* Ô thông tin phôi áo: ô màu minh họa + tên + màu */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Ô hình vuông nhỏ hiển thị màu của phôi áo */}
                    <div
                      className="h-10 w-10 flex-shrink-0 rounded-lg border border-border"
                      style={{ backgroundColor: item.mauHex || "#f3f4f6" }}
                      title={`Màu: ${item.mau}`}
                    />
                    <div>
                      {/* Tên sản phẩm */}
                      <p className="text-sm font-semibold text-text-main">{item.ten}</p>
                      {/* Màu sắc */}
                      <p className="text-xs text-text-secondary">{item.mau}</p>
                    </div>
                  </div>
                </td>

                {/* Ô kích cỡ */}
                <td className="p-4">
                  <span className="text-sm text-text-main">Size {item.size}</span>
                </td>

                {/* Ô mã SKU – dùng font mono để dễ đọc mã */}
                <td className="p-4">
                  <span className="font-mono text-xs text-text-secondary">{item.sku}</span>
                </td>

                {/* Ô tồn hiện tại */}
                <td className="p-4 text-right">
                  <span className="text-sm font-semibold text-text-main">{item.tonHienTai}</span>
                </td>

                {/* Ô đã giữ – màu xám nhạt vì là thông tin phụ */}
                <td className="p-4 text-right">
                  <span className="text-sm text-text-secondary">{item.daGiu}</span>
                </td>

                {/* Ô khả dụng – màu thay đổi theo trạng thái tồn kho */}
                <td className="p-4 text-right">
                  <span className={`text-sm font-semibold ${khaDungColor}`}>{item.khaDung}</span>
                </td>

                {/* Ô badge trạng thái */}
                <td className="p-4">
                  <InventoryStatusBadge status={item.trangThai} />
                </td>

                {/* Ô hành động luôn hiển thị */}
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">

                    {/* Nút nhập/xuất kho */}
                    <button
                      type="button"
                      title="Nhập / Xuất kho"
                      onClick={() => onGiaoDich(item)}
                      className="flex h-8 w-8 items-center justify-center rounded text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
                    >
                      <SyncOutlined style={{ fontSize: 16 }} />
                    </button>

                    {/* Nút xem chi tiết – mở drawer */}
                    <button
                      type="button"
                      title="Xem chi tiết"
                      onClick={() => onViewDetail(item)}
                      className="flex h-8 w-8 items-center justify-center rounded text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
                    >
                      <EyeOutlined style={{ fontSize: 16 }} />
                    </button>

                  </div>
                </td>
              </tr>
            );
          })}

          {/* Hiển thị khi không có dữ liệu */}
          {items.length === 0 && (
            <tr>
              <td colSpan={8} className="py-12 text-center text-sm text-text-muted">
                Không tìm thấy biến thể nào phù hợp.
              </td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  );
}
