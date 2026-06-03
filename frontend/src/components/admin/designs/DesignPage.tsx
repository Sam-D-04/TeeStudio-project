"use client";

/**
 * DesignPage – Trang chính "Thiết kế & In ấn" (Orchestrator).
 *
 * Layout tổng thể:
 *  1. Tiêu đề trang + nhóm nút hành động (Thêm sticker, Thêm vị trí in, Xuất thông số in)
 *  2. 4 thẻ KPI thống kê
 *  3. Panel chính (Card trắng) với 3 tab:
 *     - Tab 1: Thiết kế khách hàng → FilterBar + DesignTable + Phân trang
 *     - Tab 2: Đơn cần in → PrintOrderTab
 *     - Tab 3: Tài nguyên thiết kế / Vị trí in → DesignResourceTab
 *
 * Ghi chú kiến trúc:
 *  - Tất cả state quản lý tại file này, truyền xuống component con qua props.
 *  - Dữ liệu hiển thị là dữ liệu tĩnh (mock data) – thực tế sẽ fetch từ API.
 *  - Không dùng Tailwind vì đây là admin module, dùng inline style theo pattern
 *    đã thống nhất trong các module khác (Orders, Promotions, Settings...).
 */

import { useState } from "react";
import {
  HighlightOutlined,
  PrinterOutlined,
  AppstoreOutlined,
  FieldTimeOutlined,
  ExportOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

// Import các component con
import DesignStatCard from "./DesignStatCard";
import DesignFilterBar, { type BoDucThietKe } from "./DesignFilterBar";
import DesignTable, { type ThietKe } from "./DesignTable";
import PrintOrderTab from "./PrintOrderTab";
import DesignResourceTab from "./DesignResourceTab";

// ─────────────────────────────────────────────────────────────────────────────
// Dữ liệu mẫu thiết kế khách hàng
// Thực tế: thay bằng gọi API GET /api/admin/designs
// ─────────────────────────────────────────────────────────────────────────────
const DU_LIEU_MAU_THIET_KE: ThietKe[] = [
  {
    id: 1,
    maThietKe: "TK-2024",
    mauAo: "#000000",
    tenKhachHang: "Nguyễn Văn A",
    soDienThoai: "0901234567",
    tenSanPham: "Áo thun Basic",
    tenMauAo: "Đen",
    viTriIn: "Ngực trái",
    trangThai: "cho_kiem_tra",
    ngayGui: "03/06/2026",
  },
  {
    id: 2,
    maThietKe: "TK-2023",
    mauAo: "#ffffff",
    tenKhachHang: "Trần Thị B",
    soDienThoai: "0912345678",
    tenSanPham: "Áo Polo",
    tenMauAo: "Trắng",
    viTriIn: "Sau lưng to",
    trangThai: "da_duyet",
    ngayGui: "02/06/2026",
  },
  {
    id: 3,
    maThietKe: "TK-2022",
    mauAo: "#dc2626",
    tenKhachHang: "Lê Hoàng Nam",
    soDienThoai: "0933456789",
    tenSanPham: "Áo thun Oversize",
    tenMauAo: "Đỏ",
    viTriIn: "Ngực phải",
    trangThai: "can_chinh_sua",
    ngayGui: "01/06/2026",
  },
  {
    id: 4,
    maThietKe: "TK-2021",
    mauAo: "#1e293b",
    tenKhachHang: "Công ty TNHH ABC",
    soDienThoai: "0944567890",
    tenSanPham: "Áo thun Corporate",
    tenMauAo: "Xanh navy",
    viTriIn: "Ngực trái",
    trangThai: "cho_kiem_tra",
    ngayGui: "01/06/2026",
  },
  {
    id: 5,
    maThietKe: "TK-2020",
    mauAo: "#0ea5e9",
    tenKhachHang: "Phạm Minh Tuấn",
    tenSanPham: "Áo thun Basic",
    tenMauAo: "Xanh sky",
    viTriIn: "Sau lưng",
    trangThai: "cho_kiem_tra",
    ngayGui: "31/05/2026",
  },
  {
    id: 6,
    maThietKe: "TK-2019",
    mauAo: "#16a34a",
    tenKhachHang: "Hội sinh viên ĐHBK",
    soDienThoai: "0955678901",
    tenSanPham: "Áo thun Basic",
    tenMauAo: "Xanh lá",
    viTriIn: "Ngực trái",
    trangThai: "da_duyet",
    ngayGui: "30/05/2026",
  },
  {
    id: 7,
    maThietKe: "TK-2018",
    mauAo: "#7c3aed",
    tenKhachHang: "Nguyễn Thị Lan",
    tenSanPham: "Áo Polo",
    tenMauAo: "Tím",
    viTriIn: "Tay trái",
    trangThai: "can_chinh_sua",
    ngayGui: "30/05/2026",
  },
];

// Tên các tab điều hướng
const DANH_SACH_TAB = [
  { key: "thiet_ke_khach_hang", nhan: "Thiết kế khách hàng", icon: <HighlightOutlined /> },
  { key: "don_can_in", nhan: "Đơn cần in", icon: <PrinterOutlined /> },
  { key: "tai_nguyen", nhan: "Tài nguyên thiết kế / Vị trí in", icon: <AppstoreOutlined /> },
] as const;

type TenTab = (typeof DANH_SACH_TAB)[number]["key"];

// ─────────────────────────────────────────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────────────────────────────────────────
export default function DesignPage() {
  // ── State điều hướng tab ──
  const [tabDangChon, setTabDangChon] = useState<TenTab>("thiet_ke_khach_hang");

  // ── State dữ liệu thiết kế ──
  const [danhSachThietKe, setDanhSachThietKe] = useState<ThietKe[]>(DU_LIEU_MAU_THIET_KE);

  // ── State bộ lọc bảng thiết kế ──
  const [boDuc, setBoDuc] = useState<BoDucThietKe>({
    tuKhoa: "",
    trangThai: "",
    viTriIn: "",
  });

  // ── Tính thống kê KPI ──
  const soChoKiemTra = danhSachThietKe.filter((tk) => tk.trangThai === "cho_kiem_tra").length;
  const soCanChinhSua = danhSachThietKe.filter((tk) => tk.trangThai === "can_chinh_sua").length;
  // Số liệu "Đơn chờ gửi xưởng" và "Đang in" trong thực tế lấy từ API riêng
  // Ở đây dùng giá trị tĩnh để minh họa
  const soDonChoGuiXuong = 14;
  const soDangIn = 12;

  // ── Lọc danh sách thiết kế theo bộ lọc ──
  const danhSachDaLoc = danhSachThietKe.filter((tk) => {
    // Lọc theo từ khóa (mã TK hoặc tên khách)
    if (boDuc.tuKhoa) {
      const tuKhoaLower = boDuc.tuKhoa.toLowerCase();
      const khopMa = tk.maThietKe.toLowerCase().includes(tuKhoaLower);
      const khopTen = tk.tenKhachHang.toLowerCase().includes(tuKhoaLower);
      if (!khopMa && !khopTen) return false;
    }
    // Lọc theo trạng thái
    if (boDuc.trangThai && tk.trangThai !== boDuc.trangThai) return false;
    // Lọc theo vị trí in (so sánh chuỗi đơn giản)
    if (boDuc.viTriIn) {
      // Ánh xạ giá trị dropdown sang nhãn tiếng Việt để so sánh
      const APDUNG_VI_TRI: Record<string, string> = {
        nguc_trai: "ngực trái",
        nguc_phai: "ngực phải",
        sau_lung: "sau lưng",
        tay_trai: "tay trái",
        tay_phai: "tay phải",
      };
      const viTriCan = APDUNG_VI_TRI[boDuc.viTriIn] || boDuc.viTriIn;
      if (!tk.viTriIn.toLowerCase().includes(viTriCan)) return false;
    }
    return true;
  });

  // ── Xử lý duyệt thiết kế ──
  function xuLyDuyetThietKe(id: number) {
    if (window.confirm("Bạn có chắc muốn duyệt thiết kế này?")) {
      // Thực tế: gọi API PATCH /api/admin/designs/:id { trangThai: "da_duyet" }
      setDanhSachThietKe((ds) =>
        ds.map((tk) =>
          tk.id === id ? { ...tk, trangThai: "da_duyet" as const } : tk
        )
      );
    }
  }

  // ── Xử lý yêu cầu chỉnh sửa ──
  function xuLyYeuCauChinhSua(id: number) {
    if (window.confirm("Bạn có chắc muốn yêu cầu khách chỉnh sửa thiết kế này?")) {
      // Thực tế: gọi API PATCH /api/admin/designs/:id { trangThai: "can_chinh_sua" }
      setDanhSachThietKe((ds) =>
        ds.map((tk) =>
          tk.id === id ? { ...tk, trangThai: "can_chinh_sua" as const } : tk
        )
      );
    }
  }

  // ── Xử lý xem chi tiết ──
  function xuLyXemChiTiet(id: number) {
    const tk = danhSachThietKe.find((t) => t.id === id);
    if (tk) {
      alert(`Xem chi tiết thiết kế: ${tk.maThietKe}\nKhách: ${tk.tenKhachHang}`);
      // Thực tế: mở drawer/modal xem chi tiết thiết kế
    }
  }

  return (
    // Container tổng thể – khoảng cách giữa các khối
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PHẦN 1: Tiêu đề trang + nhóm nút hành động                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Tiêu đề + mô tả */}
        <div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: "36px",
            }}
          >
            Thiết kế &amp; In ấn
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#475569",
              margin: "4px 0 0",
              lineHeight: "20px",
            }}
          >
            Quản lý thiết kế khách hàng, xử lý đơn cần gửi xưởng in và cấu hình tài nguyên thiết kế.
          </p>
        </div>

        {/* Nhóm nút hành động */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          {/* Nút phụ 1: Thêm sticker */}
          <button
            onClick={() => {
              setTabDangChon("tai_nguyen");
              alert("Vui lòng dùng nút 'Thêm sticker' trong tab Tài nguyên thiết kế");
            }}
            style={{
              height: 40,
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
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
            <PictureOutlined style={{ fontSize: 16 }} />
            Thêm sticker
          </button>

          {/* Nút phụ 2: Thêm vị trí in */}
          <button
            onClick={() => {
              setTabDangChon("tai_nguyen");
              alert("Vui lòng dùng nút 'Thêm vị trí in' trong tab Tài nguyên thiết kế");
            }}
            style={{
              height: 40,
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
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
            <EnvironmentOutlined style={{ fontSize: 16 }} />
            Thêm vị trí in
          </button>

          {/* Nút chính: Xuất thông số in */}
          <button
            onClick={() => alert("Chức năng xuất thông số in sẽ sinh file PDF/Excel cho xưởng in")}
            style={{
              height: 40,
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#0ea5e9",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(14,165,233,0.3)",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0284c7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0ea5e9";
            }}
          >
            <DownloadOutlined style={{ fontSize: 16 }} />
            Xuất thông số in
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PHẦN 2: 4 thẻ KPI thống kê                                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {/* Thẻ 1: Thiết kế chờ kiểm tra */}
        <DesignStatCard
          nhan="Thiết kế chờ kiểm tra"
          giaTri={soChoKiemTra}
          icon={<FieldTimeOutlined style={{ fontSize: 20 }} />}
          mauNenIcon="#fef3c7"
          mauIcon="#d97706"
          nhanBadge="CẦN XỬ LÝ"
          mauNenBadge="#fef3c7"
          mauChuBadge="#d97706"
        />

        {/* Thẻ 2: Thiết kế cần chỉnh sửa */}
        <DesignStatCard
          nhan="Thiết kế cần khách chỉnh sửa"
          giaTri={soCanChinhSua}
          icon={<ExportOutlined style={{ fontSize: 20 }} />}
          mauNenIcon="#f8fafc"
          mauIcon="#ea580c"
          nhanBadge="ĐANG CHỜ"
          mauNenBadge="#f8fafc"
          mauChuBadge="#475569"
        />

        {/* Thẻ 3: Đơn chờ gửi xưởng */}
        <DesignStatCard
          nhan="Đơn chờ gửi xưởng in"
          giaTri={soDonChoGuiXuong}
          icon={<ExportOutlined style={{ fontSize: 20 }} />}
          mauNenIcon="#e0f2fe"
          mauIcon="#0ea5e9"
          nhanBadge="SẴN SÀNG"
          mauNenBadge="#e0f2fe"
          mauChuBadge="#0ea5e9"
        />

        {/* Thẻ 4: Đơn đang in */}
        <DesignStatCard
          nhan="Đơn đang in tại xưởng"
          giaTri={soDangIn}
          icon={<PrinterOutlined style={{ fontSize: 20 }} />}
          mauNenIcon="#dcfce7"
          mauIcon="#10b981"
          nhanBadge="ĐANG TIẾN HÀNH"
          mauNenBadge="#dcfce7"
          mauChuBadge="#10b981"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PHẦN 3: Panel chính với Tab điều hướng                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
      >
        {/* ── Thanh Tab điều hướng ── */}
        <div
          style={{
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            gap: 0,
            padding: "0 16px",
            overflowX: "auto",
          }}
        >
          {DANH_SACH_TAB.map((tab) => {
            const dangDuocChon = tabDangChon === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setTabDangChon(tab.key)}
                style={{
                  height: 48,
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "none",
                  borderBottom: dangDuocChon ? "2px solid #0ea5e9" : "2px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: dangDuocChon ? 600 : 400,
                  color: dangDuocChon ? "#0ea5e9" : "#475569",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                  marginBottom: -1,   // Che đường viền bên dưới container
                }}
                onMouseEnter={(e) => {
                  if (!dangDuocChon) {
                    (e.currentTarget as HTMLButtonElement).style.color = "#0f172a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!dangDuocChon) {
                    (e.currentTarget as HTMLButtonElement).style.color = "#475569";
                  }
                }}
              >
                {tab.icon}
                {tab.nhan}
              </button>
            );
          })}
        </div>

        {/* ── Nội dung Tab 1: Thiết kế khách hàng ── */}
        {tabDangChon === "thiet_ke_khach_hang" && (
          <div>
            {/* Thanh lọc */}
            <DesignFilterBar boDuc={boDuc} onThayDoi={setBoDuc} />

            {/* Bảng dữ liệu */}
            <DesignTable
              danhSach={danhSachDaLoc}
              onXem={xuLyXemChiTiet}
              onYeuCauChinhSua={xuLyYeuCauChinhSua}
              onDuyet={xuLyDuyetThietKe}
            />

            {/* Phân trang */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, color: "#475569" }}>
                Hiển thị 1–{danhSachDaLoc.length} của {danhSachThietKe.length} thiết kế
              </span>

              <div style={{ display: "flex", gap: 4 }}>
                {/* Nút trang trước (disabled ở trang 1) */}
                <button
                  disabled
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    background: "#ffffff",
                    color: "#94a3b8",
                    cursor: "not-allowed",
                    fontSize: 16,
                  }}
                >
                  ‹
                </button>

                {/* Trang hiện tại */}
                <button
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #0ea5e9",
                    borderRadius: 6,
                    background: "#0ea5e9",
                    color: "#ffffff",
                    cursor: "default",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  1
                </button>

                {/* Nút trang sau */}
                <button
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    background: "#ffffff",
                    color: "#0f172a",
                    cursor: "pointer",
                    fontSize: 16,
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ffffff";
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Nội dung Tab 2: Đơn cần in ── */}
        {tabDangChon === "don_can_in" && <PrintOrderTab />}

        {/* ── Nội dung Tab 3: Tài nguyên thiết kế ── */}
        {tabDangChon === "tai_nguyen" && <DesignResourceTab />}
      </div>
    </div>
  );
}
