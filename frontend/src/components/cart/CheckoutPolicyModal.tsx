"use client";

import React from "react";
import { Modal, Typography } from "antd";

const { Text, Paragraph } = Typography;

interface CheckoutPolicyModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function CheckoutPolicyModal({ open, onCancel, onConfirm }: CheckoutPolicyModalProps) {
  return (
    <Modal
      title={
        <span style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
          Quy định về hình ảnh in ấn & Kiểm duyệt
        </span>
      }
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="Tôi đồng ý & Tiếp tục thanh toán"
      cancelText="Hủy bỏ"
      centered
      width={500}
      okButtonProps={{
        style: {
          background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
          fontWeight: 600,
          borderRadius: 8,
          border: "none",
        }
      }}
      cancelButtonProps={{
        style: {
          fontWeight: 500,
          borderRadius: 8,
        }
      }}
    >
      <div style={{ marginTop: 16 }}>
        <Paragraph style={{ fontSize: 15, color: "#334155" }}>
          Chào bạn, để đảm bảo chất lượng và phù hợp với quy chuẩn cộng đồng, TeeStudio có một số quy định sau:
        </Paragraph>
        <ul style={{ paddingLeft: 20, color: "#334155", fontSize: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <li>
            <Text strong>Hình ảnh không vi phạm:</Text> Không chứa nội dung phản cảm, bạo lực, hoặc vi phạm pháp luật.
          </li>
          <li>
            <Text strong>Kiểm duyệt trước khi in:</Text> Các thiết kế của bạn sẽ được Admin duyệt trước khi tiến hành đưa đi in để đảm bảo chất lượng thành phẩm.
          </li>
          <li>
            <Text strong>Chỉnh sửa nếu không đạt:</Text> Nếu thiết kế không được duyệt, chúng tôi sẽ gửi email thông báo để bạn có thể chỉnh sửa lại.
          </li>
        </ul>
        <Paragraph style={{ marginBottom: 0, marginTop: 16, fontSize: 15, color: "#0f172a", fontWeight: 500 }}>
          Vui lòng xác nhận bạn đã đọc và đồng ý với các quy định trên để tiến hành thanh toán.
        </Paragraph>
      </div>
    </Modal>
  );
}
