"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, InputNumber, Modal, Space } from "antd";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import * as promotionService from "@/services/admin/promotionService";

function PrintSurchargeContent() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  // State cho modal chỉnh sửa
  const [editItem, setEditItem] = useState<promotionService.PhuPhiBaoGia | null>(null);
  const [giaTri, setGiaTri] = useState<number>(0);

  // State cho modal xác nhận tắt/bật
  const [toggleItem, setToggleItem] = useState<promotionService.PhuPhiBaoGia | null>(null);

  // State cho modal thêm phương pháp in
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm] = Form.useForm();

  const query = useQuery({
    queryKey: ["admin-promotions", "surcharges"],
    queryFn: promotionService.layDanhSachPhuPhi,
  });

  const mutation = useMutation({
    mutationFn: ({
      item,
      extraCost,
      isActive,
    }: {
      item: promotionService.PhuPhiBaoGia;
      extraCost: number;
      isActive: boolean;
    }) =>
      promotionService.capNhatPhuPhi(item.id, {
        loai: item.loai,
        extraCost,
        isActive,
      }),
    onSuccess: () => {
      message.success("Đã cập nhật phụ phí");
      setEditItem(null);
      setToggleItem(null);
      queryClient.invalidateQueries({ queryKey: ["admin-promotions", "surcharges"] });
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const addMutation = useMutation({
    mutationFn: promotionService.taoPhuongPhapIn,
    onSuccess: () => {
      message.success("Đã thêm phương pháp in mới");
      setShowAddModal(false);
      addForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["admin-promotions", "surcharges"] });
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const renderGroup = (
    title: string,
    items: promotionService.PhuPhiBaoGia[],
    showAdd?: boolean,
  ) => (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h4 style={{ margin: 0, fontSize: 13, color: "#475569" }}>{title}</h4>
        {showAdd && (
          <Button
            size="small"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddModal(true)}
          >
            Thêm
          </Button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <div
            key={`${item.loai}-${item.id}`}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              opacity: item.dangBat ? 1 : 0.65,
              background: item.dangBat ? "#fff" : "#f8fafc",
            }}
          >
            {/* Tên & trạng thái */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 14, color: "#0f172a" }}>{item.ten}</strong>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: item.dangBat ? "#dcfce7" : "#e2e8f0",
                    color: item.dangBat ? "#059669" : "#64748b",
                  }}
                >
                  {item.dangBat ? "ĐANG ÁP DỤNG" : "ĐÃ TẮT"}
                </span>
              </div>
            </div>

            {/* Giá trị & hành động */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <strong style={{ color: "#0284c7" }}>
                +{item.giaTri.toLocaleString("vi-VN")}đ/áo
              </strong>

              <Button
                size="small"
                onClick={() => {
                  setEditItem(item);
                  setGiaTri(item.giaTri);
                }}
              >
                Chỉnh sửa
              </Button>

              <Button
                size="small"
                danger={item.dangBat}
                onClick={() => setToggleItem(item)}
                loading={mutation.isPending && toggleItem?.id === item.id}
              >
                {item.dangBat ? "Tắt phụ phí" : "Bật phụ phí"}
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
            Chưa có dữ liệu cấu hình.
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
        <h3 style={{ margin: 0, fontSize: 15, color: "#0f172a" }}>Phụ phí in &amp; thiết kế</h3>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
          Quản lý trực tiếp phụ phí của vị trí in và phương pháp in đang dùng trong Design Studio.
        </p>
      </div>

      {/* Nội dung */}
      {query.isLoading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#475569" }}>
          <LoadingOutlined /> Đang tải phụ phí...
        </div>
      ) : query.isError ? (
        <div style={{ padding: 48, textAlign: "center", color: "#b91c1c" }}>
          {getApiErrorMessage(query.error, "Không thể tải danh sách phụ phí")}
        </div>
      ) : (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 24 }}>
          {renderGroup("Vị trí in", query.data?.viTriIn ?? [])}
          {renderGroup("Phương pháp in", query.data?.phuongPhapIn ?? [], true)}
        </div>
      )}

      {/* Modal chỉnh sửa phụ phí */}
      <Modal
        title={`Chỉnh sửa phụ phí: ${editItem?.ten}`}
        open={!!editItem}
        onOk={() => {
          if (!editItem) return;
          mutation.mutate({ item: editItem, extraCost: giaTri, isActive: editItem.dangBat });
        }}
        onCancel={() => setEditItem(null)}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={mutation.isPending}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
          <span>Giá trị phụ phí:</span>
          <Space.Compact>
            <InputNumber
              min={0}
              value={giaTri}
              onChange={(val) => setGiaTri(val ?? 0)}
              style={{ width: 150 }}
            />
            <Input style={{ width: 80 }} value="VNĐ/áo" readOnly />
          </Space.Compact>
        </div>
      </Modal>

      {/* Modal xác nhận tắt/bật phụ phí */}
      <Modal
        title={toggleItem?.dangBat ? "Xác nhận tắt phụ phí" : "Xác nhận bật phụ phí"}
        open={!!toggleItem}
        onOk={() => {
          if (!toggleItem) return;
          mutation.mutate({
            item: toggleItem,
            extraCost: toggleItem.giaTri,
            isActive: !toggleItem.dangBat,
          });
        }}
        onCancel={() => setToggleItem(null)}
        okText={toggleItem?.dangBat ? "Tắt" : "Bật"}
        okButtonProps={{ danger: toggleItem?.dangBat }}
        cancelText="Hủy"
        confirmLoading={mutation.isPending}
      >
        <p>
          Bạn có chắc muốn{" "}
          <strong>{toggleItem?.dangBat ? "tắt" : "bật"}</strong> phụ phí{" "}
          <strong>{toggleItem?.ten}</strong> không?
        </p>
      </Modal>

      {/* Modal thêm phương pháp in */}
      <Modal
        title="Thêm phương pháp in"
        open={showAddModal}
        onOk={() => addForm.submit()}
        onCancel={() => {
          setShowAddModal(false);
          addForm.resetFields();
        }}
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={addMutation.isPending}
      >
        <Form
          form={addForm}
          layout="vertical"
          style={{ marginTop: 12 }}
          onFinish={(values) =>
            addMutation.mutate({
              name: values.name,
              code: values.code,
              extraCost: values.extraCost ?? 0,
            })
          }
        >
          <Form.Item
            label="Tên phương pháp in"
            name="name"
            rules={[{ required: true, message: "Nhập tên phương pháp in" }]}
          >
            <Input placeholder="Ví dụ: In Thêu" maxLength={100} />
          </Form.Item>
          <Form.Item
            label="Mã (code)"
            name="code"
            rules={[
              { required: true, message: "Nhập mã phương pháp in" },
              { pattern: /^[A-Za-z0-9_]+$/, message: "Chỉ dùng chữ, số và dấu _" },
            ]}
          >
            <Input
              placeholder="Ví dụ: IN_THEU"
              maxLength={50}
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>
          <Form.Item
            label="Phụ phí (VNĐ/áo)"
            name="extraCost"
            initialValue={0}
            rules={[{ required: true, message: "Nhập giá trị phụ phí" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function PrintSurchargeTab() {
  return (
    <App>
      <PrintSurchargeContent />
    </App>
  );
}
