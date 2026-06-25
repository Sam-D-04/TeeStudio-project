"use client";

import { CalendarOutlined } from "@ant-design/icons";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";

const { RangePicker } = DatePicker;

export type DateFilterPreset =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "thisYear"
  | "custom";

type DateRange = [Dayjs | null, Dayjs | null];

const quickRangeOptions: Array<{
  label: string;
  value: DateFilterPreset;
}> = [
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

function calculateDateRange(preset: DateFilterPreset): DateRange {
  if (preset === "custom") return [null, null];

  const today = dayjs();
  const yesterday = today.subtract(1, "day");
  const lastMonth = today.subtract(1, "month");
  const quarterStartMonth = Math.floor(today.month() / 3) * 3;
  const quarterStart = today.month(quarterStartMonth).startOf("month");

  const ranges: Record<Exclude<DateFilterPreset, "custom">, DateRange> = {
    today: [today.startOf("day"), today.endOf("day")],
    yesterday: [yesterday.startOf("day"), yesterday.endOf("day")],
    last7Days: [today.subtract(6, "day").startOf("day"), today.endOf("day")],
    last30Days: [today.subtract(29, "day").startOf("day"), today.endOf("day")],
    thisMonth: [today.startOf("month"), today.endOf("month")],
    lastMonth: [lastMonth.startOf("month"), lastMonth.endOf("month")],
    thisQuarter: [quarterStart, quarterStart.add(2, "month").endOf("month")],
    thisYear: [today.startOf("year"), today.endOf("year")],
  };

  return ranges[preset];
}

function emitDateRange(
  dates: DateRange,
  onChange: (startDate: string, endDate: string) => void
) {
  const [startDate, endDate] = dates;
  if (!startDate || !endDate) return;

  onChange(
    startDate.format("YYYY-MM-DD"),
    endDate.format("YYYY-MM-DD")
  );
}

export type DateRangeFilterProps = {
  onChange: (startDate: string, endDate: string) => void;
  onClear?: () => void;
  initialPreset?: DateFilterPreset;
  initialStartDate?: string;
  initialEndDate?: string;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  rangePickerClassName?: string;
};

/**
 * Bộ lọc thời gian dùng chung cho các trang quản trị.
 *
 * Component tự quản lý preset, RangePicker và quy đổi ngày. Trang cha chỉ nhận
 * startDate/endDate theo định dạng YYYY-MM-DD để đưa vào API.
 */
export default function DateRangeFilter({
  onChange,
  onClear,
  initialPreset = "thisMonth",
  initialStartDate,
  initialEndDate,
  allowClear = false,
  disabled = false,
  className = "",
  selectClassName = "",
  rangePickerClassName = "",
}: DateRangeFilterProps) {
  const onChangeRef = useRef(onChange);
  const [initialDates] = useState<DateRange>(() => {
    const startDate = initialStartDate ? dayjs(initialStartDate) : null;
    const endDate = initialEndDate ? dayjs(initialEndDate) : null;

    if (startDate?.isValid() && endDate?.isValid()) {
      return [startDate.startOf("day"), endDate.endOf("day")];
    }

    return calculateDateRange(initialPreset);
  });
  const [selectedPreset, setSelectedPreset] =
    useState<DateFilterPreset>(initialPreset);
  const [dates, setDates] = useState<DateRange>(initialDates);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (initialStartDate && initialEndDate) return;
    emitDateRange(initialDates, onChangeRef.current);
  }, [initialDates, initialStartDate, initialEndDate]);

  function handlePresetChange(preset: DateFilterPreset) {
    setSelectedPreset(preset);

    if (preset === "custom") return;

    const calculatedDates = calculateDateRange(preset);
    setDates(calculatedDates);
    emitDateRange(calculatedDates, onChangeRef.current);
  }

  function handleRangeChange(values: DateRange | null) {
    if (!values?.[0] || !values[1]) {
      setDates([null, null]);
      setSelectedPreset("custom");
      onClear?.();
      return;
    }

    const selectedDates: DateRange = [values[0], values[1]];
    setDates(selectedDates);
    setSelectedPreset("custom");
    emitDateRange(selectedDates, onChangeRef.current);
  }

  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center ${className}`}>
      <Select<DateFilterPreset>
        aria-label="Chọn mốc thời gian nhanh"
        value={selectedPreset}
        options={quickRangeOptions}
        disabled={disabled}
        className={`w-full sm:w-[170px] ${selectClassName}`}
        onChange={handlePresetChange}
        listHeight={320}
      />
      <RangePicker
        aria-label="Chọn khoảng thời gian"
        value={dates}
        format="DD/MM/YYYY"
        placeholder={["Từ ngày", "Đến ngày"]}
        separator="→"
        suffixIcon={<CalendarOutlined />}
        allowClear={allowClear}
        disabled={disabled}
        className={`w-full sm:w-[320px] ${rangePickerClassName}`}
        onChange={handleRangeChange}
      />
    </div>
  );
}
