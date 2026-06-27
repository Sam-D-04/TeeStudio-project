"use client";

import { EditOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Form, Input, Modal, Select, message, Table, Button, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
  userService,
  type CreateStaffPayload,
  type UpdateStaffPayload,
  type StaffListParams,
} from "@/services/userService";
import type { AuthUser } from "@/types/auth";
import AccountRoleBadge, { type StaffRole } from "./AccountRoleBadge";
import AccountStaffStatusBadge from "./AccountStaffStatusBadge";

const roleOptions = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "WAREHOUSE", label: "Thủ kho" },
  { value: "PRODUCTION", label: "Thiết kế & in ấn" },
];

const initials = (name: string) => {
  const words = name.trim().split(/\s+/);
  return `${words[0]?.[0] || ""}${words.at(-1)?.[0] || ""}`.toUpperCase();
};

export default function AccountStaffTable() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [thamSoLoc, setThamSoLoc] = useState<StaffListParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });
  const [tuKhoa, setTuKhoa] = useState("");

  const staffQueryKey = ["admin", "accounts", "staff", thamSoLoc];

  const { data, error, isFetching } = useQuery({
    queryKey: staffQueryKey,
    queryFn: () => userService.listStaff(thamSoLoc),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const staff = useMemo(() => data?.items ?? [], [data?.items]);
  const tongSo = data?.total ?? 0;
  const activeCount = useMemo(
    () => staff.filter((member) => member.status === "ACTIVE").length,
    [staff]
  );

  const saveStaffMutation = useMutation({
    mutationFn: async (values: CreateStaffPayload | UpdateStaffPayload) => {
      if (editing) {
        return userService.updateStaff(editing.id, values as UpdateStaffPayload);
      }
      return userService.createStaff(values as CreateStaffPayload);
    },
    onSuccess: async () => {
      messageApi.success(
        editing
          ? "Đã cập nhật quyền nhân sự."
          : "Đã tạo tài khoản và gửi mật khẩu đến email nhân sự."
      );
      setModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "accounts", "staff"] });
    },
    onError: (error) => {
      messageApi.error(getApiErrorMessage(error, "Không thể lưu tài khoản nhân sự."));
    },
  });

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
      saveStaffMutation.mutate(values as CreateStaffPayload | UpdateStaffPayload);
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) return;
      messageApi.error(getApiErrorMessage(error, "Không thể lưu tài khoản nhân sự."));
    }
  };

  const handleTimKiem = () => {
    setThamSoLoc((prev) => ({ ...prev, search: tuKhoa, page: 1 }));
  };

  const errorMessage = error
    ? getApiErrorMessage(error, "Không thể tải danh sách nhân sự.")
    : "";

  const columns: ColumnsType<AuthUser> = [
    {
      title: <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Họ tên</span>,
      dataIndex: "fullName",
      key: "fullName",
      render: (name: string) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9e6ff] text-xs font-semibold text-[#0284c7]">
            {initials(name)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
              {name}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Email</span>,
      dataIndex: "email",
      key: "email",
      render: (email: string) => <span style={{ color: "#475569" }}>{email}</span>,
    },
    {
      title: <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Vai trò</span>,
      dataIndex: "role",
      key: "role",
      render: (role: string) => <AccountRoleBadge role={role as StaffRole} />,
    },
    {
      title: <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status: AuthUser["status"]) => (
        <AccountStaffStatusBadge status={status} />
      ),
    },
    {
      title: <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Ngày tạo</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => {
        if (!date) return "-";
        const d = new Date(date);
        return (
          <span style={{ fontSize: 13, color: "#64748b" }}>
            {d.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      title: <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Thao tác</span>,
      key: "action",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_: unknown, record: AuthUser) => (
        <Tooltip title="Cập nhật quyền">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[17px] font-bold text-on-surface">Danh sách nhân sự</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {activeCount}/{tongSo} tài khoản đang hoạt động trên trang này
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
        <div className="rounded-lg border border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        {/* ── Thanh bộ lọc ──────────────────────────────────────── */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Input
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            onPressEnter={handleTimKiem}
            placeholder="Tìm theo tên, email..."
            prefix={<SearchOutlined style={{ color: "#94a3b8", fontSize: 13 }} />}
            suffix={
              <Button
                type="text"
                size="small"
                onClick={handleTimKiem}
                style={{
                  color: "#0ea5e9",
                  fontWeight: 600,
                  fontSize: 12,
                  padding: "0 4px",
                }}
              >
                Tìm
              </Button>
            }
            style={{
              width: 280,
              height: 40,
              borderRadius: 10,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: 14,
            }}
          />

          <Select
            value={thamSoLoc.status || "tat_ca"}
            onChange={(value) =>
              setThamSoLoc((prev) => ({
                ...prev,
                status: value === "tat_ca" ? "" : value,
                page: 1,
              }))
            }
            options={[
              { value: "tat_ca", label: "Tất cả trạng thái" },
              { value: "ACTIVE", label: "Đang hoạt động" },
              { value: "INACTIVE", label: "Đã vô hiệu hóa" },
            ]}
            style={{ width: 190, height: 40 }}
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setTuKhoa("");
              setThamSoLoc({ page: 1, limit: 20, search: "", status: "" });
            }}
            style={{
              height: 40,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#f1f5f9",
              color: "#475569",
              fontWeight: 500,
            }}
          >
            Làm mới
          </Button>
        </div>

        {/* ── Bảng dữ liệu ──────────────────────────────────────── */}
        <Table<AuthUser>
          columns={columns}
          dataSource={staff}
          rowKey="id"
          loading={isFetching}
          scroll={{ x: 800 }}
          pagination={{
            current: thamSoLoc.page,
            pageSize: thamSoLoc.limit,
            total: tongSo,
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} trong ${total} nhân sự`,
            onChange: (page, limit) =>
              setThamSoLoc((prev) => ({ ...prev, page, limit })),
            style: { padding: "16px 24px", margin: 0 },
          }}
          style={{ fontSize: 14 }}
          rowClassName={() => "account-table-row"}
        />
      </div>

      <Modal
        title={editing ? "Cập nhật quyền nhân sự" : "Thêm tài khoản nhân sự"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        confirmLoading={saveStaffMutation.isPending}
        okText={editing ? "Lưu thay đổi" : "Tạo tài khoản"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="pt-4">
          {!editing ? (
            <Alert
              title="Hệ thống sẽ tự sinh mật khẩu và gửi đến email nhân sự."
              type="info"
              showIcon
              className="mb-4"
            />
          ) : null}
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
