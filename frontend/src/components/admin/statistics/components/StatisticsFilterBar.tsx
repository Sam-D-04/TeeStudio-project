import {
  DownloadOutlined,
  FilterOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { useState } from "react";
import DateRangeFilter from "@/components/admin/common/DateRangeFilter";
import AdminButton from "@/components/admin/common/AdminButton";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { xuatBaoCaoThongKe } from "@/services/admin/statisticsService";

export default function StatisticsFilterBar({
  onDateChange,
}: {
  onDateChange: (startDate: string, endDate: string) => void;
}) {
  const [selectedDates, setSelectedDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [isExporting, setIsExporting] = useState(false);
  const [messageApi, messageContextHolder] = message.useMessage();

  function handleDateChange(startDate: string, endDate: string) {
    setSelectedDates({ startDate, endDate });
    onDateChange(startDate, endDate);
  }

  async function handleExportReport() {
    const { startDate, endDate } = selectedDates;
    if (!startDate || !endDate || isExporting) return;

    setIsExporting(true);
    try {
      await xuatBaoCaoThongKe(startDate, endDate);
      messageApi.success("Đã xuất báo cáo Excel thành công.");
    } catch (error) {
      messageApi.error(
        getApiErrorMessage(error, "Không thể xuất báo cáo. Vui lòng thử lại.")
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      {messageContextHolder}
      <section className="admin-card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-x-2 gap-y-1">
          <span className="row-span-2 flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary-fixed text-primary">
            <FilterOutlined />
          </span>
          <span className="text-sm font-bold text-text-main">Khoảng thời gian</span>
          <p className="text-xs text-text-muted">Lọc theo ngày tạo đơn hoặc ngày tạo giao dịch.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <DateRangeFilter
            onChange={handleDateChange}
            initialPreset="thisYear"
            showAllOption={false}
            rangePickerClassName="lg:!w-[280px]"
          />
          <AdminButton
            variant="primary"
            icon={isExporting ? <LoadingOutlined spin /> : <DownloadOutlined />}
            disabled={
              isExporting ||
              !selectedDates.startDate ||
              !selectedDates.endDate
            }
            className="disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleExportReport}
          >
            {isExporting ? "Đang xuất..." : "Xuất báo cáo"}
          </AdminButton>
        </div>
      </section>
    </>
  );
}
