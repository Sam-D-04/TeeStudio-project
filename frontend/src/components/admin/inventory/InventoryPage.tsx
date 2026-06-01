"use client";

import { useState, useMemo } from "react";
import {
  HistoryOutlined,
  DownloadOutlined,
  PlusSquareOutlined,
  InboxOutlined,
  WarningOutlined,
  ExportOutlined,
  ImportOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import InventoryStatCard from "./InventoryStatCard";
import InventoryFilterBar from "./InventoryFilterBar";
import InventoryTable, { type InventoryItem } from "./InventoryTable";
import InventoryDetailDrawer from "./InventoryDetailDrawer";
import InventoryPagination from "./InventoryPagination";

/**
 * InventoryPage – component client chính của trang Quản lý Kho hàng.
 *
 * Đây là "bộ não" của trang, chịu trách nhiệm:
 * 1. Lưu trữ và cung cấp dữ liệu cho tất cả component con.
 * 2. Quản lý tất cả trạng thái UI: tìm kiếm, lọc, phân trang, drawer mở/đóng.
 * 3. Kết nối các component con lại với nhau thông qua props và callback.
 *
 * Cấu trúc giao diện:
 * ┌─────────────────────────────────────────────┐
 * │  Tiêu đề trang + 3 nút hành động           │
 * │  Banner thông tin hệ thống kho              │
 * │  [Stat 1] [Stat 2] [Stat 3] [Stat 4]       │
 * │  ┌─ Card bảng ─────────────────────────┐   │
 * │  │  InventoryFilterBar                 │   │
 * │  │  InventoryTable                     │   │
 * │  │  InventoryPagination                │   │
 * │  └─────────────────────────────────────┘   │
 * └─────────────────────────────────────────────┘
 * (Overlay) InventoryDetailDrawer
 */

// ===== DỮ LIỆU MẪU (MOCK DATA) =====
// Dữ liệu này sẽ được thay bằng API call thực tế sau khi Backend hoàn thiện.
// Mỗi item là một biến thể phôi áo cụ thể (SKU duy nhất).
const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 1,
    ten: "Basic Cotton Tee",
    mau: "Trắng",
    mauHex: "#f8fafc",
    size: "S",
    sku: "TS-TEE-WHT-S",
    tonHienTai: 200,
    daGiu: 10,
    khaDung: 190,
    trangThai: "con_hang",
  },
  {
    id: 2,
    ten: "Basic Cotton Tee",
    mau: "Trắng",
    mauHex: "#f8fafc",
    size: "M",
    sku: "TS-TEE-WHT-M",
    tonHienTai: 145,
    daGiu: 12,
    khaDung: 133,
    trangThai: "con_hang",
  },
  {
    id: 3,
    ten: "Basic Cotton Tee",
    mau: "Trắng",
    mauHex: "#f8fafc",
    size: "L",
    sku: "TS-TEE-WHT-L",
    tonHienTai: 80,
    daGiu: 5,
    khaDung: 75,
    trangThai: "con_hang",
  },
  {
    id: 4,
    ten: "Basic Cotton Tee",
    mau: "Đen",
    mauHex: "#1e293b",
    size: "M",
    sku: "TS-TEE-BLK-M",
    tonHienTai: 60,
    daGiu: 20,
    khaDung: 40,
    trangThai: "con_hang",
  },
  {
    id: 5,
    ten: "Basic Cotton Tee",
    mau: "Đen",
    mauHex: "#1e293b",
    size: "L",
    sku: "TS-TEE-BLK-L",
    tonHienTai: 12,
    daGiu: 8,
    khaDung: 4,
    trangThai: "sap_het",
  },
  {
    id: 6,
    ten: "Basic Cotton Tee",
    mau: "Đen",
    mauHex: "#1e293b",
    size: "XL",
    sku: "TS-TEE-BLK-XL",
    tonHienTai: 8,
    daGiu: 8,
    khaDung: 0,
    trangThai: "het_hang",
  },
  {
    id: 7,
    ten: "Premium Cotton",
    mau: "Xám",
    mauHex: "#94a3b8",
    size: "M",
    sku: "TS-PRM-GRY-M",
    tonHienTai: 300,
    daGiu: 15,
    khaDung: 285,
    trangThai: "con_hang",
  },
  {
    id: 8,
    ten: "Premium Cotton",
    mau: "Xám",
    mauHex: "#94a3b8",
    size: "L",
    sku: "TS-PRM-GRY-L",
    tonHienTai: 180,
    daGiu: 30,
    khaDung: 150,
    trangThai: "con_hang",
  },
  {
    id: 9,
    ten: "Premium Cotton",
    mau: "Đỏ",
    mauHex: "#ef4444",
    size: "S",
    sku: "TS-PRM-RED-S",
    tonHienTai: 15,
    daGiu: 10,
    khaDung: 5,
    trangThai: "sap_het",
  },
  {
    id: 10,
    ten: "Premium Cotton",
    mau: "Xanh Navy",
    mauHex: "#1e3a5f",
    size: "M",
    sku: "TS-PRM-NVY-M",
    tonHienTai: 120,
    daGiu: 0,
    khaDung: 120,
    trangThai: "con_hang",
  },
];

// Số dòng hiển thị mỗi trang
const PAGE_SIZE = 5;

export default function InventoryPage() {
  // ===== TRẠNG THÁI UI =====

  // Từ khóa tìm kiếm trong ô search
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  // Pill filter đang được chọn, mặc định là "tat_ca"
  const [boLocHienTai, setBoLocHienTai] = useState("tat_ca");

  // Trang hiện tại trong phân trang
  const [trangHienTai, setTrangHienTai] = useState(1);

  // Danh sách ID các hàng đang được tích checkbox
  const [idDaChon, setIdDaChon] = useState<number[]>([]);

  // Item đang được xem chi tiết trong drawer (null = drawer đóng)
  const [itemDangXem, setItemDangXem] = useState<InventoryItem | null>(null);

  // ===== LỌC DỮ LIỆU =====
  // useMemo: chỉ tính lại khi tuKhoaTimKiem hoặc boLocHienTai thay đổi
  const danhSachDaLoc = useMemo(() => {
    return MOCK_INVENTORY_ITEMS.filter((item) => {
      // Lọc theo từ khóa tìm kiếm (so sánh không phân biệt hoa/thường)
      const tuKhoaLower = tuKhoaTimKiem.toLowerCase();
      const khopTimKiem =
        tuKhoaTimKiem === "" ||
        item.sku.toLowerCase().includes(tuKhoaLower) ||
        item.ten.toLowerCase().includes(tuKhoaLower) ||
        item.mau.toLowerCase().includes(tuKhoaLower);

      // Lọc theo pill filter đang chọn
      const khopBoLoc =
        boLocHienTai === "tat_ca" ||
        (boLocHienTai === "ao_basic" && item.ten.includes("Basic")) ||
        (boLocHienTai === "premium" && item.ten.includes("Premium")) ||
        (boLocHienTai === "sap_het" && item.trangThai === "sap_het");

      return khopTimKiem && khopBoLoc;
    });
  }, [tuKhoaTimKiem, boLocHienTai]);

  // ===== PHÂN TRANG =====
  const tongSoTrang = Math.max(1, Math.ceil(danhSachDaLoc.length / PAGE_SIZE));

  // Danh sách item của trang hiện tại
  const danhSachTrangHienTai = danhSachDaLoc.slice(
    (trangHienTai - 1) * PAGE_SIZE,
    trangHienTai * PAGE_SIZE
  );

  // ===== XỬ LÝ CHECKBOX =====
  // Tích/bỏ tích một item
  function xuLyChonItem(id: number) {
    setIdDaChon((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  // Tích/bỏ tích tất cả item của trang hiện tại
  function xuLyChonTatCa() {
    const idTrangHienTai = danhSachTrangHienTai.map((i) => i.id);
    const tatCaDaChon = idTrangHienTai.every((id) => idDaChon.includes(id));
    if (tatCaDaChon) {
      // Bỏ tích tất cả
      setIdDaChon((prev) => prev.filter((id) => !idTrangHienTai.includes(id)));
    } else {
      // Tích tất cả (thêm những ID chưa có)
      setIdDaChon((prev) => [...new Set([...prev, ...idTrangHienTai])]);
    }
  }

  // ===== XỬ LÝ KHI THAY ĐỔI BỘ LỌC =====
  // Reset về trang 1 khi thay đổi tìm kiếm hoặc bộ lọc
  function xuLyDoiBoLoc(key: string) {
    setBoLocHienTai(key);
    setTrangHienTai(1);
  }

  function xuLyTimKiem(val: string) {
    setTuKhoaTimKiem(val);
    setTrangHienTai(1);
  }

  // ===== TÍNH TOÁN THỐNG KÊ =====
  const tongPhoi = MOCK_INVENTORY_ITEMS.reduce((sum, i) => sum + i.tonHienTai, 0);
  const sapHet = MOCK_INVENTORY_ITEMS.filter((i) => i.trangThai === "sap_het").length;
  const canXuat = MOCK_INVENTORY_ITEMS.reduce((sum, i) => sum + i.daGiu, 0);
  const nhapThang = 860; // Dữ liệu tháng này – sẽ lấy từ API

  return (
    // Vùng nội dung chính: padding đều 24px, nền xám nhạt
    <div className="space-y-6 p-6">

      {/* ===== TIÊU ĐỀ TRANG + NÚT HÀNH ĐỘNG ===== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          {/* Tiêu đề lớn */}
          <h2 className="text-[28px] font-black leading-[36px] tracking-tight text-text-main">
            Quản lý kho phôi áo
          </h2>
          {/* Mô tả ngắn */}
          <p className="mt-1 text-sm text-text-secondary">
            Theo dõi tồn kho áo trơn theo màu, size và SKU trước khi chuyển sang xưởng in.
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

          {/* Nút phụ: xuất báo cáo */}
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            <DownloadOutlined />
            Xuất báo cáo
          </button>

          {/* Nút chính: nhập kho phôi áo */}
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            <PlusSquareOutlined />
            Nhập kho phôi áo
          </button>
        </div>
      </div>

      {/* ===== BANNER THÔNG TIN HỆ THỐNG KHO ===== */}
      {/* Nền xanh nhạt, viền xanh, icon info */}
      <div className="flex items-start gap-3 rounded-xl border border-primary-fixed bg-primary-fixed-dim/20 p-4">
        <InfoCircleOutlined
          className="mt-0.5 flex-shrink-0 text-primary-container"
          style={{ fontSize: 20 }}
        />
        <div>
          <h4 className="text-sm font-bold text-on-primary-container">Thông tin hệ thống kho</h4>
          <p className="mt-1 text-sm text-on-primary-container/80">
            Kho hàng này chỉ quản lý số lượng <strong>phôi áo chưa in</strong> (Blank Tees).
            Số lượng sẽ được tự động giữ lại (Reserved) và chuyển trạng thái khi xưởng in bắt đầu
            xử lý đơn custom.
          </p>
        </div>
      </div>

      {/* ===== 4 THẺ THỐNG KÊ KPI ===== */}
      {/* Grid 4 cột trên desktop, 2 cột trên tablet, 1 cột trên mobile */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Thẻ 1: Tổng phôi còn tồn */}
        <InventoryStatCard
          icon={<InboxOutlined style={{ fontSize: 20 }} />}
          title="Tổng phôi áo còn tồn"
          value={tongPhoi.toLocaleString("vi-VN")}
          badge="+5%"
          colorScheme="default"
        />
        {/* Thẻ 2: Biến thể sắp hết */}
        <InventoryStatCard
          icon={<WarningOutlined style={{ fontSize: 20 }} />}
          title="Biến thể sắp hết"
          value={sapHet}
          valueSuffix="SKU"
          badge="Cảnh báo"
          colorScheme="warning"
        />
        {/* Thẻ 3: Cần xuất cho đơn in */}
        <InventoryStatCard
          icon={<ExportOutlined style={{ fontSize: 20 }} />}
          title="Cần xuất cho đơn in"
          value={canXuat}
          colorScheme="accent"
        />
        {/* Thẻ 4: Nhập kho trong tháng */}
        <InventoryStatCard
          icon={<ImportOutlined style={{ fontSize: 20 }} />}
          title="Nhập kho trong tháng"
          value={`+${nhapThang.toLocaleString("vi-VN")}`}
          colorScheme="success"
        />
      </div>

      {/* ===== CARD BẢNG DỮ LIỆU ===== */}
      {/* Bao gồm: FilterBar + Table + Pagination */}
      <div className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

        {/* Thanh lọc */}
        <InventoryFilterBar
          searchValue={tuKhoaTimKiem}
          onSearchChange={xuLyTimKiem}
          activeFilter={boLocHienTai}
          onFilterChange={xuLyDoiBoLoc}
        />

        {/* Bảng dữ liệu */}
        <InventoryTable
          items={danhSachTrangHienTai}
          selectedIds={idDaChon}
          onSelectItem={xuLyChonItem}
          onSelectAll={xuLyChonTatCa}
          onViewDetail={(item) => setItemDangXem(item)}
        />

        {/* Phân trang */}
        <InventoryPagination
          currentPage={trangHienTai}
          totalPages={tongSoTrang}
          totalItems={danhSachDaLoc.length}
          pageSize={PAGE_SIZE}
          onPageChange={setTrangHienTai}
        />
      </div>

      {/* ===== DRAWER CHI TIẾT PHÔI ÁO ===== */}
      {/* Hiển thị khi itemDangXem khác null */}
      <InventoryDetailDrawer
        isOpen={itemDangXem !== null}
        onClose={() => setItemDangXem(null)}
        item={itemDangXem}
      />

    </div>
  );
}
