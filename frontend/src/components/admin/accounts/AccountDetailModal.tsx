"use client";

import { Modal, Descriptions, Card, Spin, Typography, Empty } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  layChiTietTaiKhoanKhachHang,
} from "@/services/admin/accountService";
import AccountStatusBadge from "./AccountStatusBadge";
import { EnvironmentOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

type Props = {
  open: boolean;
  customerId: number | null;
  onClose: () => void;
};

export default function AccountDetailModal({ open, customerId, onClose }: Props) {
  const { data, isFetching } = useQuery({
    queryKey: ["admin", "accounts", "customerDetail", customerId],
    queryFn: () => (customerId ? layChiTietTaiKhoanKhachHang(customerId) : Promise.reject("No ID")),
    enabled: !!customerId && open,
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<span className="text-lg font-bold">Chi tiết tài khoản khách hàng</span>}
      footer={null}
      width={700}
      destroyOnHidden
    >
      <Spin spinning={isFetching}>
        {data ? (
          <div className="flex flex-col gap-6 mt-4">
            <Descriptions bordered column={2} size="small" className="bg-white">
              <Descriptions.Item label="Họ tên">
                <Text strong>{data.fullName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{data.phone}</Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>{data.email}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <AccountStatusBadge status={data.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(data.createdAt).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h4 className="text-[15px] font-bold text-on-surface mb-3">
                Địa chỉ mặc định
              </h4>
              {data.addresses && data.addresses.length > 0 ? (
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                  {data.addresses.map((addr) => (
                    <Card key={addr.id} size="small" className="w-full bg-slate-50 border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <UserOutlined className="text-gray-500" />
                        <Text strong className="text-[14px]">{addr.recipientName}</Text>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <PhoneOutlined className="text-gray-500" />
                        <Text>{addr.phone}</Text>
                      </div>
                      <div className="flex items-start gap-2">
                        <EnvironmentOutlined className="text-gray-500 mt-1" />
                        <Text className="text-gray-600">
                          {addr.addressLine}, {addr.ward}, {addr.district}, {addr.city}
                        </Text>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty description="Khách hàng chưa lưu địa chỉ nào" className="my-4" />
              )}
            </div>
          </div>
        ) : null}
      </Spin>
    </Modal>
  );
}
