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
 * Kiến trúc:
 *  - Dữ liệu lấy từ API thật qua React Query (useQuery/useMutation).
 *  - State quản lý UI (tab, filter, phân trang) tại file này.
 *  - Component con nhận dữ liệu qua props.
 */

import { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HighlightOutlined,
  PrinterOutlined,
  AppstoreOutlined,
  FieldTimeOutlined,
  ExportOutlined,
  DownloadOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";

// Service gọi API
import * as designService from "@/services/admin/designService";

// Import các component con
import DesignStatCard from "./DesignStatCard";
import DesignFilterBar, { type BoDucThietKe } from "./DesignFilterBar";
import DesignTable from "./DesignTable";
import PrintOrderTab from "./PrintOrderTab";
import DesignResourceTab from "./DesignResourceTab";

// ─────────────────────────────────────────────────────────────────────────────
// Cấu hình tab điều hướng
// ─────────────────────────────────────────────────────────────────────────────
const DANH_SACH_TAB = [
  { key: "thiet_ke_khach_hang", nhan: "Thiết kế khách hàng", icon: <HighlightOutlined /> },
  { key: "don_can_in", nhan: "Đơn cần in", icon: <PrinterOutlined /> },
  { key: "tai_nguyen", nhan: "Tài nguyên thiết kế / Vị trí in", icon: <AppstoreOutlined /> },
] as const;

type TenTab = (typeof DANH_SACH_TAB)[number]["key"];

export type DesignInitialFilters = {
  tab?: TenTab;
  designStatus?: string;
  printStatus?: string;
};

type DesignPageProps = {
  initialFilters?: DesignInitialFilters;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────────────────────────────────────────
export default function DesignPage({ initialFilters }: DesignPageProps) {
  const queryClient = useQueryClient();

  // ── State điều hướng tab ──
  const [tabDangChon, setTabDangChon] = useState<TenTab>(
    initialFilters?.tab ?? "thiet_ke_khach_hang"
  );
  const [locTrangThaiDonIn, setLocTrangThaiDonIn] = useState(
    initialFilters?.printStatus ?? ""
  );

  // ── State phân trang bảng thiết kế ──
  const [trangHienTai, setTrangHienTai] = useState(1);

  // ── State bộ lọc bảng thiết kế ──
  const [boDuc, setBoDuc] = useState<BoDucThietKe>({
    tuKhoa: "",
    trangThai: initialFilters?.designStatus ?? "",
    viTriIn: "",
  });

  // ─── Fetch dữ liệu KPI thống kê ─────────────────────────────────────────
  const {
    data: thongKe,
    isLoading: dangTaiThongKe,
  } = useQuery({
    queryKey: ["thiet-ke-thong-ke"],
    queryFn: designService.layThongKeThietKe,
    staleTime: 30_000,  // 30 giây
  });

  // ─── Fetch danh sách thiết kế ───────────────────────────────────────────
  const {
    data: ketQuaThietKe,
    isLoading: dangTaiThietKe,
    isError: loiThietKe,
  } = useQuery({
    queryKey: ["thiet-ke-danh-sach", trangHienTai, boDuc],
    queryFn: () =>
      designService.layDanhSachThietKe({
        page: trangHienTai,
        limit: 10,
        tu_khoa: boDuc.tuKhoa,
        trang_thai: boDuc.trangThai,
        vi_tri_in: boDuc.viTriIn,
      }),
    staleTime: 15_000,
  });

  // ─── Mutation: Duyệt thiết kế ───────────────────────────────────────────
  const mutationDuyet = useMutation({
    mutationFn: (id: number) => designService.duyetThietKe(id),
    onSuccess: () => {
      // Reload lại cả danh sách và KPI
      queryClient.invalidateQueries({ queryKey: ["thiet-ke-danh-sach"] });
      queryClient.invalidateQueries({ queryKey: ["thiet-ke-thong-ke"] });
    },
    onError: (err: Error) => {
      alert(`Lỗi khi duyệt thiết kế: ${err.message}`);
    },
  });

  // ─── Mutation: Yêu cầu chỉnh sửa ────────────────────────────────────────
  const mutationChinhSua = useMutation({
    mutationFn: ({ id, ghiChu }: { id: number; ghiChu?: string }) =>
      designService.yeuCauChinhSua(id, ghiChu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thiet-ke-danh-sach"] });
      queryClient.invalidateQueries({ queryKey: ["thiet-ke-thong-ke"] });
    },
    onError: (err: Error) => {
      alert(`Lỗi khi gửi yêu cầu chỉnh sửa: ${err.message}`);
    },
  });

  // ─── Xử lý thay đổi bộ lọc: reset về trang 1 ──────────────────────────
  function xuLyThayDoiBoDuc(boDucMoi: BoDucThietKe) {
    setBoDuc(boDucMoi);
    setTrangHienTai(1);
  }

  // ─── Xử lý duyệt thiết kế ──────────────────────────────────────────────
  function xuLyDuyetThietKe(id: number) {
    if (window.confirm("Bạn có chắc muốn duyệt thiết kế này?\nSau khi duyệt, đơn in sẽ được tạo tự động.")) {
      mutationDuyet.mutate(id);
    }
  }

  // ─── Xử lý yêu cầu chỉnh sửa ──────────────────────────────────────────
  function xuLyYeuCauChinhSua(id: number) {
    const ghiChu = window.prompt(
      "Nhập ghi chú cho khách hàng (lý do cần chỉnh sửa):",
      ""
    );
    if (ghiChu !== null) {
      // null = nhấn Cancel; chuỗi rỗng = không nhập ghi chú nhưng vẫn gửi
      mutationChinhSua.mutate({ id, ghiChu: ghiChu || undefined });
    }
  }

  // ─── Xử lý xem chi tiết ────────────────────────────────────────────────
  function xuLyXemChiTiet(id: number) {
    alert(`Chức năng xem chi tiết thiết kế #${id} sẽ mở drawer trong phiên bản tiếp theo.`);
  }

  // ─── Dữ liệu hiển thị ──────────────────────────────────────────────────
  const danhSachThietKe = ketQuaThietKe?.danhSach ?? [];
  const tongSo = ketQuaThietKe?.tongSo ?? 0;
  const tongSoTrang = ketQuaThietKe?.tongSoTrang ?? 1;

  // Giá trị KPI
  const soChoKiemTra = thongKe?.soChoKiemTra ?? 0;
  const soCanChinhSua = thongKe?.soCanChinhSua ?? 0;
  const soDonChoGuiXuong = thongKe?.soDonChoGuiXuong ?? 0;
  const soDangIn = thongKe?.soDangIn ?? 0;

  return (
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
            onClick={() => setTabDangChon("tai_nguyen")}
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
            onClick={() => setTabDangChon("tai_nguyen")}
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
        <DesignStatCard
          nhan="Thiết kế chờ kiểm tra"
          giaTri={dangTaiThongKe ? "..." : soChoKiemTra}
          icon={<FieldTimeOutlined style={{ fontSize: 20 }} />}
          mauNenIcon="#fef3c7"
          mauIcon="#d97706"
          nhanBadge="CẦN XỬ LÝ"
          mauNenBadge="#fef3c7"
          mauChuBadge="#d97706"
          href="/admin/thiet-ke?tab=DESIGNS&status=PENDING_REVIEW"
          isActive={
            tabDangChon === "thiet_ke_khach_hang" &&
            boDuc.trangThai === "cho_kiem_tra" &&
            boDuc.tuKhoa === "" &&
            boDuc.viTriIn === ""
          }
        />

        <DesignStatCard
          nhan="Thiết kế cần khách chỉnh sửa"
          giaTri={dangTaiThongKe ? "..." : soCanChinhSua}
          icon={<ExportOutlined style={{ fontSize: 20 }} />}
          mauNenIcon="#f8fafc"
          mauIcon="#ea580c"
          nhanBadge="ĐANG CHỜ"
          mauNenBadge="#f8fafc"
          mauChuBadge="#475569"
          href="/admin/thiet-ke?tab=DESIGNS&status=NEEDS_REVISION"
          isActive={
            tabDangChon === "thiet_ke_khach_hang" &&
            boDuc.trangThai === "can_chinh_sua" &&
            boDuc.tuKhoa === "" &&
            boDuc.viTriIn === ""
          }
        />

        <DesignStatCard
          nhan="Đơn chờ gửi xưởng in"
          giaTri={dangTaiThongKe ? "..." : soDonChoGuiXuong}
          icon={<ExportOutlined style={{ fontSize: 20 }} />}
          mauNenIcon="#e0f2fe"
          mauIcon="#0ea5e9"
          nhanBadge="SẴN SÀNG"
          mauNenBadge="#e0f2fe"
          mauChuBadge="#0ea5e9"
          href="/admin/thiet-ke?tab=PRINT_ORDERS&status=APPROVED"
          isActive={
            tabDangChon === "don_can_in" &&
            locTrangThaiDonIn === "cho_gui_xuong"
          }
        />

        <DesignStatCard
          nhan="Đơn đang in tại xưởng"
          giaTri={dangTaiThongKe ? "..." : soDangIn}
          icon={<PrinterOutlined style={{ fontSize: 20 }} />}
          mauNenIcon="#dcfce7"
          mauIcon="#10b981"
          nhanBadge="ĐANG TIẾN HÀNH"
          mauNenBadge="#dcfce7"
          mauChuBadge="#10b981"
          href="/admin/thiet-ke?tab=PRINT_ORDERS&status=PRINTING"
          isActive={
            tabDangChon === "don_can_in" &&
            locTrangThaiDonIn === "dang_in"
          }
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
                  marginBottom: -1,
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
            <DesignFilterBar boDuc={boDuc} onThayDoi={xuLyThayDoiBoDuc} />

            {/* Trạng thái đang tải */}
            {dangTaiThietKe && (
              <div
                style={{
                  padding: "48px 0",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: 14,
                }}
              >
                <LoadingOutlined style={{ fontSize: 24, marginBottom: 8, display: "block" }} />
                Đang tải danh sách thiết kế...
              </div>
            )}

            {/* Trạng thái lỗi */}
            {loiThietKe && !dangTaiThietKe && (
              <div
                style={{
                  padding: "48px 0",
                  textAlign: "center",
                  color: "#ef4444",
                  fontSize: 14,
                }}
              >
                <WarningOutlined style={{ fontSize: 24, marginBottom: 8, display: "block" }} />
                Không thể tải dữ liệu. Vui lòng thử lại sau.
              </div>
            )}

            {/* Bảng dữ liệu */}
            {!dangTaiThietKe && !loiThietKe && (
              <DesignTable
                danhSach={danhSachThietKe}
                onXem={xuLyXemChiTiet}
                onYeuCauChinhSua={xuLyYeuCauChinhSua}
                onDuyet={xuLyDuyetThietKe}
                dangXuLy={mutationDuyet.isPending || mutationChinhSua.isPending}
              />
            )}

            {/* Phân trang */}
            {!dangTaiThietKe && !loiThietKe && (
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
                  Tổng cộng {tongSo} thiết kế
                </span>

                <div style={{ display: "flex", gap: 4 }}>
                  {/* Nút trang trước */}
                  <button
                    disabled={trangHienTai <= 1}
                    onClick={() => setTrangHienTai((t) => Math.max(1, t - 1))}
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      background: "#ffffff",
                      color: trangHienTai <= 1 ? "#94a3b8" : "#0f172a",
                      cursor: trangHienTai <= 1 ? "not-allowed" : "pointer",
                      fontSize: 16,
                    }}
                  >
                    ‹
                  </button>

                  {/* Các nút trang */}
                  {Array.from({ length: tongSoTrang }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === tongSoTrang ||
                        Math.abs(p - trangHienTai) <= 1
                    )
                    .map((p, idx, arr) => (
                      <Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span
                            key={`ellipsis-${p}`}
                            style={{ display: "flex", alignItems: "center", padding: "0 4px", color: "#94a3b8" }}
                          >
                            …
                          </span>
                        )}
                        <button
                          key={p}
                          onClick={() => setTrangHienTai(p)}
                          style={{
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: p === trangHienTai ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                            borderRadius: 6,
                            background: p === trangHienTai ? "#0ea5e9" : "#ffffff",
                            color: p === trangHienTai ? "#ffffff" : "#0f172a",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: p === trangHienTai ? 600 : 400,
                          }}
                        >
                          {p}
                        </button>
                      </Fragment>
                    ))}

                  {/* Nút trang sau */}
                  <button
                    disabled={trangHienTai >= tongSoTrang}
                    onClick={() => setTrangHienTai((t) => Math.min(tongSoTrang, t + 1))}
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      background: "#ffffff",
                      color: trangHienTai >= tongSoTrang ? "#94a3b8" : "#0f172a",
                      cursor: trangHienTai >= tongSoTrang ? "not-allowed" : "pointer",
                      fontSize: 16,
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Nội dung Tab 2: Đơn cần in ── */}
        {tabDangChon === "don_can_in" && (
          <PrintOrderTab
            statusFilter={locTrangThaiDonIn}
            onStatusFilterChange={setLocTrangThaiDonIn}
          />
        )}

        {/* ── Nội dung Tab 3: Tài nguyên thiết kế ── */}
        {tabDangChon === "tai_nguyen" && <DesignResourceTab />}
      </div>
    </div>
  );
}
