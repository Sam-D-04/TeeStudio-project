import { CalendarOutlined, DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import AdminButton from "../../common/AdminButton";

const { RangePicker } = DatePicker;

type DateRange = [Dayjs, Dayjs];

function getWeekRange(): DateRange {
  const today = dayjs();
  const daysFromMonday = (today.day() + 6) % 7;

  return [today.subtract(daysFromMonday, "day"), today];
}

export default function DashboardFilterToolbar() {
  const today = dayjs();
  const defaultRange: DateRange = [today.startOf("month"), today];
  const [weekStart, weekEnd] = getWeekRange();

  const rangePresets = [
    { label: "Hôm nay", value: [today, today] as DateRange },
    { label: "Tuần này", value: [weekStart, weekEnd] as DateRange },
    { label: "Tháng này", value: defaultRange },
  ];

  return (
    <section className="admin-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
        <FilterOutlined className="text-primary-container" />
        <span>Lọc theo thời gian</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <RangePicker
          aria-label="Chọn khoảng thời gian"
          defaultValue={defaultRange}
          format="YYYY-MM-DD"
          presets={rangePresets}
          separator="→"
          suffixIcon={<CalendarOutlined />}
          allowClear={false}
          className="w-full sm:w-[320px]"
        />
        <AdminButton variant="primary" icon={<DownloadOutlined />}>
          Xuất báo cáo
        </AdminButton>
      </div>
    </section>
  );
}
