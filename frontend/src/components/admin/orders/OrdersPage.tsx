"use client";

import {
  CheckCircleOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import * as orderService from "@/services/admin/orderService";
import AdminSearchInput from "../common/AdminSearchInput";
import OrderFilterBar from "./OrderFilterBar";
import OrderPagination from "./OrderPagination";
import OrderStatCard from "./OrderStatCard";
import OrderTable, { type Order } from "./OrderTable";
import UpdateOrderStatusModal from "./UpdateOrderStatusModal";

/**
 * OrdersPage – Trang quản lý đơn hàng (đã kết nối API thực tế).
 *
 * Dùng React Query để tự động quản lý cache, loading, error.
 * Không còn mock data – tất cả dữ liệu lấy từ Backend qua orderService.
 */

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
      extraCount: don.sanPham.soSanPhamKhac ?? 0,
      totalQuantity: don.sanPham.tongSoLuong ?? undefined,
    },
    totalAmountVnd: don.tongTienVnd,
    payment: {
      method: don.thanhToan.phuongThuc,
      type: don.thanhToan.loai,
      amountVnd: don.thanhToan.soTienVnd,
      isPaid: don.thanhToan.daThanh,
    },
    status: don.trangThai as Order["status"],
  };
}

const SO_MOI_TRANG = 10;

export type OrdersInitialFilters = {
  status?: string;
  payment?: string;
  startDate?: string;
  endDate?: string;
  dateField?: "created" | "completed";
  hour?: string;
};

type OrdersPageProps = {
  initialFilters?: OrdersInitialFilters;
};

export default function OrdersPage({ initialFilters }: OrdersPageProps) {
  const router = useRouter();

  // ---- State bộ lọc ----
  const [activeTab, setActiveTab] = useState(initialFilters?.status ?? "tat_ca");
  const [paymentFilter, setPaymentFilter] = useState(
    initialFilters?.payment ?? "tat_ca"
  );
  const [tuNgay, setTuNgay] = useState(initialFilters?.startDate ?? "");
  const [denNgay, setDenNgay] = useState(initialFilters?.endDate ?? "");
  const [dateField, setDateField] = useState(
    initialFilters?.dateField ?? "created"
  );
  const [completionHour, setCompletionHour] = useState(
    initialFilters?.hour ?? ""
  );
  const [typeFilter, setTypeFilter] = useState("tat_ca");
  const [tuKhoa, setTuKhoa] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- State reset filter ----
  const [resetKey, setResetKey] = useState(0);

  // ---- State phân trang ----
  const [currentPage, setCurrentPage] = useState(1);

  // ---- State modal cập nhật trạng thái ----
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

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
      tuNgay,
      denNgay,
      dateField,
      completionHour,
      typeFilter,
      tuKhoa,
    ],
    queryFn: () =>
      orderService.layDanhSachDonHang({
        trang: currentPage,
        soMoiTrang: SO_MOI_TRANG,
        trangThai: activeTab,
        thanhToan: paymentFilter,
        tuNgay,
        denNgay,
        kieuNgay: dateField === "completed" ? "ngay_hoan_tat" : "ngay_tao",
        gio: completionHour,
        loai: typeFilter,
        tuKhoa,
      }),
  });

  // Mỗi đơn chỉ có một trang chi tiết chính thức theo ID.
  function handleRowClick(order: Order) {
    router.push(`/admin/don-hang/${order.id}`);
  }

  function handleEditStatus(order: Order) {
    if (order.status === "hoan_tat" || order.status === "da_huy") {
      return; // Không cho phép chỉnh sửa trạng thái
    }
    setEditingOrderId(order.id);
    setIsUpdateModalOpen(true);
  }

  // Hàm xử lý khi filter thay đổi → reset về trang 1
  function handleTabChange(key: string) {
    setActiveTab(key);
    if (key !== "hoan_tat") {
      setDateField("created");
      setCompletionHour("");
    }
    setCurrentPage(1);
    if (key === "tat_ca") {
      router.push("/admin/don-hang");
    }
  }
  function handlePaymentChange(v: string) { setPaymentFilter(v); setCurrentPage(1); }
  function handleDateChange(startDate: string, endDate: string) {
    setTuNgay(startDate);
    setDenNgay(endDate);
    setCompletionHour("");
    setCurrentPage(1);
  }
  function handleDateClear() {
    setTuNgay("");
    setDenNgay("");
    setCompletionHour("");
    setCurrentPage(1);
  }
  function handleTypeChange(v: string) { setTypeFilter(v); setCurrentPage(1); }

  function handleResetFilters() {
    setActiveTab("tat_ca");
    setPaymentFilter("tat_ca");
    setTypeFilter("tat_ca");
    setTuKhoa("");
    setTuNgay("");
    setDenNgay("");
    setCompletionHour("");
    setCurrentPage(1);
    setResetKey((prev) => prev + 1);
    router.push("/admin/don-hang");
  }

  // Chuyển đổi dữ liệu từ API sang kiểu FE
  const danhSachOrder: Order[] = (ketQuaDanhSach?.danhSach ?? []).map(chuyenDoiSangOrder);
  const tongSo = ketQuaDanhSach?.tongSo ?? 0;
  const tongSoTrang = ketQuaDanhSach?.tongSoTrang ?? 1;
  const today = dayjs().format("YYYY-MM-DD");
  const kpiConfig = [
    {
      key: "donMoi" as const,
      label: "Đơn mới",
      href: "/admin/don-hang?status=PENDING",
      isActive:
        activeTab === "cho_xac_nhan" &&
        paymentFilter === "tat_ca" &&
        !tuNgay &&
        !denNgay,
      iconWrapperClassName: "bg-[#cce5ff] text-[#0284c7]",
      icon: <ShoppingCartOutlined />,
    },
    {
      key: "dangXuLyIn" as const,
      label: "Đang xử lý in",
      href: "/admin/don-hang?status=PROCESSING%2CPRINTING",
      isActive:
        activeTab === "dang_xu_ly_in" &&
        paymentFilter === "tat_ca" &&
        !tuNgay &&
        !denNgay,
      iconWrapperClassName: "bg-[#cce5ff] text-[#0284c7]",
      icon: <SyncOutlined spin />,
    },
    {
      key: "choThanhToan" as const,
      label: "Chờ thanh toán",
      href: "/admin/don-hang?payment=PENDING",
      isActive:
        activeTab === "tat_ca" &&
        paymentFilter === "cho_thanh_toan" &&
        !tuNgay &&
        !denNgay,
      iconWrapperClassName: "bg-[#ffdad6] text-[#ea580c]",
      icon: <WalletOutlined />,
    },
    {
      key: "hoanTatHomNay" as const,
      label: "Hoàn tất hôm nay",
      href: `/admin/don-hang?status=COMPLETED&date=${today}&dateField=completed`,
      isActive:
        activeTab === "hoan_tat" &&
        paymentFilter === "tat_ca" &&
        tuNgay === today &&
        denNgay === today &&
        dateField === "completed",
      iconWrapperClassName: "bg-[#dcfce7] text-[#059669]",
      icon: <CheckCircleOutlined />,
    },
  ];

  return (
    <div>
      {/* ======== Tiêu đề trang + nút hành động ======== */}
      <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-baseline gap-4">
          <h2 className="font-extrabold text-headline-lg-mobile text-text-main md:text-headline-lg">
            Quản lý đơn hàng
          </h2>
          <p className="text-body-md text-text-secondary">
            (Theo dõi đơn áo tùy chỉnh, thanh toán, sản xuất và giao hàng)
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/don-hang/tao-moi")}
          className="flex h-control-h shrink-0 items-center gap-2 rounded-[10px] bg-[#0ea5e9] px-4 text-button-text font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
        >
          <PlusOutlined />
          Tạo đơn mới
        </button>
      </section>

      {/* ======== 4 thẻ KPI thống kê ======== */}
      <section className="mb-6 grid grid-cols-4 gap-3">
        {kpiConfig.map((kpi) => (
          <OrderStatCard
            key={kpi.key}
            label={kpi.label}
            // Hiển thị "--" khi đang tải, hoặc số thực từ API
            value={isLoadingThongKe ? "--" : (thongKe?.[kpi.key] ?? 0)}
            href={kpi.href}
            isActive={kpi.isActive}
            icon={kpi.icon}
            iconWrapperClassName={kpi.iconWrapperClassName}
          />
        ))}
      </section>

      {/* ======== Bảng đơn hàng chính ======== */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

        {/* Thanh filter */}
        <OrderFilterBar
          key={resetKey}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={handlePaymentChange}
          onDateChange={handleDateChange}
          onDateClear={handleDateClear}
          initialStartDate={tuNgay || undefined}
          initialEndDate={denNgay || undefined}
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeChange}
          onResetFilters={handleResetFilters}
          searchSlot={(
            <AdminSearchInput
              placeholder="Tìm mã đơn hàng, tên khách hàng..."
              className="w-full shrink-0 sm:w-[280px]"
              // Gọi search sau 500ms người dùng ngừng gõ (debounce đơn giản)
              onChange={(e) => {
                const val = (e.target as HTMLInputElement).value;
                // Tạm dùng setTimeout đơn giản để debounce
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                searchTimeoutRef.current = setTimeout(() => {
                  setTuKhoa(val);
                  setCurrentPage(1);
                }, 500);
              }}
            />
          )}
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
            <OrderTable
              orders={danhSachOrder}
              onRowClick={handleRowClick}
              onEditStatus={handleEditStatus}
            />
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

      <UpdateOrderStatusModal
        orderId={editingOrderId}
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
}
