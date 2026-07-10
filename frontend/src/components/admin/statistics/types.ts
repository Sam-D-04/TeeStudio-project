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
};

export type DistributionItem = {
  label: string;
  value: number;
  displayValue: string;
  color: string;
};

export type ChartDataItem = {
  label: string;
  value: number;
  displayValue: string;
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
