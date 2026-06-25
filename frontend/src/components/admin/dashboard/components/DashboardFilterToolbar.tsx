import {
  DownloadOutlined,
  FilterOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { useState } from "react";
import DateRangeFilter from "@/components/admin/common/DateRangeFilter";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { xuatBaoCaoDashboard } from "@/services/admin/dashboardService";
import AdminButton from "../../common/AdminButton";

type DashboardFilterToolbarProps = {
  onDateChange: (startDate: string, endDate: string) => void;
};

export default function DashboardFilterToolbar({
  onDateChange,
}: DashboardFilterToolbarProps) {
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
      await xuatBaoCaoDashboard(startDate, endDate);
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
      <section className="admin-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
          <FilterOutlined className="text-primary-container" />
          <span>Lọc theo thời gian</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <DateRangeFilter onChange={handleDateChange} />
          <AdminButton
            variant="primary"
            icon={
              isExporting ? <LoadingOutlined spin /> : <DownloadOutlined />
            }
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
