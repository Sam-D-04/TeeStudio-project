"use client";

import { useState, useCallback } from "react";
import type { MouseEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { message } from "antd";
import dayjs from "dayjs";
import PaymentDetailDrawer, { type PaymentDetail } from "./PaymentDetailDrawer";
import PaymentFilterBar from "./PaymentFilterBar";
import PaymentPagination from "./PaymentPagination";
import PaymentStatCard from "./PaymentStatCard";
import PaymentTable, { type Payment } from "./PaymentTable";
import {
  layThongKeThanhToan,
  layDanhSachGiaoDich,
  layChiTietGiaoDich,
  xacNhanThuCod,
  luuGhiChu,
  xuatBaoCaoThanhToan,
  type ThamSoLocGiaoDich,
} from "@/services/admin/paymentService";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

/**
 * PaymentPage – trang quản lý thanh toán (nội dung chính, không gồm sidebar/topbar).
 *
 * Component này tổng hợp tất cả phần tử của trang:
 * 1. Tiêu đề + các nút hành động đầu trang.
 * 2. 3 thẻ KPI thống kê.
 * 3. Bảng giao dịch với filter và phân trang.
 * 4. Ngăn kéo chi tiết giao dịch (mở khi bấm vào hàng).
 *
 * Dữ liệu được lấy từ API backend thông qua paymentService.
 */

export type PaymentInitialFilters = {
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  dateField?: "created" | "paid";
};

type PaymentPageProps = {
  initialFilters?: PaymentInitialFilters;
};

export default function PaymentPage({ initialFilters }: PaymentPageProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [messageApi, messageContextHolder] = message.useMessage();

  // ===== STATE BỘ LỌC =====
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    initialFilters?.status ?? "tat_ca"
  );
  const [methodFilter, setMethodFilter] = useState(
    initialFilters?.method ?? "tat_ca"
  );
  const [tuNgay, setTuNgay] = useState(initialFilters?.startDate ?? "");
  const [denNgay, setDenNgay] = useState(initialFilters?.endDate ?? "");
  const [dateField, setDateField] = useState(
    initialFilters?.dateField ?? "created"
  );
  const [dateFilterKey, setDateFilterKey] = useState(0);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // State chi tiết giao dịch
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ===== QUERY: THỐNG KÊ KPI =====
  const statsQuery = useQuery({
    queryKey: ["admin-payments-stats"],
    queryFn: layThongKeThanhToan,
    refetchInterval: 60000, // Tự động cập nhật mỗi phút
  });

  // ===== QUERY: DANH SÁCH GIAO DỊCH =====
  const buildFilterParams = useCallback((): ThamSoLocGiaoDich => {
    return {
      trang: currentPage,
      soMoiTrang: ITEMS_PER_PAGE,
      trangThai: statusFilter !== "tat_ca" ? statusFilter : undefined,
      phuongThuc: methodFilter !== "tat_ca" ? methodFilter : undefined,
      tuKhoa: searchValue || undefined,
      tuNgay: tuNgay || undefined,
      denNgay: denNgay || undefined,
      kieuNgay: dateField === "paid" ? "ngay_thanh_toan" : "ngay_tao",
    };
  }, [
    currentPage,
    statusFilter,
    methodFilter,
    searchValue,
    tuNgay,
    denNgay,
    dateField,
  ]);

  const listQuery = useQuery({
    queryKey: ["admin-payments", buildFilterParams()],
    queryFn: () => layDanhSachGiaoDich(buildFilterParams()),
  });

  // ===== QUERY: CHI TIẾT GIAO DỊCH =====
  const detailQuery = useQuery({
    queryKey: ["admin-payment-detail", selectedPaymentId],
    queryFn: () => layChiTietGiaoDich(selectedPaymentId!),
    enabled: selectedPaymentId !== null,
  });

  // ===== MUTATIONS =====
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    queryClient.invalidateQueries({ queryKey: ["admin-payments-stats"] });
    if (selectedPaymentId) {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-detail", selectedPaymentId] });
    }
  };

  const confirmCodMutation = useMutation({
    mutationFn: xacNhanThuCod,
    onSuccess: () => {
      invalidateAll();
      setActionLoading(false);
    },
    onError: () => {
      setActionLoading(false);
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => luuGhiChu(id, note),
    onSuccess: () => {
      if (selectedPaymentId) {
        queryClient.invalidateQueries({ queryKey: ["admin-payment-detail", selectedPaymentId] });
      }
      setActionLoading(false);
    },
    onError: () => {
      setActionLoading(false);
    },
  });

  // ===== XỬ LÝ SỰ KIỆN =====

  // Bấm vào hàng → mở ngăn kéo chi tiết
  function handleRowClick(payment: Payment) {
    setSelectedPaymentId(payment.id);
  }

  // Icon 👁️ Xem chi tiết
  function handleViewDetail(payment: Payment, e: MouseEvent) {
    e.stopPropagation();
    setSelectedPaymentId(payment.id);
  }

  // Icon ✅ Xác nhận thu COD
  function handleConfirmCod(payment: Payment, e: MouseEvent) {
    e.stopPropagation();
    confirmCodMutation.mutate(payment.id);
  }

  // Lưu ghi chú từ Drawer
  function handleSaveNote(id: number, note: string) {
    setActionLoading(true);
    saveNoteMutation.mutate({ id, note });
  }

  function handleSearchChange(val: string) {
    setSearchValue(val);
    setCurrentPage(1);
  }

  function handleStatusChange(val: string) {
    setStatusFilter(val);
    setCurrentPage(1);
  }

  function handleMethodChange(val: string) {
    setMethodFilter(val);
    setCurrentPage(1);
  }

  // Nút "Đặt lại"
  function handleReset() {
    setSearchValue("");
    setStatusFilter("tat_ca");
    setMethodFilter("tat_ca");
    setDateField("created");
    setTuNgay("");
    setDenNgay("");
    setCurrentPage(1);
    setDateFilterKey((current) => current + 1);
    router.push("/admin/thanh-toan");
  }

  function handleDateChange(startDate: string, endDate: string) {
    setTuNgay(startDate);
    setDenNgay(endDate);
    setCurrentPage(1);
  }

  function handleDateClear() {
    setTuNgay("");
    setDenNgay("");
    setCurrentPage(1);
  }

  async function handleExportReport() {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const currentFilters = buildFilterParams();
      await xuatBaoCaoThanhToan({
        trangThai: currentFilters.trangThai,
        phuongThuc: currentFilters.phuongThuc,
        tuKhoa: currentFilters.tuKhoa,
        tuNgay: currentFilters.tuNgay,
        denNgay: currentFilters.denNgay,
        kieuNgay: currentFilters.kieuNgay,
      });
      messageApi.success("Đã xuất báo cáo thanh toán thành công.");
    } catch (error) {
      messageApi.error(
        getApiErrorMessage(error, "Không thể xuất báo cáo thanh toán.")
      );
    } finally {
      setIsExporting(false);
    }
  }

  // ===== DỮ LIỆU TỪ QUERY =====
  const stats = statsQuery.data;
  const payments = listQuery.data?.danhSach ?? [];
  const totalItems = listQuery.data?.tongSo ?? 0;
  const totalPages = listQuery.data?.tongSoTrang ?? 1;

  // Xây dựng PaymentDetail từ detailQuery
  const selectedPayment: PaymentDetail | null = detailQuery.data
    ? {
        ...detailQuery.data,
        createdAt: detailQuery.data.createdAt || "",
        ipnHistory: detailQuery.data.ipnHistory || [],
      }
    : null;

  // ===== FORMAT HELPERS =====
  function formatVnd(amount: number): string {
    return amount.toLocaleString("vi-VN") + "đ";
  }

  // Thông báo lỗi
  const errorMessage = listQuery.error
    ? getApiErrorMessage(listQuery.error, "Không thể tải danh sách giao dịch")
    : null;
  const today = dayjs().format("YYYY-MM-DD");
  const hasNoSecondaryFilters =
    searchValue === "" && statusFilter === "tat_ca";

  return (
    <div>
      {messageContextHolder}

      {/* ======== Tiêu đề trang + nút hành động ======== */}
      <section className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-extrabold text-headline-lg-mobile text-text-main md:text-headline-lg">
            Thanh toán
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Theo dõi giao dịch, xử lý lỗi thanh toán và đối soát doanh thu đơn hàng.
          </p>
        </div>

        {/* Các nút hành động đầu trang */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Nút phụ: Xuất báo cáo */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportReport}
            className="flex h-control-h items-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* Icon download */}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isExporting ? "Đang xuất..." : "Xuất báo cáo"}
          </button>

        </div>
      </section>

      {/* ======== 4 thẻ KPI thống kê ======== */}
      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {/* KPI 1: Tổng tiền đã thanh toán hôm nay – có badge % */}
        <PaymentStatCard
          label="Tổng tiền đã thanh toán hôm nay"
          value={stats ? formatVnd(stats.tongTienHomNay) : "—"}
          iconWrapperClassName="bg-surface-alt text-text-secondary border border-border"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" strokeLinecap="round" />
            </svg>
          }
          href={`/admin/thanh-toan?status=COMPLETED&date=${today}&dateField=paid`}
          isActive={
            statusFilter === "da_thanh_toan" &&
            methodFilter === "tat_ca" &&
            tuNgay === today &&
            denNgay === today &&
            dateField === "paid" &&
            hasNoSecondaryFilters
          }
          badge={
            stats && stats.phanTramThayDoi !== 0 ? (
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  stats.phanTramThayDoi >= 0
                    ? "bg-[#dcfce7] text-[#059669]"
                    : "bg-[#fee2e2] text-[#b91c1c]"
                }`}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  {stats.phanTramThayDoi >= 0 ? (
                    <path d="M22 7l-10 10L7 12l-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M22 17l-10-10L7 12l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
                {stats.phanTramThayDoi > 0 ? "+" : "-"}
                {Math.abs(stats.phanTramThayDoi)}% vs hôm qua
              </span>
            ) : undefined
          }
        />

        {/* KPI 2: Giao dịch chờ thanh toán */}
        <PaymentStatCard
          label="Giao dịch chờ thanh toán"
          value={
            <>
              {stats?.choThanhToan ?? "—"}{" "}
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
          href="/admin/thanh-toan?status=PENDING&method=VNPAY"
          isActive={
            statusFilter === "cho_thanh_toan" &&
            methodFilter === "vnpay" &&
            tuNgay === "" &&
            denNgay === "" &&
            hasNoSecondaryFilters
          }
        />

        {/* KPI 3: Giao dịch COD cần kế toán đối soát */}
        <PaymentStatCard
          label="Giao dịch cần đối soát"
          value={
            <>
              {stats?.canDoiSoat ?? "—"}{" "}
              <span className="text-base font-normal text-text-muted">đơn</span>
            </>
          }
          iconWrapperClassName="border border-[#fde047] bg-[#fef9c3] text-[#854d0e]"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          }
          href="/admin/thanh-toan?status=PENDING&method=COD"
          isActive={
            statusFilter === "can_doi_soat" &&
            methodFilter === "cod" &&
            tuNgay === "" &&
            denNgay === "" &&
            hasNoSecondaryFilters
          }
        />

        {/* KPI 4: Giao dịch thất bại – dạng alert (viền đỏ bên phải) */}
        <PaymentStatCard
          label="Giao dịch thất bại"
          value={
            <>
              {stats?.thatBai ?? "—"}{" "}
              {(stats?.thatBai ?? 0) > 0 && (
                <span className="text-base font-normal text-[#ea580c]">(cần kiểm tra)</span>
              )}
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
          href="/admin/thanh-toan?status=FAILED%2CCANCELLED"
          isActive={
            statusFilter === "that_bai" &&
            methodFilter === "tat_ca" &&
            tuNgay === "" &&
            denNgay === "" &&
            hasNoSecondaryFilters
          }
        />


      </section>

      {/* ======== Khu vực chính: Filter bar + Bảng dữ liệu ======== */}
      <div className="space-y-4">
        {/* Thanh lọc giao dịch */}
        <PaymentFilterBar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusChange}
          methodFilter={methodFilter}
          onMethodFilterChange={handleMethodChange}
          dateFilterKey={dateFilterKey}
          initialDatePreset="custom"
          initialStartDate={tuNgay || undefined}
          initialEndDate={denNgay || undefined}
          onDateChange={handleDateChange}
          onDateClear={handleDateClear}
          onReset={handleReset}
        />

        {/* Bảng giao dịch + Phân trang */}
        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

          {/* Trạng thái loading */}
          {listQuery.isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-[#0ea5e9]" />
              <span className="ml-3 text-sm text-text-secondary">Đang tải danh sách giao dịch...</span>
            </div>
          )}

          {/* Trạng thái lỗi */}
          {errorMessage && !listQuery.isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="mb-3 h-10 w-10 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-text-secondary">{errorMessage}</p>
              <button
                type="button"
                onClick={() => listQuery.refetch()}
                className="mt-3 text-sm font-medium text-[#0ea5e9] hover:underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Trạng thái rỗng */}
          {!listQuery.isLoading && !errorMessage && payments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="mb-3 h-10 w-10 text-text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-text-secondary">Không có giao dịch nào</p>
            </div>
          )}

          {/* Bảng dữ liệu */}
          {!listQuery.isLoading && !errorMessage && payments.length > 0 && (
            <>
              <PaymentTable
                payments={payments}
                onRowClick={handleRowClick}
                onViewDetail={handleViewDetail}
                onConfirmCod={handleConfirmCod}
              />
              <PaymentPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </section>
      </div>

      {/* ======== Ngăn kéo chi tiết giao dịch ======== */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        onClose={() => setSelectedPaymentId(null)}
        isLoading={detailQuery.isLoading && selectedPaymentId !== null}
        onSaveNote={handleSaveNote}
        isActionLoading={actionLoading}
      />
    </div>
  );
}
