import { CalendarOutlined, DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import AdminButton from "../../common/AdminButton";

const { RangePicker } = DatePicker;

type DateRange = [Dayjs, Dayjs];

/** Hàm tính ngày đầu tuần (Thứ Hai) và hôm nay */
function getWeekRange(): DateRange {
  const today = dayjs();
  const daysFromMonday = (today.day() + 6) % 7;
  return [today.subtract(daysFromMonday, "day"), today];
}

type DashboardFilterToolbarProps = {
  /** Callback khi người dùng thay đổi khoảng thời gian. Truyền [tuNgay, denNgay] dạng "YYYY-MM-DD" */
  onRangeChange?: (tuNgay: string, denNgay: string) => void;
};

export default function DashboardFilterToolbar({
  onRangeChange,
}: DashboardFilterToolbarProps) {
  const today = dayjs();
  const defaultRange: DateRange = [today.startOf("month"), today];
  const [weekStart, weekEnd] = getWeekRange();

  const rangePresets = [
    { label: "Hôm nay", value: [today, today] as DateRange },
    { label: "Tuần này", value: [weekStart, weekEnd] as DateRange },
    { label: "Tháng này", value: defaultRange },
  ];

  function handleChange(values: [Dayjs | null, Dayjs | null] | null) {
    if (!values || !values[0] || !values[1]) return;
    const tuNgay = values[0].format("YYYY-MM-DD");
    const denNgay = values[1].format("YYYY-MM-DD");
    onRangeChange?.(tuNgay, denNgay);
  }

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
          onChange={handleChange}
        />
        <AdminButton variant="primary" icon={<DownloadOutlined />}>
          Xuất báo cáo
        </AdminButton>
      </div>
    </section>
  );
}
