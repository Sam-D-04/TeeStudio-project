import {
  FilterOutlined,
} from "@ant-design/icons";
import DateRangeFilter from "@/components/admin/common/DateRangeFilter";

type DashboardFilterToolbarProps = {
  onDateChange: (startDate: string, endDate: string) => void;
};

export default function DashboardFilterToolbar({
  onDateChange,
}: DashboardFilterToolbarProps) {
  return (
    <section className="admin-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
        <FilterOutlined className="text-primary-container" />
        <span>Lọc theo thời gian</span>
      </div>

      <DateRangeFilter
        onChange={onDateChange}
        showAllOption={false}
      />
    </section>
  );
}
