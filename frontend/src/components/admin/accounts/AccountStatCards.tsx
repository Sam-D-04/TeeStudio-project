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
  currentStatus?: string;
  onFilterChange?: (status: string) => void;
};

function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  valueColor,
  isActive,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isActive ? "#f8fafc" : "#ffffff",
        border: isActive ? `2px solid ${iconColor}` : "1px solid #e2e8f0",
        borderRadius: 16,
        boxShadow: isActive ? `0 4px 12px ${iconColor}33` : "0 1px 4px rgba(0,0,0,0.05)",
        padding: isActive ? "19px 21px" : "20px 22px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        transform: isActive ? "translateY(-2px)" : "none",
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

export default function AccountStatCards({ 
  tongSo, 
  soHoatDong, 
  soVoHieuHoa,
  currentStatus,
  onFilterChange 
}: Props) {
  const handleCardClick = (status: string) => {
    if (onFilterChange) {
      onFilterChange(status);
    }
  };

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
        isActive={currentStatus === "" || currentStatus === undefined}
        onClick={() => handleCardClick("")}
      />
      <StatCard
        label="Đang hoạt động"
        value={soHoatDong}
        icon={<CheckCircleOutlined />}
        iconBg="#dcfce7"
        iconColor="#16a34a"
        valueColor="#16a34a"
        isActive={currentStatus === "ACTIVE"}
        onClick={() => handleCardClick("ACTIVE")}
      />
      <StatCard
        label="Đã vô hiệu hóa"
        value={soVoHieuHoa}
        icon={<StopOutlined />}
        iconBg="#f1f5f9"
        iconColor="#64748b"
        valueColor="#64748b"
        isActive={currentStatus === "INACTIVE"}
        onClick={() => handleCardClick("INACTIVE")}
      />
    </div>
  );
}
