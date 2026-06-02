"use client";

import { SearchOutlined, CalendarOutlined } from "@ant-design/icons";
import type { PromotionStatus } from "./PromotionStatusBadge";

/**
 * PromotionFilterBar – Thanh lọc cho bảng Mã khuyến mãi.
 *
 * Gồm các bộ lọc:
 *  1. Ô tìm kiếm theo tên mã
 *  2. Dropdown lọc theo trạng thái
 *  3. Dropdown lọc theo loại giảm
 *  4. Nút chọn khoảng ngày (placeholder – chưa tích hợp date picker)
 */

// Kiểu dữ liệu cho bộ lọc hiện tại
export type BoDucMaKhuyenMai = {
  tuKhoa: string;              // Từ khóa tìm kiếm theo mã
  trangThai: PromotionStatus | ""; // "" = tất cả trạng thái
  loaiGiam: "phan_tram" | "so_tien" | "mien_phi_ship" | ""; // "" = tất cả
};

type PromotionFilterBarProps = {
  boDuc: BoDucMaKhuyenMai;                         // Giá trị bộ lọc hiện tại
  onThayDoi: (boDucMoi: BoDucMaKhuyenMai) => void; // Callback khi thay đổi bộ lọc
};

export default function PromotionFilterBar({
  boDuc,
  onThayDoi,
}: PromotionFilterBarProps) {
  // Hàm cập nhật một trường trong bộ lọc
  // Dùng spread operator để giữ các trường khác không đổi
  function capNhatTruong<K extends keyof BoDucMaKhuyenMai>(
    truong: K,
    giaTri: BoDucMaKhuyenMai[K],
  ) {
    onThayDoi({ ...boDuc, [truong]: giaTri });
  }

  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid #e2e8f0",
        backgroundColor: "#f8fafc",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Nhóm các bộ lọc bên trái */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1 }}>

        {/* 1. Ô tìm kiếm theo mã */}
        <div style={{ position: "relative", width: "100%", maxWidth: 260 }}>
          {/* Icon kính lúp */}
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: 14,
            }}
          >
            <SearchOutlined />
          </span>
          <input
            type="text"
            placeholder="Tìm theo mã..."
            value={boDuc.tuKhoa}
            onChange={(e) => capNhatTruong("tuKhoa", e.target.value)}
            style={{
              width: "100%",
              height: 40,
              paddingLeft: 34,
              paddingRight: 12,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 13,
              color: "#0f172a",
              outline: "none",
              boxSizing: "border-box",
            }}
            // Hiệu ứng focus: viền xanh
            onFocus={(e) => {
              e.target.style.borderColor = "#0ea5e9";
              e.target.style.boxShadow = "0 0 0 2px rgba(14,165,233,0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* 2. Dropdown lọc trạng thái */}
        <select
          value={boDuc.trangThai}
          onChange={(e) =>
            capNhatTruong(
              "trangThai",
              e.target.value as BoDucMaKhuyenMai["trangThai"],
            )
          }
          style={{
            height: 40,
            padding: "0 12px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 13,
            color: "#0f172a",
            outline: "none",
            minWidth: 160,
            cursor: "pointer",
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="dang_hoat_dong">Đang hoạt động</option>
          <option value="tam_dung">Tạm dừng</option>
          <option value="het_han">Hết hạn</option>
        </select>

        {/* 3. Dropdown lọc loại giảm */}
        <select
          value={boDuc.loaiGiam}
          onChange={(e) =>
            capNhatTruong(
              "loaiGiam",
              e.target.value as BoDucMaKhuyenMai["loaiGiam"],
            )
          }
          style={{
            height: 40,
            padding: "0 12px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 13,
            color: "#0f172a",
            outline: "none",
            minWidth: 150,
            cursor: "pointer",
          }}
        >
          <option value="">Loại giảm</option>
          <option value="phan_tram">Phần trăm (%)</option>
          <option value="so_tien">Số tiền</option>
          <option value="mien_phi_ship">Miễn phí ship</option>
        </select>

        {/* 4. Nút chọn ngày (placeholder) */}
        <button
          style={{
            height: 40,
            padding: "0 16px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 13,
            color: "#0f172a",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#f8fafc";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#ffffff";
          }}
          // Chưa tích hợp date picker – sẽ thêm sau
          onClick={() => alert("Tính năng chọn ngày sẽ tích hợp date picker")}
        >
          <CalendarOutlined style={{ fontSize: 14 }} />
          Chọn ngày
        </button>
      </div>
    </div>
  );
}
