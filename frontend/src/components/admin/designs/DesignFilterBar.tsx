"use client";

/**
 * DesignFilterBar – Thanh lọc cho bảng thiết kế khách hàng.
 *
 * Bao gồm:
 *  - Ô tìm kiếm theo mã TK hoặc tên khách
 *  - Dropdown lọc theo trạng thái (Tất cả / Chờ kiểm tra / Cần chỉnh sửa / Đã duyệt)
 *  - Dropdown lọc theo vị trí in (Mặt trước / Mặt sau)
 *  - Bộ lọc khoảng ngày gửi thiết kế
 *
 * Props:
 *  - boDuc: object chứa các giá trị lọc hiện tại
 *  - onThayDoi: hàm gọi khi người dùng thay đổi bất kỳ bộ lọc nào
 */

import { SearchOutlined, SyncOutlined } from "@ant-design/icons";
import DateRangeFilter from "@/components/admin/common/DateRangeFilter";

// Kiểu dữ liệu cho bộ lọc – dùng chung giữa DesignFilterBar và DesignPage
export type BoDucThietKe = {
  tuKhoa: string;       // Từ khóa tìm kiếm theo mã TK hoặc tên khách
  trangThai: string;    // Trạng thái: "" = tất cả | "cho_kiem_tra" | "can_chinh_sua" | "da_duyet"
  viTriIn: string;      // Vị trí in: "" = tất cả | "mat_truoc" | "mat_sau"
  tuNgay: string;       // Ngày gửi từ (YYYY-MM-DD)
  denNgay: string;      // Ngày gửi đến (YYYY-MM-DD)
};

type DesignFilterBarProps = {
  boDuc: BoDucThietKe;
  onThayDoi: (boDucMoi: BoDucThietKe) => void;
  onDatLai: () => void;
};

export default function DesignFilterBar({ boDuc, onThayDoi, onDatLai }: DesignFilterBarProps) {
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
        <option value="mat_truoc">Mặt trước</option>
        <option value="mat_sau">Mặt sau</option>
      </select>

      {/* ── Lọc theo ngày gửi thiết kế ── */}
      <DateRangeFilter
        key={`${boDuc.tuNgay}-${boDuc.denNgay}`}
        initialPreset={boDuc.tuNgay && boDuc.denNgay ? "custom" : "all"}
        initialStartDate={boDuc.tuNgay}
        initialEndDate={boDuc.denNgay}
        allowClear
        onChange={(tuNgay, denNgay) =>
          onThayDoi({ ...boDuc, tuNgay, denNgay })
        }
        onClear={() =>
          onThayDoi({ ...boDuc, tuNgay: "", denNgay: "" })
        }
        className="w-full lg:w-auto"
        selectClassName="h-10"
        rangePickerClassName="h-10 min-w-[240px] sm:w-[280px]"
      />

      <button
        type="button"
        onClick={onDatLai}
        className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
      >
        <SyncOutlined /> Đặt lại
      </button>
    </div>
  );
}
