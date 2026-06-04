"use client";

import {
  CheckCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import * as orderService from "@/services/admin/orderService";
import type { ChiTietDonHang } from "@/services/admin/orderService";
import AdminSearchInput from "../common/AdminSearchInput";
import OrderDetailDrawer from "./OrderDetailDrawer";
import OrderFilterBar from "./OrderFilterBar";
import OrderPagination from "./OrderPagination";
import OrderStatCard from "./OrderStatCard";
import OrderTable, { type Order } from "./OrderTable";

/**
 * OrdersPage – Trang quản lý đơn hàng (đã kết nối API thực tế).
 *
 * Dùng React Query để tự động quản lý cache, loading, error.
 * Không còn mock data – tất cả dữ liệu lấy từ Backend qua orderService.
 */

// Cấu hình icon cho 4 thẻ KPI (phần style/icon không thay đổi)
const KPI_CONFIG = [
  {
    key: "donMoi" as const,
    label: "Đơn mới",
    iconWrapperClassName: "bg-[#cce5ff] text-[#0284c7]",
    icon: <ShoppingCartOutlined />,
  },
  {
    key: "dangXuLyIn" as const,
    label: "Đang xử lý in",
    iconWrapperClassName: "bg-[#cce5ff] text-[#0284c7]",
    icon: <SyncOutlined spin />,
  },
  {
    key: "choThanhToan" as const,
    label: "Chờ thanh toán",
    iconWrapperClassName: "bg-[#ffdad6] text-[#ea580c]",
    icon: <WalletOutlined />,
  },
  {
    key: "hoanTatHomNay" as const,
    label: "Hoàn tất hôm nay",
    iconWrapperClassName: "bg-[#dcfce7] text-[#059669]",
    icon: <CheckCircleOutlined />,
  },
];

// Hàm chuyển đổi dữ liệu từ service sang kiểu Order của OrderTable
function chuyenDoiSangOrder(don: orderService.DonHang): Order {
  return {
    id: don.id,
    orderCode: don.maDonHang,
    createdAt: don.ngayTao,
    customerName: don.tenKhachHang,
    customerPhone: don.sdtKhachHang,
    product: {
      name: don.sanPham.ten,
      type: don.sanPham.loai,
      sizes: don.sanPham.sizes,
      imageUrl: don.sanPham.anhUrl ?? undefined,
    },
    totalAmountVnd: don.tongTienVnd,
    payment: {
      method: don.thanhToan.phuongThuc,
      isPaid: don.thanhToan.daThanh,
    },
    status: don.trangThai as Order["status"],
    hasPrintSpec: don.daXuatThongSoIn,
  };
}

// Hàm chuyển đổi chi tiết đơn hàng sang kiểu OrderDetail của Drawer
function chuyenDoiSangOrderDetail(chi: ChiTietDonHang) {
  return {
    id: chi.id,
    orderCode: chi.maDonHang,
    createdAt: chi.ngayTao,
    customerName: chi.tenKhachHang,
    customerPhone: chi.sdtKhachHang,
    customerEmail: chi.emailKhachHang,
    product: {
      name: chi.sanPham.ten,
      type: chi.sanPham.loai,
      sizes: chi.sanPham.sizes,
      imageUrl: chi.sanPham.anhUrl ?? undefined,
    },
    totalAmountVnd: chi.tongTienVnd,
    subTotalVnd: chi.tamTinhVnd,
    designFeeVnd: chi.phiThietKeVnd,
    shippingFeeVnd: chi.phiVanChuyenVnd,
    payment: {
      method: chi.thanhToan.phuongThuc,
      isPaid: chi.thanhToan.daThanh,
    },
    status: chi.trangThai as Order["status"],
    hasPrintSpec: chi.daXuatThongSoIn,
    shippingAddress: chi.diaChiGiaoHang,
    shippingCarrier: chi.donViVanChuyen,
    printPosition: chi.viTriIn ?? undefined,
    printSizeCm: undefined,
    printFileUrl: chi.anhXemTruocThietKe ?? undefined,
    timeline: chi.thoiGianXuLy.map((b) => ({
      description: b.moTa,
      time: b.thoiGian,
      actor: b.nguoiThucHien,
      isActive: b.laDangHienTai,
    })),
  };
}

const SO_MOI_TRANG = 10;

export default function OrdersPage() {
  // ---- State bộ lọc ----
  const [activeTab, setActiveTab] = useState("tat_ca");
  const [paymentFilter, setPaymentFilter] = useState("tat_ca");
  const [timeFilter, setTimeFilter] = useState("tat_ca");
  const [typeFilter, setTypeFilter] = useState("tat_ca");
  const [tuKhoa, setTuKhoa] = useState("");

  // ---- State phân trang ----
  const [currentPage, setCurrentPage] = useState(1);

  // ---- State drawer ----
  // Lưu ID đơn đang mở drawer (null = không mở)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // ======================================================
  // REACT QUERY: Lấy thống kê KPI
  // ======================================================
  const {
    data: thongKe,
    isLoading: isLoadingThongKe,
  } = useQuery({
    queryKey: ["admin-order-stats"],
    queryFn: orderService.layThongKeDonHang,
    // Cache 2 phút trước khi coi là "cũ" và refetch
    staleTime: 2 * 60 * 1000,
  });

  // ======================================================
  // REACT QUERY: Lấy danh sách đơn hàng
  // Khi bất kỳ filter nào thay đổi → queryKey thay đổi → React Query tự refetch
  // ======================================================
  const {
    data: ketQuaDanhSach,
    isLoading: isLoadingDanh,
    isError: isErrorDanh,
    error: errorDanh,
  } = useQuery({
    queryKey: [
      "admin-orders",
      currentPage,
      activeTab,
      paymentFilter,
      timeFilter,
      typeFilter,
      tuKhoa,
    ],
    queryFn: () =>
      orderService.layDanhSachDonHang({
        trang: currentPage,
        soMoiTrang: SO_MOI_TRANG,
        trangThai: activeTab,
        thanhToan: paymentFilter,
        thoiGian: timeFilter,
        loai: typeFilter,
        tuKhoa,
      }),
  });

  // ======================================================
  // REACT QUERY: Lấy chi tiết đơn hàng (khi click hàng)
  // enabled: false → chỉ fetch khi có selectedOrderId
  // ======================================================
  const {
    data: chiTietDonHang,
    isLoading: isLoadingChiTiet,
  } = useQuery({
    queryKey: ["admin-order-detail", selectedOrderId],
    queryFn: () => orderService.layChiTietDonHang(selectedOrderId!),
    enabled: selectedOrderId !== null, // Chỉ gọi khi có ID
    staleTime: 30 * 1000, // Cache 30 giây (detail hay thay đổi hơn list)
  });

  // Hàm xử lý khi click hàng đơn hàng
  function handleRowClick(order: Order) {
    setSelectedOrderId(order.id);
  }

  // Hàm đóng drawer
  function handleCloseDrawer() {
    setSelectedOrderId(null);
  }

  // Hàm xử lý khi filter thay đổi → reset về trang 1
  function handleTabChange(key: string) {
    setActiveTab(key);
    setCurrentPage(1);
  }
  function handlePaymentChange(v: string) { setPaymentFilter(v); setCurrentPage(1); }
  function handleTimeChange(v: string) { setTimeFilter(v); setCurrentPage(1); }
  function handleTypeChange(v: string) { setTypeFilter(v); setCurrentPage(1); }

  // Chuyển đổi dữ liệu từ API sang kiểu FE
  const danhSachOrder: Order[] = (ketQuaDanhSach?.danhSach ?? []).map(chuyenDoiSangOrder);
  const tongSo = ketQuaDanhSach?.tongSo ?? 0;
  const tongSoTrang = ketQuaDanhSach?.tongSoTrang ?? 1;

  // Chuẩn bị dữ liệu drawer: dùng chi tiết nếu đã load, fallback về dữ liệu list
  const orderDetailData = chiTietDonHang
    ? chuyenDoiSangOrderDetail(chiTietDonHang)
    : null;

  return (
    <div>
      {/* ======== Tiêu đề trang + nút hành động ======== */}
      <section className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-extrabold text-headline-lg-mobile text-text-main md:text-headline-lg">
            Quản lý đơn hàng
          </h2>
          <p className="mt-1 text-body-md text-text-secondary">
            Theo dõi đơn áo tùy chỉnh, thanh toán, sản xuất và giao hàng
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-button-text font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            <DownloadOutlined />
            Xuất danh sách
          </button>
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-[10px] bg-[#0ea5e9] px-4 text-button-text font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            <PlusOutlined />
            Tạo đơn mới
          </button>
        </div>
      </section>

      {/* ======== 4 thẻ KPI thống kê ======== */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPI_CONFIG.map((kpi) => (
          <OrderStatCard
            key={kpi.key}
            label={kpi.label}
            // Hiển thị "--" khi đang tải, hoặc số thực từ API
            value={isLoadingThongKe ? "--" : (thongKe?.[kpi.key] ?? 0)}
            icon={kpi.icon}
            iconWrapperClassName={kpi.iconWrapperClassName}
          />
        ))}
      </section>

      {/* ======== Bảng đơn hàng chính ======== */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

        {/* Thanh tìm kiếm */}
        <div className="flex items-center gap-4 border-b border-border px-4 py-3">
          <AdminSearchInput
            placeholder="Tìm mã đơn hàng, tên khách hàng..."
            className="max-w-sm"
            // Gọi search sau 500ms người dùng ngừng gõ (debounce đơn giản)
            onChange={(e) => {
              const val = (e.target as HTMLInputElement).value;
              // Tạm dùng setTimeout đơn giản để debounce
              clearTimeout((window as any).__searchTimeout);
              (window as any).__searchTimeout = setTimeout(() => {
                setTuKhoa(val);
                setCurrentPage(1);
              }, 500);
            }}
          />
        </div>

        {/* Thanh filter */}
        <OrderFilterBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={handlePaymentChange}
          timeFilter={timeFilter}
          onTimeFilterChange={handleTimeChange}
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeChange}
        />

        {/* Trạng thái lỗi */}
        {isErrorDanh && (
          <div className="py-16 text-center text-red-500">
            <p className="font-medium">Không thể tải danh sách đơn hàng</p>
            <p className="mt-1 text-sm text-text-secondary">
              {(errorDanh as Error)?.message || "Vui lòng thử lại sau"}
            </p>
          </div>
        )}

        {/* Bảng dữ liệu – hiển thị overlay loading khi đang tải */}
        {!isErrorDanh && (
          <div className="relative">
            {/* Overlay loading mờ khi refetch */}
            {isLoadingDanh && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                <span className="text-sm text-text-secondary">Đang tải...</span>
              </div>
            )}
            <OrderTable orders={danhSachOrder} onRowClick={handleRowClick} />
          </div>
        )}

        {/* Phân trang */}
        {!isErrorDanh && (
          <OrderPagination
            currentPage={currentPage}
            totalPages={tongSoTrang}
            totalItems={tongSo}
            itemsPerPage={SO_MOI_TRANG}
            onPageChange={setCurrentPage}
          />
        )}
      </section>

      {/* ======== Ngăn kéo chi tiết đơn hàng ======== */}
      <OrderDetailDrawer
        order={orderDetailData}
        isLoading={isLoadingChiTiet && selectedOrderId !== null}
        onClose={handleCloseDrawer}
        onCapNhatTrangThai={async (id, trangThai) => {
          await orderService.capNhatTrangThaiDonHang(id, trangThai);
        }}
        onHuyDon={async (id, lyDo) => {
          await orderService.huyDonHang(id, lyDo);
        }}
      />
    </div>
  );
}
