import {
  CalendarOutlined,
  DownloadOutlined,
  FilterOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { DatePicker, message, Select } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { xuatBaoCaoDashboard } from "@/services/admin/dashboardService";
import AdminButton from "../../common/AdminButton";

const { RangePicker } = DatePicker;

export type DashboardDateRange = [Dayjs | null, Dayjs | null];

type QuickRange =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "thisYear"
  | "custom";

const quickRangeOptions: Array<{ label: string; value: QuickRange }> = [
  { label: "Hôm nay", value: "today" },
  { label: "Hôm qua", value: "yesterday" },
  { label: "7 ngày qua", value: "last7Days" },
  { label: "30 ngày qua", value: "last30Days" },
  { label: "Tháng này", value: "thisMonth" },
  { label: "Tháng trước", value: "lastMonth" },
  { label: "Quý này", value: "thisQuarter" },
  { label: "Năm nay", value: "thisYear" },
  { label: "Tùy chỉnh", value: "custom" },
];

type DashboardFilterToolbarProps = {
  dates: DashboardDateRange;
  onDatesChange: (dates: DashboardDateRange) => void;
};

export default function DashboardFilterToolbar({
  dates,
  onDatesChange,
}: DashboardFilterToolbarProps) {
  const [selectedQuickRange, setSelectedQuickRange] =
    useState<QuickRange>("thisMonth");
  const [isExporting, setIsExporting] = useState(false);
  const [messageApi, messageContextHolder] = message.useMessage();

  function handleQuickRangeChange(value: QuickRange) {
    setSelectedQuickRange(value);

    if (value === "custom") return;

    const today = dayjs();
    const yesterday = today.subtract(1, "day");
    const lastMonth = today.subtract(1, "month");
    const quarterStartMonth = Math.floor(today.month() / 3) * 3;
    const quarterStart = today.month(quarterStartMonth).startOf("month");

    const calculatedRanges: Record<Exclude<QuickRange, "custom">, DashboardDateRange> = {
      today: [today.startOf("day"), today.endOf("day")],
      yesterday: [yesterday.startOf("day"), yesterday.endOf("day")],
      last7Days: [today.subtract(6, "day").startOf("day"), today.endOf("day")],
      last30Days: [today.subtract(29, "day").startOf("day"), today.endOf("day")],
      thisMonth: [today.startOf("month"), today.endOf("month")],
      lastMonth: [lastMonth.startOf("month"), lastMonth.endOf("month")],
      thisQuarter: [quarterStart, quarterStart.add(2, "month").endOf("month")],
      thisYear: [today.startOf("year"), today.endOf("year")],
    };

    onDatesChange(calculatedRanges[value]);
  }

  function handleRangeChange(values: DashboardDateRange | null) {
    if (!values || !values[0] || !values[1]) return;

    setSelectedQuickRange("custom");
    onDatesChange(values);
  }

  async function handleExportReport() {
    const [startDate, endDate] = dates;
    if (!startDate || !endDate || isExporting) return;

    setIsExporting(true);
    try {
      const { blob, fileName } = await xuatBaoCaoDashboard(
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD")
      );
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);

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
          <Select<QuickRange>
            aria-label="Chọn mốc thời gian nhanh"
            value={selectedQuickRange}
            options={quickRangeOptions}
            className="w-full sm:w-[170px]"
            onChange={handleQuickRangeChange}
          />
          <RangePicker
            aria-label="Chọn khoảng thời gian"
            value={dates}
            format="DD/MM/YYYY"
            separator="→"
            suffixIcon={<CalendarOutlined />}
            allowClear={false}
            className="w-full sm:w-[320px]"
            onChange={handleRangeChange}
          />
          <AdminButton
            variant="primary"
            icon={
              isExporting ? <LoadingOutlined spin /> : <DownloadOutlined />
            }
            disabled={isExporting || !dates[0] || !dates[1]}
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
