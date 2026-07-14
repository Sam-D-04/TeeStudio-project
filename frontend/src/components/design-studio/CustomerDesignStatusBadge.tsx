"use client";

import type { DesignStatus } from "@/services/userDesignService";

/**
 * Badge trạng thái thiết kế cho phía khách hàng — khoá trực tiếp theo giá trị
 * CustomDesign.status trong DB (khác với admin/designs/DesignStatusBadge.tsx,
 * vốn dùng bộ khoá tiếng Việt riêng cho panel admin). Cùng tông màu để nhất
 * quán trong toàn hệ thống.
 */
const CONFIG: Record<DesignStatus, { label: string; bg: string; fg: string }> = {
  DRAFT: { label: "Nháp — chưa gửi duyệt", bg: "#e2e8f0", fg: "#475569" },
  PENDING_REVIEW: { label: "Đang chờ duyệt", bg: "#fef3c7", fg: "#d97706" },
  NEEDS_REVISION: { label: "Cần chỉnh sửa", bg: "#ffedd5", fg: "#ea580c" },
  APPROVED: { label: "Đã duyệt", bg: "#dcfce7", fg: "#10b981" },
};

export default function CustomerDesignStatusBadge({ status }: { status: DesignStatus }) {
  const cfg = CONFIG[status] ?? { label: "Không xác định", bg: "#e4e9ed", fg: "#6e7881" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        backgroundColor: cfg.bg,
        color: cfg.fg,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}
