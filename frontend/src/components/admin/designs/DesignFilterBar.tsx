"use client";

/**
 * DesignFilterBar – Thanh lọc cho bảng thiết kế khách hàng.
 *
 * Bao gồm:
 *  - Ô tìm kiếm theo mã TK hoặc tên khách
 *  - Dropdown lọc theo trạng thái (Tất cả / Chờ kiểm tra / Cần chỉnh sửa / Đã duyệt)
 *  - Dropdown lọc theo vị trí in (Tất cả / Ngực trái / Sau lưng / v.v.)
 *  - Nút lọc theo ngày (chức năng cơ bản)
 *
 * Props:
 *  - boDuc: object chứa các giá trị lọc hiện tại
 *  - onThayDoi: hàm gọi khi người dùng thay đổi bất kỳ bộ lọc nào
 */

import { SearchOutlined, CalendarOutlined } from "@ant-design/icons";

// Kiểu dữ liệu cho bộ lọc – dùng chung giữa DesignFilterBar và DesignPage
export type BoDucThietKe = {
  tuKhoa: string;       // Từ khóa tìm kiếm theo mã TK hoặc tên khách
  trangThai: string;    // Trạng thái: "" = tất cả | "cho_kiem_tra" | "can_chinh_sua" | "da_duyet"
  viTriIn: string;      // Vị trí in: "" = tất cả | "nguc_trai" | "sau_lung" | ...
};

type DesignFilterBarProps = {
  boDuc: BoDucThietKe;
  onThayDoi: (boDucMoi: BoDucThietKe) => void;
};

export default function DesignFilterBar({ boDuc, onThayDoi }: DesignFilterBarProps) {
  // Hàm tiện ích: cập nhật 1 trường trong bộ lọc, giữ nguyên các trường khác
  function capNhatBoDuc(truong: keyof BoDucThietKe, giaTri: string) {
    onThayDoi({ ...boDuc, [truong]: giaTri });
  }

  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        flexWrap: "wrap",           // Xuống hàng trên màn hình nhỏ
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* ── Ô tìm kiếm ── */}
      <div style={{ position: "relative", flex: "1", minWidth: 200, maxWidth: 280 }}>
        {/* Icon kính lúp */}
        <SearchOutlined
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
            fontSize: 14,
            pointerEvents: "none",  // Không chặn click vào input
          }}
        />
        <input
          type="text"
          placeholder="Tìm mã TK, tên khách..."
          value={boDuc.tuKhoa}
          onChange={(e) => capNhatBoDuc("tuKhoa", e.target.value)}
          style={{
            width: "100%",
            height: 40,
            paddingLeft: 34,        // Nhường chỗ cho icon search
            paddingRight: 12,
            background: "#f8fafc",  // Surface Alt
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 13,
            color: "#0f172a",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = "#0ea5e9";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = "#e2e8f0";
          }}
        />
      </div>

      {/* ── Dropdown lọc trạng thái ── */}
      <select
        value={boDuc.trangThai}
        onChange={(e) => capNhatBoDuc("trangThai", e.target.value)}
        style={{
          height: 40,
          padding: "0 12px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 13,
          color: boDuc.trangThai ? "#0f172a" : "#94a3b8",  // Xám khi chưa chọn
          outline: "none",
          cursor: "pointer",
          minWidth: 160,
          transition: "border-color 0.15s ease",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLSelectElement).style.borderColor = "#0ea5e9";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLSelectElement).style.borderColor = "#e2e8f0";
        }}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="cho_kiem_tra">Chờ kiểm tra</option>
        <option value="can_chinh_sua">Cần chỉnh sửa</option>
        <option value="da_duyet">Đã duyệt</option>
      </select>

      {/* ── Dropdown lọc vị trí in ── */}
      <select
        value={boDuc.viTriIn}
        onChange={(e) => capNhatBoDuc("viTriIn", e.target.value)}
        style={{
          height: 40,
          padding: "0 12px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 13,
          color: boDuc.viTriIn ? "#0f172a" : "#94a3b8",
          outline: "none",
          cursor: "pointer",
          minWidth: 150,
          transition: "border-color 0.15s ease",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLSelectElement).style.borderColor = "#0ea5e9";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLSelectElement).style.borderColor = "#e2e8f0";
        }}
      >
        <option value="">Mọi vị trí in</option>
        <option value="nguc_trai">Ngực trái</option>
        <option value="nguc_phai">Ngực phải</option>
        <option value="sau_lung">Sau lưng</option>
        <option value="tay_trai">Tay trái</option>
        <option value="tay_phai">Tay phải</option>
      </select>

      {/* ── Nút lọc theo ngày ── */}
      <button
        title="Lọc theo ngày gửi thiết kế"
        onClick={() => alert("Tính năng lọc theo ngày sẽ được tích hợp sau")}
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          color: "#475569",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = "#0ea5e9";
          btn.style.color = "#0ea5e9";
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = "#e2e8f0";
          btn.style.color = "#475569";
        }}
      >
        <CalendarOutlined style={{ fontSize: 16 }} />
      </button>
    </div>
  );
}
