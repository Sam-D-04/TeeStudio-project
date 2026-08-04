import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Kiểu dữ liệu dùng cho các UI component (MetricCard, Panels, Table)
// ─────────────────────────────────────────────────────────────────────────────

export type MetricItem = {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone: "primary" | "success" | "warning" | "accent";
  direction?: "up" | "down";
  directionLabel?: string;
  /** URL điều hướng khi click vào thẻ (tùy chọn) */
  href?: string;
};

export type DistributionItem = {
  label: string;
  value: number;
  displayValue: string;
  color: string;
  /** URL điều hướng khi click vào hàng (tùy chọn) */
  href?: string;
};

export type ChartDataItem = {
  label: string;
  value: number;
  displayValue: string;
  orderCount?: number;
};

export type StatisticsTableColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
};

export type StatisticsTableRow = {
  id: string;
  [key: string]: string | ReactNode;
};
