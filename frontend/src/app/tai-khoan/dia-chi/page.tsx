"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Tag,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  addressService,
  type AddressFormPayload,
  type UserAddress,
} from "@/services/addressService";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

/* ── Dữ liệu tỉnh/thành – phường/xã (VN, 2 cấp sau sáp nhập hành chính) ──
   Giống hệt logic ở trang checkout, dùng chung file tĩnh /data/vn-address.json */
interface WardData {
  Code: string;
  Name: string;
  ProvinceCode: string;
}
interface ProvinceData {
  Code: string;
  Name: string;
  Wards: WardData[];
}

function stripDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

interface AddressFormValues {
  recipientName: string;
  phone: string;
  provinceCode: string;
  wardCode: string;
  addressDetail: string;
  isDefault: boolean;
}

export default function DiaChiPage() {
  const [form] = Form.useForm<AddressFormValues>();
  const provinceCode = Form.useWatch("provinceCode", form);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAddresses = () => {
    setLoading(true);
    addressService
      .list()
      .then(setAddresses)
      .catch((err) => message.error(getApiErrorMessage(err, "Không tải được địa chỉ")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
    fetch("/data/vn-address.json")
      .then((res) => res.json())
      .then((data: ProvinceData[]) => setProvinces(data))
      .catch(() => message.error("Không tải được danh sách tỉnh/thành, phường/xã"))
      .finally(() => setProvincesLoading(false));
  }, []);

  const wardsForProvince = useMemo(() => {
    return provinces.find((p) => p.Code === provinceCode)?.Wards ?? [];
  }, [provinces, provinceCode]);

  const openCreateModal = () => {
    setEditingAddress(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (address: UserAddress) => {
    setEditingAddress(address);
    // Dữ liệu cũ chỉ lưu tên tỉnh/phường (không lưu mã) — dò ngược lại mã từ
    // tên để điền sẵn 2 select box. Nếu không khớp (địa chỉ nhập tay đời cũ)
    // thì để trống, khách chọn lại.
    const matchedProvince = provinces.find((p) => p.Name === address.city);
    const matchedWard = matchedProvince?.Wards.find((w) => w.Name === address.ward);
    form.setFieldsValue({
      recipientName: address.recipientName,
      phone: address.phone,
      provinceCode: matchedProvince?.Code,
      wardCode: matchedWard?.Code,
      addressDetail: address.addressLine,
      isDefault: address.isDefault,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: AddressFormValues) => {
    const province = provinces.find((p) => p.Code === values.provinceCode);
    const ward = province?.Wards.find((w) => w.Code === values.wardCode);
    const payload: AddressFormPayload = {
      recipientName: values.recipientName,
      phone: values.phone,
      addressLine: values.addressDetail,
      city: province?.Name || "",
      ward: ward?.Name || "",
      isDefault: values.isDefault,
    };

    setSubmitting(true);
    try {
      if (editingAddress) {
        await addressService.update(editingAddress.id, payload);
        message.success("Cập nhật địa chỉ thành công");
      } else {
        await addressService.create(payload);
        message.success("Thêm địa chỉ thành công");
      }
      setModalOpen(false);
      loadAddresses();
    } catch (err) {
      message.error(getApiErrorMessage(err, "Lưu địa chỉ thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await addressService.remove(id);
      message.success("Đã xoá địa chỉ");
      loadAddresses();
    } catch (err) {
      message.error(getApiErrorMessage(err, "Xoá địa chỉ thất bại"));
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefault(id);
      message.success("Đã đặt làm địa chỉ mặc định");
      loadAddresses();
    } catch (err) {
      message.error(getApiErrorMessage(err, "Không đặt được làm địa chỉ mặc định"));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
          Địa chỉ
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
          Quản lý các địa chỉ giao hàng của bạn.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          className="max-sm:grid-cols-1"
        >
          {addresses.map((address) => (
            <div
              key={address.id}
              style={{
                position: "relative",
                border: address.isDefault ? "1.5px solid #0ea5e9" : "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                background: "#fff",
              }}
            >
              {address.isDefault && (
                <Tag
                  color="blue"
                  style={{ position: "absolute", top: -10, right: 12, fontWeight: 600 }}
                >
                  Mặc định
                </Tag>
              )}
              <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                {address.recipientName}
              </p>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#475569" }}>{address.phone}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                {[address.addressLine, address.ward, address.district, address.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  type="button"
                  onClick={() => openEditModal(address)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0ea5e9",
                    fontFamily: "inherit",
                  }}
                >
                  Sửa
                </button>
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => void handleSetDefault(address.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#475569",
                      fontFamily: "inherit",
                    }}
                  >
                    Đặt làm mặc định
                  </button>
                )}
                <Popconfirm
                  title="Xoá địa chỉ này?"
                  okText="Xoá"
                  cancelText="Huỷ"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => void handleDelete(address.id)}
                >
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#dc2626",
                      fontFamily: "inherit",
                      marginLeft: "auto",
                    }}
                  >
                    Xoá
                  </button>
                </Popconfirm>
              </div>
            </div>
          ))}

          {/* ── Thẻ thêm địa chỉ mới ── */}
          <button
            type="button"
            onClick={openCreateModal}
            style={{
              minHeight: 140,
              border: "1.5px dashed #cbd5e1",
              borderRadius: 12,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#94a3b8",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 16px rgba(0,0,0,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#0ea5e9";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#0ea5e9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "none";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#cbd5e1";
            }}
          >
            <PlusOutlined style={{ fontSize: 24 }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {addresses.length === 0 ? "Thêm địa chỉ đầu tiên của bạn" : "Thêm địa chỉ mới"}
            </span>
          </button>
        </div>
      )}

      {/* ── Modal thêm/sửa địa chỉ ── */}
      <Modal
        title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Lưu địa chỉ"
        cancelText="Huỷ"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(v) => void handleSubmit(v)}
          initialValues={{ isDefault: false }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <Form.Item
              name="recipientName"
              label="Tên người nhận"
              rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
            >
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^(0|\+84)[0-9]{8,9}$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input placeholder="0901 234 567" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <Form.Item
              name="provinceCode"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
            >
              <Select
                showSearch
                loading={provincesLoading}
                placeholder="Tìm tỉnh/thành phố..."
                options={provinces.map((p) => ({ value: p.Code, label: p.Name }))}
                filterOption={(input, option) =>
                  stripDiacritics(option?.label ?? "").includes(stripDiacritics(input))
                }
                onChange={() => form.setFieldValue("wardCode", undefined)}
              />
            </Form.Item>

            <Form.Item
              name="wardCode"
              label="Phường/Xã"
              rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
            >
              <Select
                showSearch
                disabled={!provinceCode}
                placeholder={provinceCode ? "Tìm phường/xã..." : "Chọn tỉnh/thành phố trước"}
                options={wardsForProvince.map((w) => ({ value: w.Code, label: w.Name }))}
                filterOption={(input, option) =>
                  stripDiacritics(option?.label ?? "").includes(stripDiacritics(input))
                }
              />
            </Form.Item>
          </div>

          <Form.Item
            name="addressDetail"
            label="Số nhà, tên đường"
            rules={[{ required: true, message: "Vui lòng nhập số nhà, tên đường" }]}
          >
            <Input placeholder="Vd: 12 Nguyễn Trãi" />
          </Form.Item>

          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox disabled={Boolean(editingAddress?.isDefault)}>
              <span style={{ fontSize: 13, color: "#475569" }}>
                {editingAddress?.isDefault
                  ? "Đây là địa chỉ mặc định"
                  : "Đặt làm địa chỉ mặc định"}
              </span>
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
