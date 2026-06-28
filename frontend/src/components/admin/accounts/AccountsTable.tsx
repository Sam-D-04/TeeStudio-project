"use client";

/**
 * AccountsTable – Bảng dữ liệu Ant Design hiển thị danh sách tài khoản khách hàng.
 *
 * Tính năng:
 * - Hiển thị đầy đủ thông tin: ID, họ tên, email, số điện thoại, trạng thái, ngày tạo.
 * - Cột hành động: Sửa thông tin, Vô hiệu hóa (soft-delete).
 * - Soft-delete không xóa bản ghi, chỉ đổi status sang INACTIVE.
 * - Admin KHÔNG được xem/sửa mật khẩu (ràng buộc bảo mật).
 */

import { useState } from "react";
import { Table, Input, Select, Button, Popconfirm, Space, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import type { TaiKhoanKhachHang, ThamSoLocTaiKhoan } from "@/services/admin/accountService";
import AccountStatusBadge from "./AccountStatusBadge";

type Props = {
  danhSach: TaiKhoanKhachHang[];
  tongSo: number;
  trang: number;
  soMoiTrang: number;
  dangTai: boolean;
  thamSoLoc: ThamSoLocTaiKhoan;
  onDoiTrang: (trang: number, soMoiTrang: number) => void;
  onDoiLoc: (thamSo: Partial<ThamSoLocTaiKhoan>) => void;
  onThem: () => void;
  onSua: (taiKhoan: TaiKhoanKhachHang) => void;
  onVoHieuHoa: (taiKhoan: TaiKhoanKhachHang) => void;
  onKhoiPhuc: (taiKhoan: TaiKhoanKhachHang) => void;
};

export default function AccountsTable({
  danhSach,
  tongSo,
  trang,
  soMoiTrang,
  dangTai,
  thamSoLoc,
  onDoiTrang,
  onDoiLoc,
  onThem,
  onSua,
  onVoHieuHoa,
  onKhoiPhuc,
}: Props) {
  const [tuKhoa, setTuKhoa] = useState(thamSoLoc.search ?? "");

  const handleTimKiem = () => {
    onDoiLoc({ search: tuKhoa, page: 1 });
  };

  const formatNgay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const columns: ColumnsType<TaiKhoanKhachHang> = [
    {
      title: <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>ID</span>,
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (id: number) => (
        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>#{id}</span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Họ và tên</span>
      ),
      dataIndex: "fullName",
      key: "fullName",
      render: (name: string, record: TaiKhoanKhachHang) => (
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: "#0f172a",
            }}
          >
            {name}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
            {record.email}
          </p>
        </div>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>
          Số điện thoại
        </span>
      ),
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => (
        <span style={{ fontSize: 13, color: "#475569" }}>{phone}</span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Trạng thái</span>
      ),
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status: TaiKhoanKhachHang["status"]) => (
        <AccountStatusBadge status={status} />
      ),
    },
    {
      title: (
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Ngày tạo</span>
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => (
        <span style={{ fontSize: 13, color: "#64748b" }}>{formatNgay(date)}</span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Hành động</span>
      ),
      key: "action",
      width: 130,
      align: "center",
      fixed: "right",
      render: (_: unknown, record: TaiKhoanKhachHang) => (
        <Space size={6}>
          {/* Nút Sửa */}
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onSua(record)}
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

          {/* Nút Vô hiệu hóa / Khôi phục */}
          {record.status === "ACTIVE" ? (
            <Popconfirm
              title="Vô hiệu hóa tài khoản"
              description={
                <span>
                  Tài khoản <strong>{record.fullName}</strong> sẽ bị vô hiệu hóa.
                  <br />
                  Khách hàng sẽ không thể đăng nhập cho đến khi được khôi phục.
                </span>
              }
              okText="Vô hiệu hóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => onVoHieuHoa(record)}
            >
              <Tooltip title="Vô hiệu hóa tài khoản">
                <Button
                  type="text"
                  icon={<StopOutlined />}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: "1px solid #fca5a5",
                    background: "#fff7f7",
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Khôi phục tài khoản"
              description={
                <span>
                  Khôi phục tài khoản <strong>{record.fullName}</strong> về trạng thái hoạt động?
                </span>
              }
              okText="Khôi phục"
              cancelText="Hủy"
              onConfirm={() => onKhoiPhuc(record)}
            >
              <Tooltip title="Khôi phục tài khoản">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: "1px solid #86efac",
                    background: "#f0fdf4",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
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
        {/* Ô tìm kiếm */}
        <Input
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
          onPressEnter={handleTimKiem}
          placeholder="Tìm theo tên, email, số điện thoại..."
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

        {/* Lọc theo trạng thái */}
        <Select
          value={thamSoLoc.status || "tat_ca"}
          onChange={(value) => onDoiLoc({ status: value, page: 1 })}
          options={[
            { value: "tat_ca", label: "Tất cả trạng thái" },
            { value: "ACTIVE", label: "Đang hoạt động" },
            { value: "INACTIVE", label: "Đã vô hiệu hóa" },
          ]}
          style={{ width: 190, height: 40 }}
        />

        {/* Nút làm mới */}
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setTuKhoa("");
            onDoiLoc({ search: "", status: "tat_ca", page: 1 });
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
          Đặt lại
        </Button>

        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={onThem}
          style={{
            height: 40,
            borderRadius: 8,
            background: "#0ea5e9",
            border: "none",
            fontWeight: 600,
            fontSize: 14,
            paddingInline: 20,
            boxShadow: "0 2px 8px rgba(14,165,233,0.25)",
          }}
        >
          Thêm tài khoản
        </Button>
      </div>

      {/* ── Bảng dữ liệu ──────────────────────────────────────── */}
      <Table<TaiKhoanKhachHang>
        columns={columns}
        dataSource={danhSach}
        rowKey="id"
        loading={dangTai}
        scroll={{ x: 800 }}
        pagination={{
          current: trang,
          pageSize: soMoiTrang,
          total: tongSo,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}–${range[1]} trong ${total} tài khoản`,
          onChange: onDoiTrang,
          style: { padding: "16px 24px", margin: 0 },
        }}
        style={{ fontSize: 14 }}
        rowClassName={() => "account-table-row"}
      />
    </div>
  );
}
