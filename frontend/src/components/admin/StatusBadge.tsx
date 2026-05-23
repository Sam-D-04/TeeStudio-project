export type DesignStatus = "pending" | "revision" | "ready" | "urgent";

type StatusBadgeProps = {
  status: DesignStatus;
};

const statusConfig: Record<DesignStatus, { label: string; className: string }> = {
  pending: {
    label: "Chờ duyệt",
    className: "bg-[#fef3c7] text-[#d97706]",
  },
  revision: {
    label: "Cần sửa",
    className: "bg-[#fee2e2] text-[#b91c1c]",
  },
  ready: {
    label: "Sẵn sàng in",
    className: "bg-[#dcfce7] text-[#059669]",
  },
  urgent: {
    label: "Gấp",
    className: "bg-error-container text-on-error-container",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-4 ${config.className}`}
    >
      {config.label}
    </span>
  );
}
