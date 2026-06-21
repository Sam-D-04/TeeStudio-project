"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

export default function InventoryPage() {
  // ===== TRẠNG THÁI UI =====

  /** Từ khóa tìm kiếm trong ô search */
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  /** Pill filter đang được chọn */
  const [boLocHienTai, setBoLocHienTai] = useState("tat_ca");

  /** Trang hiện tại trong phân trang */
  const [trangHienTai, setTrangHienTai] = useState(1);

  /** Danh sách ID các hàng đang được tích checkbox */
  const [idDaChon, setIdDaChon] = useState<number[]>([]);

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
    queryKey: ["inventory", "list", trangHienTai, tuKhoaTimKiem, boLocHienTai],
    queryFn: () =>
      inventoryService.layDanhSachTonKho({
        trang: trangHienTai,
        soMoiTrang: SO_MOI_TRANG,
        tuKhoa: tuKhoaTimKiem,
        boLoc: boLocHienTai,
      }),
    staleTime: 15_000,
    placeholderData: (prev) => prev, // giữ dữ liệu cũ khi đang tải trang mới
  });

  const danhSachHienThi = ketQuaDanhSach?.danhSach ?? [];
  const tongSo = ketQuaDanhSach?.tongSo ?? 0;
  const tongSoTrang = ketQuaDanhSach?.tongSoTrang ?? 1;

  // ===== XỬ LÝ CHECKBOX =====

  /** Tích/bỏ tích một item */
  function xuLyChonItem(id: number) {
    setIdDaChon((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  /** Tích/bỏ tích tất cả item của trang hiện tại */
  function xuLyChonTatCa() {
    const idTrangHienTai = danhSachHienThi.map((i) => i.id);
    const tatCaDaChon = idTrangHienTai.every((id) => idDaChon.includes(id));
    if (tatCaDaChon) {
      setIdDaChon((prev) => prev.filter((id) => !idTrangHienTai.includes(id)));
    } else {
      setIdDaChon((prev) => [...new Set([...prev, ...idTrangHienTai])]);
    }
  }

  // ===== XỬ LÝ BỘ LỌC + TÌM KIẾM =====

  /** Reset về trang 1 khi đổi bộ lọc */
  function xuLyDoiBoLoc(key: string) {
    setBoLocHienTai(key);
    setTrangHienTai(1);
    setIdDaChon([]);
  }

  /** Reset về trang 1 khi tìm kiếm */
  function xuLyTimKiem(val: string) {
    setTuKhoaTimKiem(val);
    setTrangHienTai(1);
    setIdDaChon([]);
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
          {/* Nút phụ: xem lịch sử kho */}
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            <HistoryOutlined />
            Lịch sử kho
          </button>

          {/* Nút chính: nhập kho phôi áo */}
          <button
            type="button"
            onClick={() => {
              // Mở modal nhập kho không gắn với biến thể cụ thể (chọn từ modal)
              setItemGiaoDich({
                id: 0,
                ten: "",
                mau: "",
                mauHex: "",
                size: "",
                sku: "",
                tonHienTai: 0,
                daGiu: 0,
                khaDung: 0,
                trangThai: "con_hang",
              });
            }}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            <PlusSquareOutlined />
            Nhập kho phôi áo
          </button>
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
        />
        {/* Thẻ 2: Biến thể sắp hết */}
        <InventoryStatCard
          icon={<WarningOutlined style={{ fontSize: 20 }} />}
          title="Biến thể sắp hết"
          value={dangTaiThongKe ? "..." : sapHet}
          valueSuffix="SKU"
          badge="Cảnh báo"
          colorScheme="warning"
        />
        {/* Thẻ 3: Cần xuất cho đơn in */}
        <InventoryStatCard
          icon={<ExportOutlined style={{ fontSize: 20 }} />}
          title="Cần xuất cho đơn in"
          value={dangTaiThongKe ? "..." : daGiu}
          colorScheme="accent"
        />
        {/* Thẻ 4: Nhập kho trong tháng */}
        <InventoryStatCard
          icon={<ImportOutlined style={{ fontSize: 20 }} />}
          title="Nhập kho trong tháng"
          value={dangTaiThongKe ? "..." : `+${nhapThang.toLocaleString("vi-VN")}`}
          colorScheme="success"
        />
      </div>

      {/* ===== CARD BẢNG DỮ LIỆU ===== */}
      <div className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

        {/* Thanh lọc */}
        <InventoryFilterBar
          searchValue={tuKhoaTimKiem}
          onSearchChange={xuLyTimKiem}
          activeFilter={boLocHienTai}
          onFilterChange={xuLyDoiBoLoc}
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
              selectedIds={idDaChon}
              onSelectItem={xuLyChonItem}
              onSelectAll={xuLyChonTatCa}
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
