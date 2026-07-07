"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  LoadingOutlined,
  HistoryOutlined,
  ImportOutlined,
  ExportOutlined,
  SwapOutlined,
  RollbackOutlined,
  ControlOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import * as inventoryService from "@/services/admin/inventoryService";
import type { GiaoDichKho } from "@/services/admin/inventoryService";

// ──────────────────────────────────────────────────────────────────
// HẰNG SỐ CẤU HÌNH
// ──────────────────────────────────────────────────────────────────

const SO_MOI_TRANG = 20;

/** Màu và icon theo loại giao dịch */
const KIEU_GIAO_DICH: Record<
  string,
  { nhan: string; mauNen: string; mauChu: string; icon: React.ReactNode }
> = {
  IMPORT: {
    nhan: "Nhập kho",
    mauNen: "bg-[#059669]/10",
    mauChu: "text-[#059669]",
    icon: <ImportOutlined />,
  },
  EXPORT: {
    nhan: "Xuất kho",
    mauNen: "bg-[#b91c1c]/10",
    mauChu: "text-[#b91c1c]",
    icon: <ExportOutlined />,
  },
  ORDER_EXPORT: {
    nhan: "Xuất đơn hàng",
    mauNen: "bg-[#7c3aed]/10",
    mauChu: "text-[#7c3aed]",
    icon: <SwapOutlined />,
  },
  RETURN: {
    nhan: "Hoàn trả",
    mauNen: "bg-[#d97706]/10",
    mauChu: "text-[#d97706]",
    icon: <RollbackOutlined />,
  },
  ADJUSTMENT: {
    nhan: "Điều chỉnh",
    mauNen: "bg-[#0284c7]/10",
    mauChu: "text-[#0284c7]",
    icon: <ControlOutlined />,
  },
};

const TU_KHOA_LOAI_GD = [
  { value: "tat_ca", label: "Tất cả loại" },
  { value: "IMPORT",       label: "📦 Nhập kho" },
  { value: "EXPORT",       label: "📤 Xuất kho" },
  { value: "ORDER_EXPORT", label: "🔄 Xuất đơn hàng" },
  { value: "RETURN",       label: "↩️ Hoàn trả" },
  { value: "ADJUSTMENT",   label: "⚙️ Điều chỉnh" },
];

// ──────────────────────────────────────────────────────────────────
// SUB-COMPONENT: Badge loại giao dịch
// ──────────────────────────────────────────────────────────────────
function BadgeLoai({ loai }: { loai: string }) {
  const kieu = KIEU_GIAO_DICH[loai] ?? {
    nhan: loai,
    mauNen: "bg-surface-alt",
    mauChu: "text-text-secondary",
    icon: <HistoryOutlined />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${kieu.mauNen} ${kieu.mauChu}`}
    >
      {kieu.icon}
      {kieu.nhan}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────
// SUB-COMPONENT: Số lượng với dấu +/-
// ──────────────────────────────────────────────────────────────────
function SoLuongBadge({ soLuong }: { soLuong: number }) {
  const isNhap = soLuong > 0;
  return (
    <span
      className={`inline-block min-w-[52px] rounded-md px-2 py-0.5 text-center text-sm font-bold tabular-nums ${
        isNhap
          ? "bg-[#059669]/10 text-[#059669]"
          : "bg-[#b91c1c]/10 text-[#b91c1c]"
      }`}
    >
      {isNhap ? "+" : ""}
      {soLuong}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────
// COMPONENT CHÍNH
// ──────────────────────────────────────────────────────────────────

/**
 * LichSuKhoPage – Trang Lịch sử kho phôi áo.
 *
 * Hiển thị toàn bộ giao dịch kho (nhập/xuất/điều chỉnh) dạng bảng
 * có phân trang, tìm kiếm theo SKU/sản phẩm và lọc theo loại giao dịch.
 */
export default function LichSuKhoPage() {
  const router = useRouter();

  // ── Bộ lọc + tìm kiếm ──
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [loaiGiaoDich, setLoaiGiaoDich] = useState("tat_ca");
  const [tuKhoa, setTuKhoa] = useState("");
  const [tuKhoaInput, setTuKhoaInput] = useState(""); // Giá trị đang gõ (debounced)

  // ── Tìm kiếm khi nhấn Enter hoặc click icon ──
  const xuLyTimKiem = useCallback(() => {
    setTuKhoa(tuKhoaInput);
    setTrangHienTai(1);
  }, [tuKhoaInput]);

  function xuLyDoiLoai(val: string) {
    setLoaiGiaoDich(val);
    setTrangHienTai(1);
  }

  function xuLyResetBoLoc() {
    setTuKhoa("");
    setTuKhoaInput("");
    setLoaiGiaoDich("tat_ca");
    setTrangHienTai(1);
    router.replace("/admin/kho-hang/lich-su");
  }

  // ── Gọi API ──
  const {
    data: ketQua,
    isLoading: dangTai,
    isError: loi,
    isFetching,
  } = useQuery({
    queryKey: ["inventory", "history", trangHienTai, loaiGiaoDich, tuKhoa],
    queryFn: () =>
      inventoryService.layLichSuKho({
        trang: trangHienTai,
        soMoiTrang: SO_MOI_TRANG,
        loaiGiaoDich,
        tuKhoa,
      }),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  const danhSach = ketQua?.danhSach ?? [];
  const tongSo = ketQua?.tongSo ?? 0;
  const tongSoTrang = ketQua?.tongSoTrang ?? 1;
  const tuItem = (trangHienTai - 1) * SO_MOI_TRANG + 1;
  const denItem = Math.min(trangHienTai * SO_MOI_TRANG, tongSo);

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ===== BREADCRUMB + TIÊU ĐỀ ===== */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm text-text-secondary">
          <Link
            href="/admin/kho-hang"
            className="flex items-center gap-1 transition-colors hover:text-primary-container"
          >
            <ArrowLeftOutlined />
            <span>Quay lại Quản lý kho</span>
          </Link>
          <span className="text-border">/</span>
          <span className="font-medium text-text-main">Lịch sử kho</span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[28px] font-black leading-[36px] tracking-tight text-text-main">
              Lịch sử kho phôi áo
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Toàn bộ giao dịch nhập kho, xuất kho, điều chỉnh và hoàn trả phôi áo.
            </p>
          </div>
          {tongSo > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-alt px-4 py-2 text-sm text-text-secondary">
              <HistoryOutlined />
              <span>
                Tổng cộng{" "}
                <strong className="text-text-main">
                  {tongSo.toLocaleString("vi-VN")}
                </strong>{" "}
                giao dịch
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== THANH TÌM KIẾM + BỘ LỌC ===== */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={tuKhoaInput}
            onChange={(e) => setTuKhoaInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && xuLyTimKiem()}
            placeholder="Tìm theo SKU hoặc tên sản phẩm..."
            className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-4 text-sm text-text-main outline-none transition-all focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
          {tuKhoaInput && (
            <button
              onClick={xuLyTimKiem}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-xs font-semibold text-primary-container transition-colors hover:bg-primary-container/10"
            >
              Tìm
            </button>
          )}
        </div>

        {/* Dropdown lọc loại giao dịch */}
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-text-muted" />
          <Select
            value={loaiGiaoDich}
            onChange={xuLyDoiLoai}
            className="w-52"
            size="middle"
            options={TU_KHOA_LOAI_GD}
          />
        </div>

        {/* Nút Đặt lại */}
        <button
          type="button"
          onClick={xuLyResetBoLoc}
          className="flex h-10 items-center justify-center rounded-[10px] bg-surface-alt px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-border hover:text-text-main sm:ml-auto"
        >
          Đặt lại
        </button>
      </div>

      {/* ===== BẢNG LỊCH SỬ ===== */}
      <div className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

        {/* Trạng thái lỗi */}
        {loi && (
          <div className="py-12 text-center text-sm text-[#b91c1c]">
            Không thể tải lịch sử kho. Vui lòng thử lại.
          </div>
        )}

        {/* Trạng thái đang tải lần đầu */}
        {dangTai && !ketQua && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-secondary">
            <LoadingOutlined style={{ fontSize: 20 }} className="animate-spin" />
            <span>Đang tải lịch sử kho...</span>
          </div>
        )}

        {/* Bảng dữ liệu */}
        {!loi && (ketQua || !dangTai) && (
          <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-surface-container-low text-text-secondary">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider">
                      Loại giao dịch
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider">
                      Phôi áo
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider">
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {danhSach.map((gd: GiaoDichKho) => (
                    <tr
                      key={gd.id}
                      className="transition-colors hover:bg-surface-alt"
                    >
                      {/* Thời gian */}
                      <td className="p-4">
                        <p className="text-sm font-medium text-text-main tabular-nums">
                          {gd.gio}
                        </p>
                        <p className="text-xs text-text-muted">{gd.ngay}</p>
                      </td>

                      {/* Badge loại */}
                      <td className="p-4">
                        <BadgeLoai loai={gd.loaiGiaoDich} />
                      </td>

                      {/* Sản phẩm + màu/size */}
                      <td className="p-4">
                        <p className="text-sm font-semibold text-text-main">
                          {gd.tenSanPham}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {gd.mau} / Size {gd.size}
                        </p>
                      </td>

                      {/* SKU */}
                      <td className="p-4">
                        <span className="font-mono text-xs text-text-secondary">
                          {gd.sku}
                        </span>
                      </td>

                      {/* Số lượng */}
                      <td className="p-4 text-right">
                        <SoLuongBadge soLuong={gd.soLuong} />
                      </td>

                      {/* Chi tiết */}
                      <td className="max-w-xs p-4">
                        <p className="truncate text-sm text-text-secondary">
                          {gd.moTa}
                        </p>
                        {gd.maDonHang && (
                          <Link
                            href={`/admin/don-hang/${gd.maDonHang}`}
                            className="mt-0.5 block text-xs text-primary-container hover:underline"
                          >
                            Đơn: {gd.maDonHang}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Không có dữ liệu */}
                  {!dangTai && danhSach.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <HistoryOutlined
                            style={{ fontSize: 40 }}
                            className="text-text-muted"
                          />
                          <p className="text-sm text-text-muted">
                            {tuKhoa || loaiGiaoDich !== "tat_ca"
                              ? "Không tìm thấy giao dịch phù hợp."
                              : "Chưa có giao dịch kho nào được ghi nhận."}
                          </p>
                          {(tuKhoa || loaiGiaoDich !== "tat_ca") && (
                            <button
                              type="button"
                              onClick={xuLyResetBoLoc}
                              className="text-xs text-primary-container underline hover:no-underline"
                            >
                              Xóa bộ lọc
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ===== PHÂN TRANG ===== */}
            {tongSoTrang > 1 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                {/* Thông tin phân trang */}
                <p className="text-sm text-text-secondary">
                  Hiển thị{" "}
                  <strong className="text-text-main">
                    {tuItem}–{denItem}
                  </strong>{" "}
                  trong{" "}
                  <strong className="text-text-main">
                    {tongSo.toLocaleString("vi-VN")}
                  </strong>{" "}
                  giao dịch
                </p>

                {/* Nhóm nút phân trang */}
                <div className="flex items-center gap-1">
                  {/* Nút Trước */}
                  <button
                    type="button"
                    onClick={() => setTrangHienTai((p) => Math.max(1, p - 1))}
                    disabled={trangHienTai === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-sm text-text-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ‹
                  </button>

                  {/* Các nút trang */}
                  {Array.from({ length: Math.min(5, tongSoTrang) }, (_, i) => {
                    let trang: number;
                    if (tongSoTrang <= 5) {
                      trang = i + 1;
                    } else if (trangHienTai <= 3) {
                      trang = i + 1;
                    } else if (trangHienTai >= tongSoTrang - 2) {
                      trang = tongSoTrang - 4 + i;
                    } else {
                      trang = trangHienTai - 2 + i;
                    }
                    const laTrangHienTai = trang === trangHienTai;
                    return (
                      <button
                        key={trang}
                        type="button"
                        onClick={() => setTrangHienTai(trang)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          laTrangHienTai
                            ? "bg-primary-container text-on-primary"
                            : "border border-border text-text-secondary hover:bg-surface-alt"
                        }`}
                      >
                        {trang}
                      </button>
                    );
                  })}

                  {/* Nút Sau */}
                  <button
                    type="button"
                    onClick={() =>
                      setTrangHienTai((p) => Math.min(tongSoTrang, p + 1))
                    }
                    disabled={trangHienTai === tongSoTrang}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-sm text-text-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
