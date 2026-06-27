"use client";

/**
 * AccountFormModal – Modal thêm mới hoặc sửa thông tin tài khoản khách hàng.
 *
 * Ràng buộc bảo mật:
 * - Admin không được nhập, xem hoặc thay đổi mật khẩu khách hàng.
 * - Backend tự sinh mật khẩu ban đầu và gửi đến email của khách hàng.
 * - Không có trường role (luôn là CUSTOMER).
 */

import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Alert,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type {
  TaiKhoanKhachHang,
  TaoTaiKhoanInput,
  CapNhatTaiKhoanInput,
  TrangThaiTaiKhoan,
} from "@/services/admin/accountService";

type Props = {
  open: boolean;
  mode: "them" | "sua";
  taiKhoan?: TaiKhoanKhachHang | null;
  dangTai: boolean;
  onClose: () => void;
  onSubmit: (values: TaoTaiKhoanInput | CapNhatTaiKhoanInput) => void;
};

export default function AccountFormModal({
  open,
  mode,
  taiKhoan,
  dangTai,
  onClose,
  onSubmit,
}: Props) {
  const [form] = Form.useForm();

  // Điền sẵn dữ liệu khi mở form sửa
  useEffect(() => {
    if (open) {
      if (mode === "sua" && taiKhoan) {
        form.setFieldsValue({
          fullName: taiKhoan.fullName,
          phone: taiKhoan.phone,
          status: taiKhoan.status,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, mode, taiKhoan, form]);

  const handleFinish = (values: Record<string, string>) => {
    if (mode === "them") {
      onSubmit({
        email: values.email,
        fullName: values.fullName,
        phone: values.phone,
      } as TaoTaiKhoanInput);
    } else {
      const payload: CapNhatTaiKhoanInput = {};
      if (values.fullName !== undefined) payload.fullName = values.fullName;
      if (values.phone !== undefined) payload.phone = values.phone;
      if (values.status !== undefined)
        payload.status = values.status as TrangThaiTaiKhoan;
      onSubmit(payload);
    }
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      title={mode === "them" ? "Thêm tài khoản mới" : "Chỉnh sửa tài khoản"}
      confirmLoading={dangTai}
      okText={mode === "them" ? "Tạo tài khoản" : "Lưu thay đổi"}
      cancelText="Hủy"
      cancelButtonProps={{ disabled: dangTai }}
      closable={!dangTai}
      maskClosable={!dangTai}
    >
      <div style={{ paddingTop: 16 }}>
        {mode === "them" && (
          <Alert
            title="Mật khẩu được gửi tự động"
            description="Hệ thống sẽ tự sinh mật khẩu và gửi đến email khách hàng sau khi bạn xác nhận tạo tài khoản."
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
            style={{
              marginBottom: 24,
              borderRadius: 10,
              border: "1px solid #bae6fd",
              background: "#f0f9ff",
              fontSize: 13,
            }}
          />
        )}

        {mode === "sua" && (
          <Alert
            title="Lưu ý bảo mật"
            description="Admin không được phép xem hoặc thay đổi mật khẩu khách hàng. Nếu khách quên mật khẩu, hướng dẫn họ dùng tính năng Quên mật khẩu."
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
            style={{
              marginBottom: 24,
              borderRadius: 10,
              border: "1px solid #bae6fd",
              background: "#f0f9ff",
              fontSize: 13,
            }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          style={{ gap: 4 }}
        >
          {/* Họ và tên */}
          <Form.Item
            name="fullName"
            label={<span style={labelStyle}>Họ và tên</span>}
            rules={[
              { required: true, message: "Vui lòng nhập họ và tên" },
              { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Nguyễn Văn A"
              style={{
                height: 40,
                borderRadius: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            />
          </Form.Item>

          {/* Số điện thoại */}
          <Form.Item
            name="phone"
            label={<span style={labelStyle}>Số điện thoại</span>}
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^[0-9+\s().-]{9,20}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />}
              placeholder="0901234567"
              style={{
                height: 40,
                borderRadius: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            />
          </Form.Item>

          {/* Email – chỉ hiển thị ở form thêm mới */}
          {mode === "them" && (
            <Form.Item
              name="email"
              label={<span style={labelStyle}>Email</span>}
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                placeholder="khachhang@email.com"
                style={{
                  height: 40,
                  borderRadius: 8,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              />
            </Form.Item>
          )}

          {/* Trạng thái – chỉ hiển thị ở form sửa */}
          {mode === "sua" && (
            <Form.Item
              name="status"
              label={<span style={labelStyle}>Trạng thái tài khoản</span>}
            >
              <Select
                style={{ height: 40 }}
                options={[
                  { value: "ACTIVE", label: "Đang hoạt động" },
                  { value: "INACTIVE", label: "Đã vô hiệu hóa" },
                  { value: "SUSPENDED", label: "Đình chỉ" },
                ]}
              />
            </Form.Item>
          )}
        </Form>

        {/* Email hiển thị (readonly) khi đang sửa */}
        {mode === "sua" && taiKhoan && (
          <div
            style={{
              marginTop: 4,
              padding: "10px 14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
              Email (không thể thay đổi)
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "#0f172a", marginTop: 2 }}>
              {taiKhoan.email}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
