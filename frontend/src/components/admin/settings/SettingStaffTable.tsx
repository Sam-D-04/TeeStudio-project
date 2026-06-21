"use client";

import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Form, Input, Modal, Select, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
  userService,
  type CreateStaffPayload,
  type UpdateStaffPayload,
} from "@/services/userService";
import type { AuthUser } from "@/types/auth";
import SettingRoleBadge, { type StaffRole } from "./SettingRoleBadge";
import SettingStatusBadge from "./SettingStatusBadge";

const roleOptions = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "WAREHOUSE", label: "Thủ kho" },
  { value: "PRODUCTION", label: "Thiết kế & in ấn" },
];

const initials = (name: string) => {
  const words = name.trim().split(/\s+/);
  return `${words[0]?.[0] || ""}${words.at(-1)?.[0] || ""}`.toUpperCase();
};

export default function SettingStaffTable() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [staff, setStaff] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStaff = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await userService.listStaff();
      setStaff(data.items);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể tải danh sách nhân sự."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: "WAREHOUSE" });
    setModalOpen(true);
  };

  const openEditModal = (member: AuthUser) => {
    setEditing(member);
    form.setFieldsValue({ role: member.role, status: member.status });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editing) {
        await userService.updateStaff(editing.id, values as UpdateStaffPayload);
        messageApi.success("Đã cập nhật quyền nhân sự.");
      } else {
        await userService.createStaff(values as CreateStaffPayload);
        messageApi.success("Đã tạo tài khoản nhân sự.");
      }
      setModalOpen(false);
      await loadStaff();
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) return;
      messageApi.error(getApiErrorMessage(error, "Không thể lưu tài khoản nhân sự."));
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = useMemo(
    () => staff.filter((member) => member.status === "ACTIVE").length,
    [staff],
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      {contextHolder}
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h3 className="text-[17px] font-bold text-on-surface">Danh sách nhân sự</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {activeCount}/{staff.length} tài khoản đang hoạt động
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex h-10 items-center gap-2 rounded-lg bg-[#0ea5e9] px-4 text-sm font-semibold text-white hover:bg-[#0284c7]"
        >
          <PlusOutlined />
          Thêm nhân sự
        </button>
      </div>

      {errorMessage ? (
        <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-border bg-[#f8fafc] text-xs font-semibold uppercase text-text-secondary">
            <tr>
              <th className="px-6 py-4">Họ tên</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-text-secondary">
                  Đang tải danh sách...
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-text-secondary">
                  Chưa có tài khoản nội bộ.
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className="hover:bg-[#f8fafc]/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9e6ff] text-xs font-semibold text-[#0284c7]">
                        {initials(member.fullName)}
                      </div>
                      <span className="font-semibold text-on-surface">{member.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{member.email}</td>
                  <td className="px-6 py-4">
                    <SettingRoleBadge role={member.role as StaffRole} />
                  </td>
                  <td className="px-6 py-4">
                    <SettingStatusBadge status={member.status} />
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {member.createdAt
                      ? new Date(member.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => openEditModal(member)}
                      className="p-1 text-text-muted hover:text-[#0ea5e9]"
                    >
                      <EditOutlined className="text-[20px]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editing ? "Cập nhật quyền nhân sự" : "Thêm tài khoản nhân sự"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        confirmLoading={submitting}
        okText={editing ? "Lưu thay đổi" : "Tạo tài khoản"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="pt-4">
          {!editing ? (
            <>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label="Mật khẩu tạm thời"
                rules={[
                  { required: true, min: 8 },
                  {
                    pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                    message: "Mật khẩu phải gồm chữ và số.",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          ) : null}
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select options={roleOptions} />
          </Form.Item>
          {editing ? (
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: "ACTIVE", label: "Hoạt động" },
                  { value: "INACTIVE", label: "Vô hiệu" },
                ]}
              />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}
