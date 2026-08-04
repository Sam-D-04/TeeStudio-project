"use client";

import { Modal, Tag, Typography } from "antd";
import type { MaKhuyenMai } from "./PromotionTable";
import PromotionStatusBadge from "./PromotionStatusBadge";
import PromotionUsageBar from "./PromotionUsageBar";
import {
  TagOutlined,
  PercentageOutlined,
  DollarOutlined,
  CarOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";

const { Text, Title } = Typography;

type PromotionDetailModalProps = {
  open: boolean;
  onClose: () => void;
  promotion: MaKhuyenMai | null;
};

// Hàm chuyển đổi loại giảm từ giá trị DB sang tiếng Việt hiển thị
function hienThiLoaiGiam(loaiGiam: MaKhuyenMai["loaiGiam"]): { text: string, icon: React.ReactNode } {
  switch (loaiGiam) {
    case "phan_tram":
      return { text: "Phần trăm", icon: <PercentageOutlined /> };
    case "so_tien":
      return { text: "Số tiền trực tiếp", icon: <DollarOutlined /> };
    case "mien_phi_van_chuyen":
      return { text: "Miễn phí vận chuyển", icon: <CarOutlined /> };
    default:
      return { text: "Không rõ", icon: <TagOutlined /> };
  }
}

// Hàm chuyển đổi giá trị giảm sang chuỗi hiển thị đẹp
function hienThiGiaTriGiam(
  loaiGiam: MaKhuyenMai["loaiGiam"],
  giaTriGiam: number,
): string {
  switch (loaiGiam) {
    case "phan_tram":
      return `${giaTriGiam}%`;
    case "so_tien":
      return giaTriGiam.toLocaleString("vi-VN") + "đ";
    case "mien_phi_van_chuyen":
      return "Toàn quốc";
    default:
      return String(giaTriGiam);
  }
}

// Hàm format thời gian áp dụng
function hienThiNgay(ngay: string | null): string {
  if (!ngay) return "Vô thời hạn";
  const parts = ngay.split("-");
  if (parts.length === 3) {
    const [nam, thang, ngayP] = parts;
    return `${ngayP}/${thang}/${nam}`;
  }
  return ngay;
}

function DetailItem({ label, value, valueColor, icon }: { label: string, value: React.ReactNode, valueColor?: string, icon?: React.ReactNode }) {
  return (
    <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", fontWeight: 500 }}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: valueColor || "#0f172a" }}>{value}</div>
    </div>
  );
}

export default function PromotionDetailModal({
  open,
  onClose,
  promotion,
}: PromotionDetailModalProps) {
  if (!promotion) return null;

  const loaiGiamInfo = hienThiLoaiGiam(promotion.loaiGiam);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 8 }}>
          <Title level={4} style={{ margin: 0, color: "#0f172a" }}>
            Chi tiết Khuyến mãi
          </Title>
          <PromotionStatusBadge trangThai={promotion.trangThai} />
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          style={{
            height: 40,
            padding: "0 24px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "#475569",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ffffff";
          }}
        >
          Đóng
        </button>
      }
      centered
      width={700}
      styles={{
        header: { padding: "20px 24px", borderBottom: "1px solid #e2e8f0", margin: 0 },
        body: { padding: "24px" },
        footer: { padding: "12px 24px", borderTop: "1px solid #e2e8f0", margin: 0 },
      }}
      closeIcon={null}
      destroyOnHidden
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Banner mã code */}
        <div style={{ 
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", 
          padding: "24px", 
          borderRadius: "16px", 
          border: "1px dashed #7dd3fc", 
          textAlign: "center",
          boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)"
        }}>
          <Text style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "1.5px", color: "#0284c7", fontWeight: 600 }}>Mã Code</Text>
          <br />
          <div style={{ display: "inline-block", background: "#ffffff", padding: "8px 24px", borderRadius: 8, marginTop: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <Text strong style={{ fontSize: 28, color: "#0369a1", letterSpacing: "2px" }}>{promotion.ma}</Text>
          </div>
        </div>

        {/* Thông tin chi tiết Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          
          <DetailItem 
            icon={loaiGiamInfo.icon}
            label="Loại giảm giá" 
            value={loaiGiamInfo.text} 
          />
          
          <DetailItem 
            icon={<TagOutlined />}
            label="Giá trị giảm" 
            value={hienThiGiaTriGiam(promotion.loaiGiam, promotion.giaTriGiam)}
            valueColor={promotion.loaiGiam === "mien_phi_van_chuyen" ? "#10b981" : "#ea580c"}
          />

          <DetailItem 
            icon={<ShoppingCartOutlined />}
            label="Đơn hàng tối thiểu" 
            value={promotion.donToiThieu === 0 ? "Không yêu cầu" : promotion.donToiThieu.toLocaleString("vi-VN") + "đ"} 
          />

          <DetailItem 
            icon={<UsergroupAddOutlined />}
            label="Đối tượng áp dụng" 
            value={
              promotion.chiDanhChoKhachMoi 
                ? <Tag color="cyan" style={{ margin: 0, fontSize: 13, padding: "2px 8px" }}>Chỉ khách hàng mới</Tag> 
                : <Tag color="default" style={{ margin: 0, fontSize: 13, padding: "2px 8px" }}>Tất cả khách hàng</Tag>
            } 
          />

          <DetailItem 
            icon={<CalendarOutlined />}
            label="Thời gian bắt đầu" 
            value={hienThiNgay(promotion.ngayBatDau)} 
          />

          <DetailItem 
            icon={<CalendarOutlined />}
            label="Thời gian kết thúc" 
            value={hienThiNgay(promotion.ngayKetThuc)} 
            valueColor={!promotion.ngayKetThuc ? "#10b981" : undefined}
          />

        </div>

        {/* Thống kê sử dụng */}
        <div style={{ padding: "20px", background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PercentageOutlined style={{ color: "#64748b" }} />
              </div>
              <Text style={{ fontWeight: 600, color: "#0f172a", fontSize: 15 }}>Thống kê sử dụng</Text>
            </div>
            <div style={{ textAlign: "right" }}>
              <Text style={{ fontSize: 14, color: "#64748b" }}>
                Đã dùng: <strong style={{ color: "#0ea5e9", fontSize: 16 }}>{promotion.daSuDung.toLocaleString("vi-VN")}</strong>
                {promotion.gioiHanLuot ? ` / ${promotion.gioiHanLuot.toLocaleString("vi-VN")}` : " (Không giới hạn)"}
              </Text>
            </div>
          </div>
          <PromotionUsageBar daSuDung={promotion.daSuDung} gioiHan={promotion.gioiHanLuot} />
        </div>

      </div>
    </Modal>
  );
}
