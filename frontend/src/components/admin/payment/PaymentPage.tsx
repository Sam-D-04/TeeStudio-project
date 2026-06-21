"use client";

import { useState } from "react";
import PaymentDetailDrawer, { type PaymentDetail } from "./PaymentDetailDrawer";
import PaymentFilterBar from "./PaymentFilterBar";
import PaymentPagination from "./PaymentPagination";
import PaymentStatCard from "./PaymentStatCard";
import PaymentTable, { type Payment } from "./PaymentTable";

/**
 * PaymentPage – trang quản lý thanh toán (nội dung chính, không gồm sidebar/topbar).
 *
 * Component này tổng hợp tất cả phần tử của trang:
 * 1. Tiêu đề + các nút hành động đầu trang.
 * 2. 4 thẻ KPI thống kê.
 * 3. Panel bên phải: "Giao dịch cần xử lý".
 * 4. Bảng giao dịch với filter và phân trang.
 * 5. Ngăn kéo chi tiết giao dịch (mở khi bấm vào hàng).
 *
 * Dữ liệu mẫu (MOCK DATA) được dùng tạm thời. Sau khi Backend hoàn thành,
 * nhóm FE thay bằng API call (xem Huongdan_BE.md phần Thanh toán).
 */

// ===== DỮ LIỆU MẪU (MOCK DATA) =====
// Toàn bộ phần này sẽ được thay bằng API call thực tế sau này.

// Dữ liệu mẫu bảng giao dịch
const MOCK_PAYMENTS: Payment[] = [
  {
    id: 1,
    payCode: "PAY-000128",
    orderCode: "ORD-20260602-001",
    customerName: "Nguyễn Minh Anh",
    amountVnd: 850000,
    method: "VNPAY",
    status: "da_thanh_toan",
    gatewayCode: "VNPAY-842193",
  },
  {
    id: 2,
    payCode: "PAY-000127",
    orderCode: "ORD-20260602-002",
    customerName: "Trần Quốc Huy",
    amountVnd: 1250000,
    method: "VNPAY",
    status: "cho_thanh_toan",
    gatewayCode: "TXN-551239",
  },
  {
    id: 3,
    payCode: "PAY-000126",
    orderCode: "ORD-20260601-008",
    customerName: "Lê Hoàng Nam",
    amountVnd: 620000,
    method: "VNPAY",
    status: "that_bai",
    gatewayCode: "TXN-889231",
  },
  {
    id: 4,
    payCode: "PAY-000125",
    orderCode: "ORD-20260601-006",
    customerName: "Phạm Ngọc Linh",
    amountVnd: 1980000,
    method: "VNPAY",
    status: "hoan_tien",
    gatewayCode: "TXN-440012",
  },
  {
    id: 5,
    payCode: "PAY-000124",
    orderCode: "ORD-20260601-005",
    customerName: "Võ Thị Mai",
    amountVnd: 450000,
    method: "COD",
    status: "can_doi_soat",
    gatewayCode: "COD-001245",
  },
];

// Dữ liệu chi tiết mẫu cho giao dịch đầu tiên (dùng trong ngăn kéo)
const MOCK_PAYMENT_DETAIL: PaymentDetail = {
  ...MOCK_PAYMENTS[0],
  customerPhone: "0987654321",
  createdAt: "02/06/2026 14:30",
  paidAt: "02/06/2026 14:31",
  ipnHistory: [
    {
      description: "Nhận IPN thành công",
      time: "02/06/2026 14:31:05",
      note: "Payload matched",
      isSuccess: true,
    },
    {
      description: "Khởi tạo giao dịch",
      time: "02/06/2026 14:30:12",
      note: "Chờ thanh toán",
      isSuccess: false,
    },
  ],
};
// ===== KẾT THÚC DỮ LIỆU MẪU =====

export default function PaymentPage() {
  // State lưu giao dịch đang xem chi tiết (null = đóng ngăn kéo)
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);

  // State cho các bộ lọc
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("tat_ca");
  const [statusFilter, setStatusFilter] = useState("tat_ca");
  const [methodFilter, setMethodFilter] = useState("tat_ca");
  const [timeFilter, setTimeFilter] = useState("Hôm nay");

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const TOTAL_ITEMS = 128; // Sẽ thay bằng giá trị thực từ API

  // Hàm xử lý khi bấm vào hàng giao dịch → mở ngăn kéo chi tiết
  // Trong thực tế: gọi API GET /api/admin/payments/:id
  function handleRowClick(payment: Payment) {
    // Tạm thời ghép dữ liệu mẫu detail với payment được bấm
    setSelectedPayment({ ...MOCK_PAYMENT_DETAIL, ...payment });
  }

  // Hàm xử lý nút "Lọc" – hiện tại chỉ log, sau khi có API sẽ gọi thực sự
  function handleFilter() {
    // TODO: Gọi API với các tham số lọc
    console.log("Lọc với:", { searchValue, statusFilter, methodFilter, timeFilter });
  }

  // Hàm xử lý nút "Đặt lại" – reset tất cả bộ lọc về mặc định
  function handleReset() {
    setSearchValue("");
    setStatusFilter("tat_ca");
    setMethodFilter("tat_ca");
    setTimeFilter("Hôm nay");
    setActiveTab("tat_ca");
  }

  return (
    <div>

      {/* ======== Tiêu đề trang + nút hành động ======== */}
      <section className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-extrabold text-headline-lg-mobile text-text-main md:text-headline-lg">
            Thanh toán
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Theo dõi giao dịch, kiểm tra VNPAY, xử lý lỗi thanh toán và đối soát doanh thu đơn hàng.
          </p>
        </div>

        {/* Các nút hành động đầu trang */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Nút phụ: Đối soát thanh toán */}
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            {/* Icon receipt */}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
            </svg>
            Đối soát thanh toán
          </button>

          {/* Nút phụ: Xuất báo cáo */}
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            {/* Icon download */}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Xuất báo cáo
          </button>

          {/* Nút chính: Kiểm tra VNPAY */}
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-[10px] bg-[#0ea5e9] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            {/* Icon sync */}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 12v.01M4 12a8 8 0 018-8 8 8 0 015.657 2.343M20 12a8 8 0 01-8 8 8 8 0 01-5.657-2.343" strokeLinecap="round" />
              <path d="M20 4v4h-4M4 20v-4h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Kiểm tra VNPAY
          </button>
        </div>
      </section>

      {/* ======== 4 thẻ KPI thống kê ======== */}
      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* KPI 1: Tổng tiền đã thanh toán hôm nay – có badge +8% */}
        <PaymentStatCard
          label="Tổng tiền đã thanh toán hôm nay"
          value="12.450.000đ"
          iconWrapperClassName="bg-surface-alt text-text-secondary border border-border"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" strokeLinecap="round" />
            </svg>
          }
          badge={
            // Badge "+8%" màu xanh lá
            <span className="flex items-center gap-1 rounded-full bg-[#dcfce7] px-2 py-0.5 text-xs font-bold text-[#059669]">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M22 7l-10 10L7 12l-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              8%
            </span>
          }
        />

        {/* KPI 2: Giao dịch chờ thanh toán */}
        <PaymentStatCard
          label="Giao dịch chờ thanh toán"
          value={
            <>
              18{" "}
              <span className="text-base font-normal text-text-muted">đơn</span>
            </>
          }
          iconWrapperClassName="bg-surface-alt text-text-secondary border border-border"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
          }
        />

        {/* KPI 3: Giao dịch thất bại – dạng alert (viền đỏ bên phải) */}
        <PaymentStatCard
          label="Giao dịch thất bại"
          value={
            <>
              5{" "}
              <span className="text-base font-normal text-[#ea580c]">(cần kiểm tra)</span>
            </>
          }
          iconWrapperClassName="bg-[#fef2f2] text-[#ea580c] border border-[#ffdad6]"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
          }
          isAlert={true}
        />

        {/* KPI 4: Cần đối soát VNPAY */}
        <PaymentStatCard
          label="Cần đối soát VNPAY"
          value={
            <>
              7{" "}
              <span className="text-base font-normal text-text-muted">giao dịch</span>
            </>
          }
          iconWrapperClassName="bg-surface-alt text-text-secondary border border-border"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M20 12V22H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </section>

      {/* ======== Khu vực chính: Bảng trái + Panel phải ======== */}
      {/* Layout 2 cột: dùng items-start để 2 cột không giãn cao bằng nhau */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ---- Cột trái: Filter bar + Bảng dữ liệu ---- */}
        {/* Cột trái: chiếm toàn bộ phần còn lại, min-w-0 ngăn overflow */}
        <div className="min-w-0 flex-1 space-y-4">

          {/* Thanh lọc giao dịch */}
          <PaymentFilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            methodFilter={methodFilter}
            onMethodFilterChange={setMethodFilter}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            onFilter={handleFilter}
            onReset={handleReset}
          />

          {/* Bảng giao dịch + Phân trang */}
          <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <PaymentTable
              payments={MOCK_PAYMENTS}
              onRowClick={handleRowClick}
            />
            <PaymentPagination
              currentPage={currentPage}
              totalPages={Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE)}
              totalItems={TOTAL_ITEMS}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </section>
        </div>

        {/* ---- Cột phải: Panel "Giao dịch cần xử lý" ----
             Dùng lg:w-72 (288px) thay vì giá trị cố định px để panel
             tự co lại khi sidebar mở rộng và không gian hẹp hơn.
             shrink (không phải shrink-0) cho phép flex co lại nếu cần.
        */}
        <div className="w-full lg:w-72 xl:w-80 lg:shrink-0">
          {/* overflow-hidden ngăn nội dung bên trong tràn ra ngoài */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

            {/* Padding được tách ra để overflow-hidden ở wrapper vẫn hoạt động */}
            <div className="p-5">
            {/* Tiêu đề panel */}
            <div className="mb-4 flex items-center gap-2">
              {/* Icon cảnh báo màu vàng */}
              <svg className="h-5 w-5 shrink-0 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
              </svg>
              {/* truncate ngăn tiêu đề tràn ra ngoài khi không gian hẹp */}
              <h3 className="truncate text-[17px] font-bold text-text-main">
                Giao dịch cần xử lý
              </h3>
            </div>

            {/* Danh sách các vấn đề cần xử lý */}
            <div className="space-y-3">

              {/* Vấn đề 1: Chưa nhận IPN – nền vàng nhạt */}
              <div className="relative rounded-lg border border-[#fef08a] bg-[#fefce8] p-3 pl-10">
                {/* Icon sync màu vàng ở bên trái */}
                <svg className="absolute left-3 top-3 h-5 w-5 text-[#ca8a04]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M4 12v.01M4 12a8 8 0 018-8 8 8 0 015.657 2.343M20 12a8 8 0 01-8 8 8 8 0 01-5.657-2.343" strokeLinecap="round" />
                  <path d="M20 4v4h-4M4 20v-4h4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* break-words ngăn chuỗi dài không có khoảng trắng tràn ra */}
                <p className="break-words text-sm font-medium text-text-main">Chưa nhận IPN (2)</p>
                <p className="mt-1 break-words text-xs text-text-secondary">
                  Hệ thống chưa nhận được webhook từ VNPAY cho các giao dịch này.
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-[#0ea5e9] hover:underline"
                >
                  Đồng bộ lại
                </button>
              </div>

              {/* Vấn đề 2: Sai lệch số tiền – nền đỏ nhạt */}
              <div className="relative rounded-lg border border-[#ffdad6] bg-[#fef2f2] p-3 pl-10">
                {/* Icon price_change màu đỏ ở bên trái */}
                <svg className="absolute left-3 top-3 h-5 w-5 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" />
                </svg>
                <p className="break-words text-sm font-medium text-text-main">Sai lệch số tiền (1)</p>
                <p className="mt-1 break-words text-xs text-text-secondary">
                  Đơn ORD-2026... thực tế thanh toán khác với giá trị đơn hàng.
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-[#ea580c] hover:underline"
                >
                  Kiểm tra ngay
                </button>
              </div>
            </div>
            </div>{/* đóng thẻ padding p-5 */}
          </div>
        </div>
      </div>

      {/* ======== Ngăn kéo chi tiết giao dịch ======== */}
      {/* Hiển thị khi selectedPayment !== null */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  );
}
