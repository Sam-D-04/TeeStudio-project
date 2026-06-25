import Link from "next/link";
import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
  iconClassName: string;
  valueClassName?: string;
  /** Nhãn phụ nhỏ hiển thị bên dưới giá trị chính (dùng cho nhóm rủi ro vận hành) */
  subLabel?: string;
  /** Giá trị phụ nhỏ hiển thị bên dưới giá trị chính */
  subValue?: string;
  subValueClassName?: string;
};

export default function MetricCard({
  label,
  value,
  href,
  icon,
  iconClassName,
  valueClassName = "text-text-main",
  subLabel,
  subValue,
  subValueClassName = "text-text-secondary",
}: MetricCardProps) {
  return (
    <Link
      href={href}
      aria-label={`${label}: ${value}. Xem chi tiết`}
      className="admin-card admin-card-hover flex cursor-pointer flex-col justify-between p-4 outline-none focus-visible:border-primary-container focus-visible:ring-2 focus-visible:ring-primary-container/30"
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-xs leading-[1.4] text-text-secondary">{label}</p>
        <span className={`flex text-[18px] leading-none ${iconClassName}`}>
          {icon}
        </span>
      </div>
      <p className={`text-[22px] font-bold leading-7 ${valueClassName}`}>{value}</p>
      {subLabel && subValue && (
        <p className={`mt-1 text-[11px] leading-4 ${subValueClassName}`}>
          {subLabel}:{" "}
          <span className="font-semibold">{subValue}</span>
        </p>
      )}
    </Link>
  );
}
