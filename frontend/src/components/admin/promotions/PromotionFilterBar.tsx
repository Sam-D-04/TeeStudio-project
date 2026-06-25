"use client";

import { SearchOutlined } from "@ant-design/icons";
import DateRangeFilter from "@/components/admin/common/DateRangeFilter";
import type { PromotionStatus } from "./PromotionStatusBadge";

export type BoDucMaKhuyenMai = {
  tuKhoa: string;
  trangThai: PromotionStatus | "";
  loaiGiam: "phan_tram" | "so_tien" | "mien_phi_van_chuyen" | "";
  tuNgay: string;
  denNgay: string;
};

type Props = {
  boDuc: BoDucMaKhuyenMai;
  onThayDoi: (boDucMoi: BoDucMaKhuyenMai) => void;
  onReset: () => void;
};

const controlStyle: React.CSSProperties = {
  height: 40,
  padding: "0 12px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 13,
  color: "#0f172a",
  outline: "none",
};

export default function PromotionFilterBar({ boDuc, onThayDoi, onReset }: Props) {
  function capNhat<K extends keyof BoDucMaKhuyenMai>(
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
        gap: 10,
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", width: 240 }}>
        <SearchOutlined
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
          }}
        />
        <input
          value={boDuc.tuKhoa}
          onChange={(event) => capNhat("tuKhoa", event.target.value)}
          placeholder="Tìm theo mã..."
          style={{ ...controlStyle, width: "100%", paddingLeft: 34, boxSizing: "border-box" }}
        />
      </div>

      <select
        value={boDuc.trangThai}
        onChange={(event) =>
          capNhat("trangThai", event.target.value as BoDucMaKhuyenMai["trangThai"])
        }
        style={{ ...controlStyle, minWidth: 160 }}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="dang_hoat_dong">Đang hoạt động</option>
        <option value="sap_dien_ra">Sắp diễn ra</option>
        <option value="tam_dung">Tạm dừng</option>
        <option value="het_han">Hết hạn</option>
      </select>

      <select
        value={boDuc.loaiGiam}
        onChange={(event) =>
          capNhat("loaiGiam", event.target.value as BoDucMaKhuyenMai["loaiGiam"])
        }
        style={{ ...controlStyle, minWidth: 170 }}
      >
        <option value="">Tất cả loại giảm</option>
        <option value="phan_tram">Phần trăm</option>
        <option value="so_tien">Số tiền</option>
        <option value="mien_phi_van_chuyen">Miễn phí vận chuyển</option>
      </select>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-text-secondary">
          Thời gian hiệu lực
        </span>
        <DateRangeFilter
          initialPreset="custom"
          allowClear
          onChange={(startDate, endDate) =>
            onThayDoi({
              ...boDuc,
              tuNgay: startDate,
              denNgay: endDate,
            })
          }
          onClear={() =>
            onThayDoi({
              ...boDuc,
              tuNgay: "",
              denNgay: "",
            })
          }
          selectClassName="h-10"
          rangePickerClassName="h-10 sm:w-[280px]"
        />
      </div>

      <button
        onClick={onReset}
        style={{
          height: 40,
          padding: "0 16px",
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          color: "#475569",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        className="hover:bg-slate-200 transition-colors"
      >
        Đặt lại
      </button>
    </div>
  );
}
