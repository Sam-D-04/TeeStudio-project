"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { App, Form, InputNumber, Modal } from "antd";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import * as promotionService from "@/services/admin/promotionService";

const inputStyle: React.CSSProperties = {
  height: 36,
  padding: "0 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 7,
  outline: "none",
};

type FormValues = { minQty: number; discountPercent: number };

function BulkPricingContent() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  const [form] = Form.useForm<FormValues>();

  const productsQuery = useQuery({
    queryKey: ["admin-promotions", "bulk-products"],
    queryFn: promotionService.laySanPhamGiaSoLuong,
  });
  const selectedProductId = productId ?? productsQuery.data?.[0]?.id ?? null;

  const tiersQuery = useQuery({
    queryKey: ["admin-promotions", "bulk-pricing", selectedProductId],
    queryFn: () => promotionService.layGiaSoLuong(selectedProductId!),
    enabled: selectedProductId !== null,
  });

  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-promotions", "bulk-pricing", selectedProductId] });
    queryClient.invalidateQueries({ queryKey: ["admin-promotions", "bulk-products"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        productId: selectedProductId!,
        minQty: values.minQty,
        discountPercent: values.discountPercent,
      };
      return dangSuaId
        ? promotionService.capNhatGiaSoLuong(dangSuaId, payload)
        : promotionService.taoGiaSoLuong(payload);
    },
    onSuccess: () => {
      message.success(dangSuaId ? "Đã cập nhật mức giá" : "Đã thêm mức giá");
      setModalOpen(false);
      lamMoi();
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: promotionService.xoaGiaSoLuong,
    onSuccess: () => {
      message.success("Đã xóa mức giá");
      lamMoi();
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const moModalThem = () => {
    setDangSuaId(null);
    form.resetFields();
    form.setFieldsValue({ minQty: 2 });
    setModalOpen(true);
  };

  const moModalSua = (tier: { id: number; tuSoLuong: number; phanTramGiam: number }) => {
    setDangSuaId(tier.id);
    form.setFieldsValue({ minQty: tier.tuSoLuong, discountPercent: tier.phanTramGiam });
    setModalOpen(true);
  };

  const danhSach = tiersQuery.data?.danhSach ?? [];

  return (
    <>
      {/* Card chính */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            backgroundColor: "#f8fafc",
          }}
        >
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Bảng giá theo số lượng của từng sản phẩm
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
              Hệ thống tự chọn mức giảm cao nhất có số lượng tối thiểu phù hợp.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={selectedProductId ?? ""}
              onChange={(event) => {
                setProductId(Number(event.target.value));
              }}
              style={{ ...inputStyle, minWidth: 240 }}
            >
              {productsQuery.data?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.ten}{product.dangHoatDong ? "" : " (đang ẩn)"}
                </option>
              ))}
            </select>
            <button
              onClick={moModalThem}
              disabled={!selectedProductId}
              style={{
                ...inputStyle,
                background: "#0ea5e9",
                color: "#fff",
                border: "none",
                cursor: selectedProductId ? "pointer" : "not-allowed",
              }}
            >
              <PlusOutlined /> Thêm mức giá
            </button>
          </div>
        </div>

        {/* Body */}
        {(productsQuery.isLoading || tiersQuery.isLoading) && (
          <div style={{ padding: 48, textAlign: "center", color: "#475569" }}>
            <LoadingOutlined /> Đang tải bảng giá...
          </div>
        )}
        {(productsQuery.isError || tiersQuery.isError) && (
          <div style={{ padding: 48, textAlign: "center", color: "#b91c1c" }}>
            Không thể tải bảng giá theo số lượng.
          </div>
        )}
        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data?.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
            Chưa có sản phẩm để thiết lập giá theo số lượng.
          </div>
        )}

        {!productsQuery.isLoading &&
          !tiersQuery.isLoading &&
          !productsQuery.isError &&
          !tiersQuery.isError &&
          Boolean(productsQuery.data?.length) && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Từ số lượng", "Đến số lượng", "Mức giảm", "Đơn giá sau giảm", "Thao tác"].map(
                    (title) => (
                      <th key={title} style={{ padding: "11px 16px", textAlign: "left", color: "#475569" }}>
                        {title}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {danhSach.map((tier) => (
                  <tr key={tier.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{tier.tuSoLuong}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {tier.denSoLuong ?? "Không giới hạn"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#0284c7", fontWeight: 700 }}>
                      -{tier.phanTramGiam}%
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {tier.donGiaSauGiam.toLocaleString("vi-VN")}đ
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        title="Chỉnh sửa"
                        onClick={() => moModalSua(tier)}
                        style={{ marginRight: 8, cursor: "pointer" }}
                      >
                        <EditOutlined />
                      </button>
                      <button
                        title="Xóa"
                        onClick={() => {
                          if (window.confirm("Bạn có chắc muốn xóa mức giá này?")) {
                            deleteMutation.mutate(tier.id);
                          }
                        }}
                        style={{ cursor: "pointer", color: "#b91c1c" }}
                      >
                        <DeleteOutlined />
                      </button>
                    </td>
                  </tr>
                ))}
                {danhSach.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                      Sản phẩm này chưa có mức giá theo số lượng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal thêm / sửa mức giá */}
      <Modal
        title={dangSuaId ? "Chỉnh sửa mức giá" : "Thêm mức giá mới"}
        open={modalOpen}
        onOk={() => form.submit()}
        onCancel={() => setModalOpen(false)}
        okText={dangSuaId ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        confirmLoading={saveMutation.isPending}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => saveMutation.mutate(values)}
          style={{ marginTop: 8 }}
        >
          <Form.Item
            label="Từ số lượng"
            name="minQty"
            extra="Số lượng tối thiểu để áp dụng mức giá này (≥ 2)"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng tối thiểu" },
              { type: "number", min: 2, message: "Số lượng tối thiểu phải ≥ 2" },
            ]}
          >
            <InputNumber min={2} style={{ width: "100%" }} placeholder="Ví dụ: 10" />
          </Form.Item>

          <Form.Item label="Đến số lượng">
            <span style={{ color: "#64748b", fontSize: 13 }}>
              Tự động xác định (dựa vào mức giá kế tiếp)
            </span>
          </Form.Item>

          <Form.Item
            label="Mức giảm (%)"
            name="discountPercent"
            rules={[
              { required: true, message: "Vui lòng nhập phần trăm giảm" },
              { type: "number", min: 0.01, max: 100, message: "Giá trị phải từ 0.01 đến 100" },
            ]}
          >
            <InputNumber min={0.01} max={100} step={0.01} style={{ width: "100%" }} placeholder="Ví dụ: 5" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default function BulkPricingTab() {
  return (
    <App>
      <BulkPricingContent />
    </App>
  );
}
