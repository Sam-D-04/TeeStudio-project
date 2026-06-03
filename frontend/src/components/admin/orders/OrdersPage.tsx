"use client";

import {
  CheckCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import AdminSearchInput from "../common/AdminSearchInput";
import type { OrderDetail } from "./OrderDetailDrawer";
import OrderDetailDrawer from "./OrderDetailDrawer";
import OrderFilterBar from "./OrderFilterBar";
import OrderPagination from "./OrderPagination";
import OrderStatCard from "./OrderStatCard";
import OrderTable, { type Order } from "./OrderTable";

/**
 * OrdersPage – trang quản lý đơn hàng (nội dung chính, không bao gồm sidebar/topbar).
 *
 * Component này là "trang" thật sự. Nó:
 * 1. Hiển thị tiêu đề và các nút hành động đầu trang.
 * 2. Hiển thị 4 thẻ KPI thống kê.
 * 3. Hiển thị bảng đơn hàng với filter và phân trang.
 * 4. Khi bấm vào hàng → mở ngăn kéo chi tiết.
 *
 * Dữ liệu mẫu (mock data) được dùng tạm thời. Sau khi Backend hoàn thành,
 * nhóm FE sẽ thay các mảng dữ liệu này bằng API call (xem Huongdan_BE.md).
 */

// ===== DỮ LIỆU MẪU (MOCK DATA) =====
// Phần này sẽ được thay bằng dữ liệu từ API thực tế sau này

// 4 thẻ KPI đầu trang
const STAT_CARDS = [
  {
    label: "Đơn mới",
    value: 24,
    iconWrapperClassName: "bg-[#cce5ff] text-[#0284c7]",
    icon: <ShoppingCartOutlined />,
  },
  {
    label: "Đang xử lý in",
    value: 18,
    iconWrapperClassName: "bg-[#cce5ff] text-[#0284c7]",
    icon: <SyncOutlined spin />,
  },
  {
    label: "Chờ thanh toán",
    value: 7,
    iconWrapperClassName: "bg-[#ffdad6] text-[#ea580c]",
    icon: <WalletOutlined />,
  },
  {
    label: "Hoàn tất hôm nay",
    value: 31,
    iconWrapperClassName: "bg-[#dcfce7] text-[#059669]",
    icon: <CheckCircleOutlined />,
  },
];

// Dữ liệu mẫu bảng đơn hàng
const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    orderCode: "#TS-2026-00128",
    createdAt: "10:24, 24/10/2023",
    customerName: "Nguyễn Minh Anh",
    customerPhone: "0901234567",
    product: {
      name: "Áo thun oversize trắng",
      type: "custom_design",
      sizes: "Cỡ L, XL",
    },
    totalAmountVnd: 429000,
    payment: { method: "VNPAY", isPaid: true },
    status: "dang_san_xuat",
    hasPrintSpec: true,
  },
  {
    id: 2,
    orderCode: "#TS-2026-00129",
    createdAt: "11:05, 24/10/2023",
    customerName: "Trần Văn Cường",
    customerPhone: "0987654321",
    product: {
      name: "Áo Hoodie đen basic",
      type: "ao_mau",
      sizes: "Cỡ M",
    },
    totalAmountVnd: 350000,
    payment: { method: "COD", isPaid: false },
    status: "cho_xac_nhan",
  },
  {
    id: 3,
    orderCode: "#TS-2026-00130",
    createdAt: "13:40, 24/10/2023",
    customerName: "Lê Thị Hoa",
    customerPhone: "0912345678",
    product: {
      name: "Áo polo nhóm đồng phục",
      type: "custom_design",
      sizes: "Cỡ S, M, L",
    },
    totalAmountVnd: 1250000,
    payment: { method: "Chuyển khoản", isPaid: true },
    status: "cho_giao",
    hasPrintSpec: true,
  },
  {
    id: 4,
    orderCode: "#TS-2026-00131",
    createdAt: "15:20, 24/10/2023",
    customerName: "Phạm Quốc Bảo",
    customerPhone: "0934567890",
    product: {
      name: "Áo thun cotton trơn",
      type: "ao_mau",
      sizes: "Cỡ XL",
    },
    totalAmountVnd: 180000,
    payment: { method: "VNPAY", isPaid: true },
    status: "hoan_tat",
  },
];

// Chi tiết mẫu của đơn đầu tiên (dùng cho drawer)
const MOCK_ORDER_DETAIL: OrderDetail = {
  ...MOCK_ORDERS[0],
  customerEmail: "minhanh@email.com",
  shippingAddress: "123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM",
  shippingCarrier: "GHTK – Tiêu chuẩn",
  subTotalVnd: 250000,
  designFeeVnd: 150000,
  shippingFeeVnd: 29000,
  printPosition: "Mặt trước (Ngực giữa)",
  printSizeCm: "20×28 cm",
  timeline: [
    {
      description: "Đang xử lý in – Đã xuất thông số",
      time: "14:30, 24/10/2023",
      actor: "Admin",
      isActive: true,
    },
    {
      description: "Đã xác nhận thanh toán",
      time: "10:35, 24/10/2023",
      actor: "Hệ thống",
    },
    {
      description: "Tạo đơn hàng mới",
      time: "10:24, 24/10/2023",
      actor: "Khách hàng",
    },
  ],
};
// ===== KẾT THÚC DỮ LIỆU MẪU =====

function khopTrangThaiDonHang(order: Order, activeTab: string): boolean {
  if (activeTab === "tat_ca") return true;
  if (activeTab === "dang_xu_ly_in") {
    return order.status === "dang_san_xuat" || order.status === "dang_in";
  }
  return order.status === activeTab;
}

export default function OrdersPage() {
  // State lưu đơn hàng đang được xem chi tiết (null = không mở ngăn kéo)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  // State của các bộ lọc
  const [activeTab, setActiveTab] = useState<string>("tat_ca");
  const [paymentFilter, setPaymentFilter] = useState("tat_ca");
  const [timeFilter, setTimeFilter] = useState("tat_ca");
  const [typeFilter, setTypeFilter] = useState("tat_ca");

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const TOTAL_ITEMS = 128; // Sẽ thay bằng giá trị thực từ API
  const ordersDaLoc = MOCK_ORDERS.filter((order) =>
    khopTrangThaiDonHang(order, activeTab),
  );

  // Hàm xử lý khi bấm vào hàng đơn hàng → mở ngăn kéo
  // Trong thực tế sẽ gọi API /api/admin/orders/:id để lấy chi tiết
  function handleRowClick(order: Order) {
    // Hiện tại dùng dữ liệu mẫu MOCK_ORDER_DETAIL cho tất cả đơn
    // Sau này: setSelectedOrder(await fetchOrderDetail(order.id))
    setSelectedOrder({ ...MOCK_ORDER_DETAIL, ...order });
  }

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

        {/* Các nút đầu trang */}
        <div className="flex gap-3">
          {/* Nút phụ: Xuất danh sách */}
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-button-text font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            <DownloadOutlined />
            Xuất danh sách
          </button>

          {/* Nút chính: Tạo đơn mới */}
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
        {STAT_CARDS.map((card) => (
          <OrderStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            iconWrapperClassName={card.iconWrapperClassName}
          />
        ))}
      </section>

      {/* ======== Bảng đơn hàng chính (Card trắng) ======== */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

        {/* Thanh tìm kiếm nhanh bên trong bảng */}
        <div className="flex items-center gap-4 border-b border-border px-4 py-3">
          <AdminSearchInput
            placeholder="Tìm mã đơn hàng, tên khách hàng..."
            className="max-w-sm"
          />
        </div>

        {/* Thanh filter (pill tabs + select boxes) */}
        <OrderFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />

        {/* Bảng dữ liệu đơn hàng */}
        <OrderTable
          orders={ordersDaLoc}
          onRowClick={handleRowClick}
        />

        {/* Phân trang cuối bảng */}
        <OrderPagination
          currentPage={currentPage}
          totalPages={Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE)}
          totalItems={TOTAL_ITEMS}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* ======== Ngăn kéo chi tiết đơn hàng ======== */}
      {/* Hiển thị khi selectedOrder !== null */}
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
