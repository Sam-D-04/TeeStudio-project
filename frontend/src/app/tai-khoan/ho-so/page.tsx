"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Tooltip, message } from "antd";
import { LockOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import useAuthStore from "@/store/useAuthStore";
import { authService } from "@/services/authService";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

interface ProfileFormValues {
  fullName: string;
  phone: string;
}

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function HoSoPage() {
  const router = useRouter();
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSectionOpen, setPasswordSectionOpen] = useState(false);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({ fullName: user.fullName, phone: user.phone });
    }
  }, [user, profileForm]);

  if (!user) return null;

  const initial = user.fullName?.trim().charAt(0).toUpperCase() || "?";

  const handleSaveProfile = async (values: ProfileFormValues) => {
    setSavingProfile(true);
    try {
      const updated = await authService.updateProfile(values);
      updateUser(updated);
      message.success("Cập nhật thông tin thành công");
    } catch (err) {
      message.error(getApiErrorMessage(err, "Cập nhật thông tin thất bại"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (values: PasswordFormValues) => {
    setChangingPassword(true);
    try {
      await authService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công, vui lòng đăng nhập lại");
      clearSession();
      router.replace("/dang-nhap");
    } catch (err) {
      message.error(getApiErrorMessage(err, "Đổi mật khẩu thất bại"));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
          Thông tin cá nhân
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
          Cập nhật thông tin hồ sơ và bảo mật tài khoản của bạn.
        </p>
      </div>

      {/* ── Avatar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 28,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
            {user.fullName}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#94a3b8" }}>{user.email}</p>
        </div>
      </div>

      {/* ── Form thông tin ── */}
      <Form
        form={profileForm}
        layout="vertical"
        requiredMark={false}
        onFinish={(v) => void handleSaveProfile(v)}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}
          className="max-sm:grid-cols-1"
        >
          <Form.Item
            name="fullName"
            label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Họ và tên</span>}
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input style={{ height: 40, borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Số điện thoại</span>}
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^(0|\+84)[0-9]{8,9}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input style={{ height: 40, borderRadius: 8 }} />
          </Form.Item>
        </div>

        <Form.Item
          label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Email</span>}
        >
          {/* Tooltip bọc quanh 1 span thay vì đặt thẳng lên Input disabled - input
              disabled không nhận sự kiện hover nên đặt trực tiếp sẽ không bao
              giờ hiện được tooltip. */}
          <Tooltip title="Email dùng để đăng nhập không thể thay đổi">
            <span style={{ display: "block" }}>
              <Input
                value={user.email}
                disabled
                style={{ height: 40, borderRadius: 8, background: "#f1f5f9", color: "#64748b" }}
              />
            </span>
          </Tooltip>
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={savingProfile}
            style={{ height: 40, borderRadius: 8, fontWeight: 700, paddingInline: 24 }}
          >
            Lưu thay đổi
          </Button>
        </div>
      </Form>

      {/* ── Đổi mật khẩu ── */}
      <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
        <button
          type="button"
          onClick={() => setPasswordSectionOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: 15,
            fontWeight: 700,
            color: "#0f172a",
            fontFamily: "inherit",
          }}
        >
          <LockOutlined style={{ color: "#0ea5e9" }} />
          Đổi mật khẩu
          {passwordSectionOpen ? <UpOutlined style={{ fontSize: 11 }} /> : <DownOutlined style={{ fontSize: 11 }} />}
        </button>

        {passwordSectionOpen && (
          <Form
            form={passwordForm}
            layout="vertical"
            requiredMark={false}
            onFinish={(v) => void handleChangePassword(v)}
            style={{ marginTop: 16, maxWidth: 420 }}
          >
            <Form.Item
              name="oldPassword"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Mật khẩu hiện tại</span>}
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
            >
              <Input.Password style={{ height: 40, borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Mật khẩu mới</span>}
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                {
                  pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                  message: "Mật khẩu phải gồm cả chữ và số",
                },
              ]}
            >
              <Input.Password style={{ height: 40, borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Nhập lại mật khẩu mới</span>}
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng nhập lại mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu nhập lại không khớp"));
                  },
                }),
              ]}
            >
              <Input.Password style={{ height: 40, borderRadius: 8 }} />
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={changingPassword}
                style={{ height: 40, borderRadius: 8, fontWeight: 700, paddingInline: 24 }}
              >
                Lưu mật khẩu mới
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
}
