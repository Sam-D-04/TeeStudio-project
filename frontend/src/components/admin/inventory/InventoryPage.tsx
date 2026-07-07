"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  HistoryOutlined,
  PlusSquareOutlined,
  InboxOutlined,
  WarningOutlined,
  ExportOutlined,
  ImportOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import InventoryStatCard from "./InventoryStatCard";
import InventoryFilterBar from "./InventoryFilterBar";
import InventoryTable, { type InventoryItem } from "./InventoryTable";
import InventoryDetailDrawer from "./InventoryDetailDrawer";
import InventoryPagination from "./InventoryPagination";
import InventoryTransactionModal from "./InventoryTransactionModal";
import * as inventoryService from "@/services/admin/inventoryService";

/**
 * InventoryPage – component client chính của trang Quản lý Kho hàng.
 *
 * Đã kết nối API thật thông qua React Query + inventoryService.
 * Frontend chỉ giữ UI, state giao diện và gọi API – không chứa mock data.
 *
 * Cấu trúc giao diện:
 * ┌─────────────────────────────────────────────┐
 * │  Tiêu đề trang + 2 nút hành động           │
 * │  [Stat 1] [Stat 2] [Stat 3] [Stat 4]       │
 * │  ┌─ Card bảng ─────────────────────────┐   │
 * │  │  InventoryFilterBar                 │   │
 * │  │  InventoryTable                     │   │
 * │  │  InventoryPagination                │   │
 * │  └─────────────────────────────────────┘   │
 * └─────────────────────────────────────────────┘
 * (Overlay) InventoryDetailDrawer
 * (Modal)   InventoryTransactionModal
 */

// Số dòng hiển thị mỗi trang
const SO_MOI_TRANG = 10;
const NGUONG_SAP_HET = 20;

function tinhTrangThaiTheoKhaDung(khaDung: number): InventoryItem["trangThai"] {
  if (khaDung <= 0) return "het_hang";
  if (khaDung <= NGUONG_SAP_HET) return "sap_het";
  return "con_hang";
}

type InventoryPageProps = {
  initialStockFilter?: string;
  initialVariantId?: number;
  initialSearchKeyword?: string;
};

export default function InventoryPage({
  initialStockFilter = "tat_ca",
  initialVariantId,
  initialSearchKeyword = "",
}: InventoryPageProps) {
  const router = useRouter();
  // ===== TRẠNG THÁI UI =====

  /** Từ khóa tìm kiếm trong ô search */
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState(initialSearchKeyword);

  /** ID biến thể khi đi từ link "Xem trong kho" ở trang phôi áo */
  const [bienTheId, setBienTheId] = useState<number | undefined>(
    initialVariantId
  );

  /** Pill filter đang được chọn */
  const [boLocHienTai, setBoLocHienTai] = useState(initialStockFilter);

  /** Khoảng ngày phát sinh biến động kho */
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");

  /** Key để force re-render components bộ lọc (vd: xoá ngày tháng về null) */
  const [filterKey, setFilterKey] = useState(0);

  /** Trang hiện tại trong phân trang */
  const [trangHienTai, setTrangHienTai] = useState(1);

  /** Item đang được xem chi tiết trong drawer (null = drawer đóng) */
  const [itemDangXem, setItemDangXem] = useState<InventoryItem | null>(null);

  /** Item đang mở modal nhập/xuất kho (null = modal đóng) */
  const [itemGiaoDich, setItemGiaoDich] = useState<InventoryItem | null>(null);

  // ===== GỌI API THỐNG KÊ KPI =====
  const {
    data: thongKe,
    isLoading: dangTaiThongKe,
  } = useQuery({
    queryKey: ["inventory", "stats"],
    queryFn: inventoryService.layThongKeKho,
    staleTime: 30_000,
  });

  // ===== GỌI API DANH SÁCH TỒN KHO =====
  const {
    data: ketQuaDanhSach,
    isLoading: dangTaiDanhSach,
    isError: loiDanhSach,
  } = useQuery({
    queryKey: [
      "inventory",
      "list",
      trangHienTai,
      bienTheId,
      tuKhoaTimKiem,
      boLocHienTai,
      tuNgay,
      denNgay,
    ],
    queryFn: () =>
      inventoryService.layDanhSachTonKho({
        trang: trangHienTai,
        soMoiTrang: SO_MOI_TRANG,
        variantId: bienTheId,
        tuKhoa: tuKhoaTimKiem,
        boLoc: boLocHienTai,
        tuNgay,
        denNgay,
      }),
    staleTime: 15_000,
    placeholderData: (prev) => prev, // giữ dữ liệu cũ khi đang tải trang mới
  });

  const danhSachHienThi: InventoryItem[] = (ketQuaDanhSach?.danhSach ?? []).map(
    (item) => {
      // Backend đã giảm tonHienTai ngay khi đơn được tạo.
      // daGiu là lượng thuộc các đơn đang hoạt động, không trừ thêm lần nữa.
      const khaDung = item.khaDung ?? item.tonHienTai;
      return {
        ...item,
        khaDung,
        trangThai: tinhTrangThaiTheoKhaDung(khaDung),
      };
    }
  );
  const tongSo = ketQuaDanhSach?.tongSo ?? 0;
  const tongSoTrang = ketQuaDanhSach?.tongSoTrang ?? 1;

  // ===== XỬ LÝ BỘ LỌC + TÌM KIẾM =====

  /** Bỏ ràng buộc biến thể từ link khi người dùng chủ động thay đổi bộ lọc. */
  function xoaBoLocBienTheTuLienKet() {
    if (!bienTheId) return;

    setBienTheId(undefined);
    const url = new URL(window.location.href);
    url.searchParams.delete("variantId");
    url.searchParams.delete("sku");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  /** Reset về trang 1 khi đổi bộ lọc */
  function xuLyDoiBoLoc(key: string) {
    xoaBoLocBienTheTuLienKet();
    setBoLocHienTai(key);
    setTrangHienTai(1);
  }

  /** Reset về trang 1 khi tìm kiếm */
  function xuLyTimKiem(val: string) {
    xoaBoLocBienTheTuLienKet();
    setTuKhoaTimKiem(val);
    setTrangHienTai(1);
  }

  function xuLyDoiNgay(startDate: string, endDate: string) {
    xoaBoLocBienTheTuLienKet();
    setTuNgay(startDate);
    setDenNgay(endDate);
    setTrangHienTai(1);
  }

  function xuLyXoaNgay() {
    xoaBoLocBienTheTuLienKet();
    setTuNgay("");
    setDenNgay("");
    setTrangHienTai(1);
  }

  function xuLyKpiFilter(boLoc: string) {
    xoaBoLocBienTheTuLienKet();
    setTuKhoaTimKiem("");
    setBoLocHienTai(boLoc);
    setTuNgay("");
    setDenNgay("");
    setTrangHienTai(1);
  }

  function xuLyResetBoLoc() {
    xuLyKpiFilter("tat_ca");
    setFilterKey((prev) => prev + 1);
    router.replace("/admin/kho-hang");
  }

  // ===== HIỂN THỊ GIÁ TRỊ THỐNG KÊ =====
  const tongPhoi = thongKe?.tongPhoi ?? 0;
  const sapHet = thongKe?.sapHet ?? 0;
  const daGiu = thongKe?.daGiu ?? 0;
  const nhapThang = thongKe?.nhapThang ?? 0;

  return (
    <div className="space-y-6">

      {/* ===== TIÊU ĐỀ TRANG + NÚT HÀNH ĐỘNG ===== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-black leading-[36px] tracking-tight text-text-main">
            Quản lý kho phôi áo
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Theo dõi tồn kho áo theo màu, size và SKU trước khi chuyển sang xưởng in.
          </p>
        </div>

        {/* Nhóm nút hành động */}
        <div className="flex items-center gap-3">
          {/* Nút phụ: xem lịch sử kho – điều hướng sang trang lịch sử */}
          <Link
            href="/admin/kho-hang/lich-su"
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            <HistoryOutlined />
            Lịch sử kho
          </Link>

          {/* Nút chính: nhập kho phôi áo – điều hướng sang trang nhập kho */}
          <Link
            href="/admin/kho-hang/nhap-kho"
            className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            <PlusSquareOutlined />
            Nhập kho phôi áo
          </Link>
        </div>
      </div>

      {/* ===== 4 THẺ THỐNG KÊ KPI ===== */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Thẻ 1: Tổng phôi còn tồn */}
        <InventoryStatCard
          icon={<InboxOutlined style={{ fontSize: 20 }} />}
          title="Tổng phôi áo còn tồn"
          value={dangTaiThongKe ? "..." : tongPhoi.toLocaleString("vi-VN")}
          badge="+5%"
          colorScheme="default"
          onClick={xuLyResetBoLoc}
          isActive={
            boLocHienTai === "tat_ca" &&
            tuKhoaTimKiem === "" &&
            tuNgay === "" &&
            denNgay === ""
          }
        />
        {/* Thẻ 2: Biến thể sắp hết */}
        <InventoryStatCard
          icon={<WarningOutlined style={{ fontSize: 20 }} />}
          title="Biến thể sắp hết"
          value={dangTaiThongKe ? "..." : sapHet}
          valueSuffix="SKU"
          badge="Cảnh báo"
          colorScheme="warning"
          href="/admin/kho-hang?stock=LOW_STOCK"
          onClick={() => xuLyKpiFilter("sap_het")}
          isActive={
            boLocHienTai === "sap_het" &&
            tuKhoaTimKiem === "" &&
            tuNgay === "" &&
            denNgay === ""
          }
        />
        {/* Thẻ 3: Cần xuất cho đơn in */}
        <InventoryStatCard
          icon={<ExportOutlined style={{ fontSize: 20 }} />}
          title="Cần xuất cho đơn in"
          value={dangTaiThongKe ? "..." : daGiu}
          colorScheme="accent"
          href="/admin/kho-hang?stock=RESERVED"
          onClick={() => xuLyKpiFilter("can_xuat")}
          isActive={
            boLocHienTai === "can_xuat" &&
            tuKhoaTimKiem === "" &&
            tuNgay === "" &&
            denNgay === ""
          }
        />
        {/* Thẻ 4: Nhập kho trong tháng */}
        <InventoryStatCard
          icon={<ImportOutlined style={{ fontSize: 20 }} />}
          title="Nhập kho trong tháng"
          value={dangTaiThongKe ? "..." : `+${nhapThang.toLocaleString("vi-VN")}`}
          colorScheme="success"
          href="/admin/kho-hang?transaction=IMPORT&period=THIS_MONTH"
          onClick={() => xuLyKpiFilter("nhap_thang")}
          isActive={
            boLocHienTai === "nhap_thang" &&
            tuKhoaTimKiem === "" &&
            tuNgay === "" &&
            denNgay === ""
          }
        />
      </div>

      {/* ===== CARD BẢNG DỮ LIỆU ===== */}
      <div className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

        {/* Thanh lọc */}
        <InventoryFilterBar
          key={`filter-bar-${filterKey}`}
          searchValue={tuKhoaTimKiem}
          onSearchChange={xuLyTimKiem}
          activeFilter={boLocHienTai}
          onFilterChange={xuLyDoiBoLoc}
          onDateChange={xuLyDoiNgay}
          onDateClear={xuLyXoaNgay}
          onResetFilters={xuLyResetBoLoc}
        />

        {/* Trạng thái lỗi */}
        {loiDanhSach && (
          <div className="py-12 text-center text-sm text-[#b91c1c]">
            Không thể tải dữ liệu kho hàng. Vui lòng thử lại.
          </div>
        )}

        {/* Trạng thái đang tải */}
        {dangTaiDanhSach && !ketQuaDanhSach && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-secondary">
            <LoadingOutlined style={{ fontSize: 20 }} className="animate-spin" />
            <span>Đang tải dữ liệu kho hàng...</span>
          </div>
        )}

        {/* Bảng dữ liệu */}
        {!loiDanhSach && (
          <div className={dangTaiDanhSach ? "opacity-60 transition-opacity" : ""}>
            <InventoryTable
              items={danhSachHienThi}
              onViewDetail={(item) => setItemDangXem(item)}
              onGiaoDich={(item) => setItemGiaoDich(item)}
            />
          </div>
        )}

        {/* Phân trang */}
        {!loiDanhSach && (
          <InventoryPagination
            currentPage={trangHienTai}
            totalPages={tongSoTrang}
            totalItems={tongSo}
            pageSize={SO_MOI_TRANG}
            onPageChange={setTrangHienTai}
          />
        )}
      </div>

      {/* ===== DRAWER CHI TIẾT PHÔI ÁO ===== */}
      <InventoryDetailDrawer
        isOpen={itemDangXem !== null}
        onClose={() => setItemDangXem(null)}
        item={itemDangXem}
        onGiaoDich={(item) => {
          setItemDangXem(null);
          setItemGiaoDich(item);
        }}
      />

      {/* ===== MODAL NHẬP/XUẤT/ĐIỀU CHỈNH KHO ===== */}
      <InventoryTransactionModal
        isOpen={itemGiaoDich !== null}
        onClose={() => setItemGiaoDich(null)}
        item={itemGiaoDich}
      />

    </div>
  );
}
