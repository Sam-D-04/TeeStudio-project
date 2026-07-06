import React, { useEffect, useState } from "react";
import { Modal, Card, Col, Row, Typography, Spin, Empty, Button, message, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { userDesignService, SavedDesign } from "@/services/userDesignService";
import useAuthStore from "@/store/useAuthStore";

const { Text } = Typography;
const { Meta } = Card;

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
          {designs.map((design) => (
            <Col xs={24} sm={12} md={8} key={design.id}>
              <Card
                hoverable
                cover={
                  <div style={{ background: "#f1f5f9", height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {design.previewUrl ? (
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
                actions={[
                  <Button type="text" icon={<EditOutlined />} onClick={() => onSelectDesign(design)}>
                    Sửa
                  </Button>,
                  <Popconfirm
                    title="Xóa thiết kế?"
                    description="Hành động này không thể hoàn tác."
                    onConfirm={() => handleDelete(design.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <Meta
                  title={design.name || "Chưa đặt tên"}
                  description={
                    <div style={{ fontSize: "12px", marginTop: 4 }}>
                      <Text type="secondary">Cập nhật: {new Date(design.updatedAt).toLocaleDateString("vi-VN")}</Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Modal>
  );
}
