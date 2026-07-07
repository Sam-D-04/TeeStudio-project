"use client";

import { Form, Input, Modal, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as inventoryService from "@/services/admin/inventoryService";

type AddSupplierModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (supplier: inventoryService.NhaCungCap) => void;
};

type SupplierFormValues = {
  ten: string;
  soDienThoai?: string;
};

export default function AddSupplierModal({
  open,
  onClose,
  onCreated,
}: AddSupplierModalProps) {
  const [form] = Form.useForm<SupplierFormValues>();
  const [messageApi, messageContextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: inventoryService.taoNhaCungCap,
    onSuccess: (supplier) => {
      queryClient.setQueryData<inventoryService.NhaCungCap[]>(
        ["inventory", "suppliers"],
        (current = []) =>
          [...current.filter((item) => item.id !== supplier.id), supplier].sort(
            (a, b) => a.ten.localeCompare(b.ten, "vi")
          )
      );
      onCreated(supplier);
      messageApi.success("Đã thêm và chọn nhà cung cấp mới");
      onClose();
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể thêm nhà cung cấp. Vui lòng thử lại.";
      messageApi.error(msg);
    },
  });

  return (
    <>
      {messageContextHolder}
      <Modal
      open={open}
      title="Thêm nhà cung cấp"
      okText="Thêm nhà cung cấp"
      cancelText="Hủy"
      confirmLoading={mutation.isPending}
      closable={!mutation.isPending}
      mask={{ closable: !mutation.isPending }}
      onOk={() => form.submit()}
      onCancel={() => {
        if (!mutation.isPending) onClose();
      }}
      afterOpenChange={(isOpen) => {
        if (!isOpen) {
          form.resetFields();
          mutation.reset();
        }
      }}
      destroyOnHidden={false}
      width={460}
    >
      <Form<SupplierFormValues>
        form={form}
        layout="vertical"
        className="mt-5"
        onFinish={(values) => mutation.mutate(values)}
      >
        <Form.Item
          name="ten"
          label="Tên nhà cung cấp"
          rules={[
            { required: true, whitespace: true, message: "Vui lòng nhập tên nhà cung cấp" },
            { min: 2, message: "Tên nhà cung cấp phải có ít nhất 2 ký tự" },
            { max: 200, message: "Tên nhà cung cấp không được vượt quá 200 ký tự" },
          ]}
        >
          <Input autoFocus maxLength={200} placeholder="Ví dụ: Công ty Vải Xanh" />
        </Form.Item>

        <Form.Item
          name="soDienThoai"
          label="Số điện thoại (tùy chọn)"
          normalize={(value: string) => value.replace(/\D/g, "").slice(0, 10)}
          rules={[
            { pattern: /^\d{10}$/, message: "Số điện thoại phải gồm đúng 10 chữ số" },
          ]}
        >
          <Input inputMode="numeric" maxLength={10} placeholder="Ví dụ: 0901234567" />
        </Form.Item>
      </Form>
      </Modal>
    </>
  );
}
