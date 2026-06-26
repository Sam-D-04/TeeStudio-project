"use client";

/**
 * AccountStatCards – 3 thẻ KPI thống kê tài khoản khách hàng.
 * Hiển thị: Tổng tài khoản | Đang hoạt động | Đã vô hiệu hóa
 */

import { TeamOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";

type Props = {
  tongSo: number;
  soHoatDong: number;
  soVoHieuHoa: number;
};

function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  valueColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
          {label}
        </p>
        <h3
          style={{
            margin: "4px 0 0",
            fontSize: 28,
            fontWeight: 800,
            color: valueColor ?? "#0f172a",
            lineHeight: 1,
          }}
        >
          {value.toLocaleString("vi-VN")}
        </h3>
      </div>
    </div>
  );
}

export default function AccountStatCards({ tongSo, soHoatDong, soVoHieuHoa }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
      }}
    >
      <StatCard
        label="Tổng tài khoản"
        value={tongSo}
        icon={<TeamOutlined />}
        iconBg="#e0f2fe"
        iconColor="#0ea5e9"
      />
      <StatCard
        label="Đang hoạt động"
        value={soHoatDong}
        icon={<CheckCircleOutlined />}
        iconBg="#dcfce7"
        iconColor="#16a34a"
        valueColor="#16a34a"
      />
      <StatCard
        label="Đã vô hiệu hóa"
        value={soVoHieuHoa}
        icon={<StopOutlined />}
        iconBg="#f1f5f9"
        iconColor="#64748b"
        valueColor="#64748b"
      />
    </div>
  );
}
