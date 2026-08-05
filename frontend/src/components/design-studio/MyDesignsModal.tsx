import { useEffect, useState, type CSSProperties } from "react";
import { Modal, Card, Col, Row, Typography, Spin, Empty, Button, message, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { userDesignService, SavedDesign } from "@/services/userDesignService";
import useAuthStore from "@/store/useAuthStore";
import CustomerDesignStatusBadge from "./CustomerDesignStatusBadge";

const { Text } = Typography;
const { Meta } = Card;

/* Nhãn nhỏ "Trước"/"Sau" đè góc dưới-trái mỗi nửa ảnh in thật */
const nhanMatStyle: CSSProperties = {
  position: "absolute",
  bottom: 6,
  left: 6,
  fontSize: 10,
  fontWeight: 700,
  padding: "1px 6px",
  borderRadius: 10,
  background: "rgba(15,23,42,0.65)",
  color: "#fff",
};

interface MyDesignsModalProps {
  open: boolean;
  onCancel: () => void;
  onSelectDesign: (design: SavedDesign) => void;
}

export default function MyDesignsModal({ open, onCancel, onSelectDesign }: MyDesignsModalProps) {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  const fetchDesigns = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const data = await userDesignService.getMyDesigns(accessToken);
      setDesigns(data);
    } catch (error: any) {
      message.error(error.message || "Lỗi tải danh sách thiết kế");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDesigns();
    }
  }, [open, accessToken]);

  const handleDelete = async (id: number) => {
    if (!accessToken) return;
    try {
      await userDesignService.deleteDesign(accessToken, id);
      message.success("Xóa thiết kế thành công!");
      fetchDesigns();
    } catch (error: any) {
      message.error(error.message || "Lỗi xóa thiết kế");
    }
  };

  return (
    <Modal
      title="Thiết kế của tôi"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      bodyStyle={{ maxHeight: "60vh", overflowY: "auto", padding: "20px 0" }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : designs.length === 0 ? (
        <Empty description="Bạn chưa có thiết kế nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {designs.map((design) => {
            // Sửa canvas chỉ khả dụng khi DRAFT (đang soạn) hoặc NEEDS_REVISION (admin yêu cầu sửa)
            const canEdit = design.status === "DRAFT" || design.status === "NEEDS_REVISION";
            // Xóa chỉ khả dụng khi còn là bản nháp riêng tư, chưa gửi admin
            const canDelete = design.status === "DRAFT";

            const actions = [];
            actions.push(
              <Button key="select" type="text" icon={<EditOutlined />} onClick={() => onSelectDesign(design)}>
                {canEdit ? "Sửa" : "Xem"}
              </Button>
            );
            if (canDelete) {
              actions.push(
                <Popconfirm
                  key="delete"
                  title="Xóa thiết kế?"
                  description="Hành động này không thể hoàn tác."
                  onConfirm={() => handleDelete(design.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>
              );
            }

            return (
              <Col xs={24} sm={12} md={8} key={design.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ background: "#f1f5f9", height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {design.printFileUrlFront || design.printFileUrlBack ? (
                        // Thiết kế đã từng được đặt hàng nên có ảnh in thật (Cloudinary) -
                        // ưu tiên hiển thị ảnh in thật thay vì bản xem trước canvas, tách
                        // đúng 2 nửa trước/sau nếu có cả 2 mặt.
                        <div style={{ display: "flex", width: "100%", height: "100%" }}>
                          {design.printFileUrlFront && (
                            <div
                              style={{
                                flex: 1, position: "relative", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                borderRight: design.printFileUrlBack ? "1px solid #e2e8f0" : "none",
                              }}
                            >
                              <img
                                alt={`${design.name} - mặt trước`}
                                src={design.printFileUrlFront}
                                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                              />
                              <span style={nhanMatStyle}>Trước</span>
                            </div>
                          )}
                          {design.printFileUrlBack && (
                            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <img
                                alt={`${design.name} - mặt sau`}
                                src={design.printFileUrlBack}
                                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                              />
                              <span style={nhanMatStyle}>Sau</span>
                            </div>
                          )}
                        </div>
                      ) : design.previewUrl ? (
                        <img
                          alt={design.name}
                          src={design.previewUrl}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <Text type="secondary">Chưa có ảnh xem trước</Text>
                      )}
                    </div>
                  }
                  actions={actions.length > 0 ? actions : undefined}
                >
                  <Meta
                    title={
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span>{design.name || "Chưa đặt tên"}</span>
                        <CustomerDesignStatusBadge status={design.status} />
                      </div>
                    }
                    description={
                      <div style={{ fontSize: "12px", marginTop: 4 }}>
                        <Text type="secondary">Cập nhật: {new Date(design.updatedAt).toLocaleDateString("vi-VN")}</Text>
                      </div>
                    }
                  />
                  {design.status === "NEEDS_REVISION" && design.adminNote && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "8px 10px",
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#9a3412",
                      }}
                    >
                      <strong>Admin yêu cầu chỉnh sửa:</strong> {design.adminNote}
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Modal>
  );
}
