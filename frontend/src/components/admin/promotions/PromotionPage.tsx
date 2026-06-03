"use client";

import { useState } from "react";
import {
  TagOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

// Import các component con đã tạo
import PromotionStatCard from "./PromotionStatCard";
import PromotionFilterBar, { type BoDucMaKhuyenMai } from "./PromotionFilterBar";
import PromotionTable, { type MaKhuyenMai } from "./PromotionTable";
import PromotionDrawer, { type FormMaKhuyenMai } from "./PromotionDrawer";
import BulkPricingTab from "./BulkPricingTab";
import PrintSurchargeTab from "./PrintSurchargeTab";
import PriceFormulaTab from "./PriceFormulaTab";

/**
 * PromotionPage – Trang chính "Khuyến mãi & Báo giá" (Orchestrator).
 *
 * Layout tổng thể:
 *  1. Tiêu đề trang + nút "Xuất cấu hình" + "Tạo mã khuyến mãi"
 *  2. 4 thẻ KPI thống kê
 *  3. Tab điều hướng (4 tab)
 *  4. Nội dung tab tương ứng:
 *     - Tab 1: Bảng mã khuyến mãi
 *     - Tab 2: Bảng giá số lượng lớn
 *     - Tab 3: Phụ phí in & thiết kế
 *     - Tab 4: Công thức báo giá
 *  5. Panel drawer tạo/sửa mã (luôn hiện ở bên phải)
 *
 * Ghi chú kiến trúc:
 *  - Tất cả state quản lý tại file này, truyền xuống component con qua props.
 *  - Dữ liệu hiển thị là dữ liệu tĩnh (mock data) – thực tế sẽ fetch từ API.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Dữ liệu mẫu tĩnh cho bảng mã khuyến mãi
// Trong thực tế: thay bằng gọi API GET /api/admin/promotions
// ─────────────────────────────────────────────────────────────────────────────
const DU_LIEU_MAU_MA: MaKhuyenMai[] = [
  {
    id: 1,
    ma: "TEE10",
    loaiGiam: "phan_tram",
    giaTriGiam: 10,
    donToiThieu: 0,
    ngayBatDau: "01/05",
    ngayKetThuc: null,
    daSDung: 850,
    gioiHanLuot: 1000,
    trangThai: "dang_hoat_dong",
  },
  {
    id: 2,
    ma: "SUMMER50K",
    loaiGiam: "so_tien",
    giaTriGiam: 50000,
    donToiThieu: 500000,
    ngayBatDau: "01/06",
    ngayKetThuc: "30/06",
    daSDung: 45,
    gioiHanLuot: 100,
    trangThai: "dang_hoat_dong",
  },
  {
    id: 3,
    ma: "FLASHFS",
    loaiGiam: "mien_phi_ship",
    giaTriGiam: 0,
    donToiThieu: 300000,
    ngayBatDau: "05/06",
    ngayKetThuc: "06/06",
    daSDung: 500,
    gioiHanLuot: 500,
    trangThai: "het_han",
  },
  {
    id: 4,
    ma: "NEWUSER20",
    loaiGiam: "phan_tram",
    giaTriGiam: 20,
    donToiThieu: 200000,
    ngayBatDau: "01/01",
    ngayKetThuc: "31/12",
    daSDung: 120,
    gioiHanLuot: 500,
    trangThai: "dang_hoat_dong",
  },
  {
    id: 5,
    ma: "VIP100K",
    loaiGiam: "so_tien",
    giaTriGiam: 100000,
    donToiThieu: 1000000,
    ngayBatDau: "15/05",
    ngayKetThuc: "15/07",
    daSDung: 33,
    gioiHanLuot: 50,
    trangThai: "tam_dung",
  },
];

// Tên hiển thị cho từng tab
const DANH_SACH_TAB = [
  { key: "ma_khuyen_mai", nhan: "Mã khuyến mãi" },
  { key: "gia_so_luong_lon", nhan: "Giá số lượng lớn" },
  { key: "phu_phi_in", nhan: "Phụ phí in & thiết kế" },
  { key: "cong_thuc_bao_gia", nhan: "Công thức báo giá" },
] as const;

type TenTab = (typeof DANH_SACH_TAB)[number]["key"];

// ─────────────────────────────────────────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────────────────────────────────────────
export default function PromotionPage() {
  // ── State điều hướng ──
  const [tabDangChon, setTabDangChon] = useState<TenTab>("ma_khuyen_mai");

  // ── State cho bảng mã khuyến mãi ──
  const [danhSachMa, setDanhSachMa] = useState<MaKhuyenMai[]>(DU_LIEU_MAU_MA);
  const [dsIDDaChon, setDsIDDaChon] = useState<number[]>([]);
  const [boDuc, setBoDuc] = useState<BoDucMaKhuyenMai>({
    tuKhoa: "",
    trangThai: "",
    loaiGiam: "",
  });

  // ── State cho Drawer ──
  const [moDrawer, setMoDrawer] = useState(false);
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  const [phienMoDrawer, setPhienMoDrawer] = useState(0);

  // Lấy mã đang được sửa (nếu có)
  const maDangSua = dangSuaId !== null
    ? danhSachMa.find((m) => m.id === dangSuaId) ?? null
    : null;

  // ── Tính thống kê KPI từ dữ liệu ──
  const soMaDangHoatDong = danhSachMa.filter(
    (m) => m.trangThai === "dang_hoat_dong",
  ).length;

  // Đếm mã sắp hết hạn: có ngày kết thúc và trong vòng 7 ngày tới
  // (Demo: đơn giản hóa, thực tế cần tính theo ngày thực)
  const soMaSapHetHan = danhSachMa.filter(
    (m) => m.ngayKetThuc !== null && m.trangThai === "dang_hoat_dong",
  ).length;

  const tongLuotDungThang = danhSachMa.reduce(
    (tong, m) => tong + m.daSDung,
    0,
  );

  // ── Lọc dữ liệu theo bộ lọc ──
  const danhSachDaLoc = danhSachMa.filter((ma) => {
    // Lọc theo từ khóa
    if (
      boDuc.tuKhoa &&
      !ma.ma.toLowerCase().includes(boDuc.tuKhoa.toLowerCase())
    ) {
      return false;
    }
    // Lọc theo trạng thái
    if (boDuc.trangThai && ma.trangThai !== boDuc.trangThai) {
      return false;
    }
    // Lọc theo loại giảm
    if (boDuc.loaiGiam && ma.loaiGiam !== boDuc.loaiGiam) {
      return false;
    }
    return true;
  });

  // ── Các hàm xử lý sự kiện ──

  // Chọn/bỏ chọn tất cả hàng trong bảng
  function xuLyChonTatCa(chonHet: boolean) {
    if (chonHet) {
      setDsIDDaChon(danhSachDaLoc.map((m) => m.id));
    } else {
      setDsIDDaChon([]);
    }
  }

  // Chọn/bỏ chọn từng hàng
  function xuLyChonMot(id: number) {
    setDsIDDaChon((dsHienTai) => {
      if (dsHienTai.includes(id)) {
        return dsHienTai.filter((i) => i !== id);
      } else {
        return [...dsHienTai, id];
      }
    });
  }

  // Mở drawer tạo mới
  function moDrawerTaoMoi() {
    setDangSuaId(null);
    setPhienMoDrawer((phien) => phien + 1);
    setMoDrawer(true);
  }

  // Mở drawer sửa
  function moDrawerSua(id: number) {
    setDangSuaId(id);
    setPhienMoDrawer((phien) => phien + 1);
    setMoDrawer(true);
  }

  // Đóng drawer
  function dongDrawer() {
    setMoDrawer(false);
    setDangSuaId(null);
  }

  // Lưu form (tạo mới hoặc cập nhật)
  // Thực tế: gọi POST hoặc PUT API tương ứng
  function luuForm(duLieu: FormMaKhuyenMai) {
    if (dangSuaId !== null) {
      // ── Chế độ sửa: cập nhật vào danh sách ──
      setDanhSachMa((ds) =>
        ds.map((m) =>
          m.id === dangSuaId
            ? {
                ...m,
                ma: duLieu.ma,
                loaiGiam: duLieu.loaiGiam,
                giaTriGiam: parseFloat(duLieu.giaTriGiam) || 0,
                donToiThieu: parseFloat(duLieu.donToiThieu) || 0,
                ngayBatDau: duLieu.ngayBatDau,
                ngayKetThuc: duLieu.ngayKetThuc || null,
                gioiHanLuot: duLieu.gioiHanLuot
                  ? parseInt(duLieu.gioiHanLuot)
                  : null,
              }
            : m,
        ),
      );
    } else {
      // ── Chế độ tạo mới: thêm vào đầu danh sách ──
      const maMoi: MaKhuyenMai = {
        id: Date.now(),
        ma: duLieu.ma,
        loaiGiam: duLieu.loaiGiam,
        giaTriGiam: parseFloat(duLieu.giaTriGiam) || 0,
        donToiThieu: parseFloat(duLieu.donToiThieu) || 0,
        ngayBatDau: duLieu.ngayBatDau,
        ngayKetThuc: duLieu.ngayKetThuc || null,
        daSDung: 0,
        gioiHanLuot: duLieu.gioiHanLuot
          ? parseInt(duLieu.gioiHanLuot)
          : null,
        trangThai: "dang_hoat_dong",
      };
      setDanhSachMa((ds) => [maMoi, ...ds]);
    }
    dongDrawer();
  }

  // Xóa mã khuyến mãi
  // Thực tế: gọi API DELETE /api/admin/promotions/:id
  function xuLyXoa(id: number) {
    if (window.confirm("Bạn có chắc muốn xóa mã khuyến mãi này?")) {
      setDanhSachMa((ds) => ds.filter((m) => m.id !== id));
      setDsIDDaChon((ds) => ds.filter((i) => i !== id));
    }
  }

  return (
    <>
      {/* ── Main content area ── */}
      {/* Drawer dùng overlay/mask nên nội dung phía sau giữ nguyên kích thước */}
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PHẦN 1: Tiêu đề trang                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
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
                Khuyến mãi &amp; Báo giá
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "#475569",
                  margin: "4px 0 0",
                  lineHeight: "20px",
                }}
              >
                Quản lý mã giảm giá, giá theo số lượng, phụ phí in và công thức báo giá.
              </p>
            </div>

            {/* Nhóm nút hành động */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Nút "Xuất cấu hình" – secondary */}
              <button
                style={{
                  height: 40,
                  padding: "0 16px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#475569",
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
                onClick={() => alert("Chức năng xuất cấu hình sẽ tích hợp sau")}
              >
                <DownloadOutlined />
                Xuất cấu hình
              </button>

              {/* Nút "Tạo mã khuyến mãi" – primary */}
              <button
                onClick={moDrawerTaoMoi}
                style={{
                  height: 40,
                  padding: "0 16px",
                  background: "#0ea5e9",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 1px 4px rgba(14,165,233,0.3)",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#0284c7";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#0ea5e9";
                }}
              >
                <PlusOutlined />
                Tạo mã khuyến mãi
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PHẦN 2: 4 thẻ KPI thống kê                                    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {/* Thẻ 1: Mã đang hoạt động */}
            <PromotionStatCard
              nhan="Mã đang hoạt động"
              giaTri={soMaDangHoatDong}
              icon={<TagOutlined style={{ fontSize: 18 }} />}
              mauNenIcon="#dcfce7"
              mauIcon="#10b981"
            />

            {/* Thẻ 2: Sắp hết hạn */}
            <PromotionStatCard
              nhan="Sắp hết hạn"
              giaTri={soMaSapHetHan}
              icon={<ClockCircleOutlined style={{ fontSize: 18 }} />}
              mauNenIcon="#ffdad6"
              mauIcon="#ea580c"
            />

            {/* Thẻ 3: Lượt dùng tháng này */}
            <PromotionStatCard
              nhan="Lượt dùng tháng này"
              giaTri={tongLuotDungThang}
              icon={<CheckCircleOutlined style={{ fontSize: 18 }} />}
              mauNenIcon="#c9e6ff"
              mauIcon="#006591"
            />

            {/* Thẻ 4: Giảm giá đã áp dụng */}
            <PromotionStatCard
              nhan="Giảm giá đã áp dụng"
              giaTri={
                <span style={{ fontSize: 18, lineHeight: 1 }}>
                  18.450.000đ
                </span>
              }
              icon={<DollarOutlined style={{ fontSize: 18 }} />}
              mauNenIcon="#cce5ff"
              mauIcon="#006398"
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PHẦN 3: Tab điều hướng                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div
            style={{
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              gap: 24,
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
                    paddingBottom: 12,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: dangDuocChon ? 600 : 400,
                    color: dangDuocChon ? "#0ea5e9" : "#475569",
                    borderBottom: dangDuocChon
                      ? "2px solid #0ea5e9"
                      : "2px solid transparent",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    marginBottom: -1, // Che viền borderBottom của container
                  }}
                  onMouseEnter={(e) => {
                    if (!dangDuocChon) {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#0f172a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!dangDuocChon) {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#475569";
                    }
                  }}
                >
                  {tab.nhan}
                </button>
              );
            })}
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PHẦN 4: Nội dung tab đang chọn                                 */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          {/* Tab 1: Mã khuyến mãi */}
          {tabDangChon === "ma_khuyen_mai" && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: 20,
                border: "1px solid #e2e8f0",
                boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
                overflow: "hidden",
              }}
            >
              {/* Thanh lọc */}
              <PromotionFilterBar boDuc={boDuc} onThayDoi={setBoDuc} />

              {/* Bảng dữ liệu */}
              <PromotionTable
                danhSach={danhSachDaLoc}
                dsIDDaChon={dsIDDaChon}
                onChonTatCa={xuLyChonTatCa}
                onChonMot={xuLyChonMot}
                onXem={(id) => {
                  // Xem chi tiết: mở drawer ở chế độ sửa (read-only sẽ thêm sau)
                  moDrawerSua(id);
                }}
                onSua={moDrawerSua}
                onXoa={xuLyXoa}
              />

              {/* Phân trang đơn giản */}
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, color: "#475569" }}>
                  Hiển thị 1–{danhSachDaLoc.length} của {danhSachMa.length} mã
                </span>

                <div style={{ display: "flex", gap: 4 }}>
                  {/* Nút trang trước */}
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
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        "#ffffff";
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Giá số lượng lớn */}
          {tabDangChon === "gia_so_luong_lon" && <BulkPricingTab />}

          {/* Tab 3: Phụ phí in & thiết kế */}
          {tabDangChon === "phu_phi_in" && <PrintSurchargeTab />}

          {/* Tab 4: Công thức báo giá */}
          {tabDangChon === "cong_thuc_bao_gia" && <PriceFormulaTab />}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PHẦN 5: Drawer tạo/sửa mã (panel cố định bên phải)               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <PromotionDrawer
        key={phienMoDrawer}
        moDrawer={moDrawer}
        dangSua={dangSuaId !== null}
        duLieuDangSua={maDangSua}
        onDong={dongDrawer}
        onLuu={luuForm}
      />
    </>
  );
}
