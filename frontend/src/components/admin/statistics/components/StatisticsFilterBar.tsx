import { FilterOutlined } from "@ant-design/icons";
import DateRangeFilter from "@/components/admin/common/DateRangeFilter";

export default function StatisticsFilterBar({
  onDateChange,
}: {
  onDateChange: (startDate: string, endDate: string) => void;
}) {
  return (
    <section className="admin-card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-text-main">
          <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary-fixed text-primary">
            <FilterOutlined />
          </span>
          <span>Khoảng thời gian</span>
        </div>
        <p className="mt-1 pl-10 text-xs text-text-muted">Lọc theo ngày tạo đơn hoặc ngày tạo giao dịch.</p>
      </div>
      <DateRangeFilter
        onChange={onDateChange}
        initialPreset="thisYear"
        showAllOption={false}
        rangePickerClassName="lg:!w-[280px]"
      />
    </section>
  );
}
