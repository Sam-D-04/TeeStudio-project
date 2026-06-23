import { AutoComplete, Input, Modal, Select, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import * as orderService from "@/services/admin/orderService";
import type { ChiTietDonHang } from "@/services/admin/orderService";

const ORDER_STATUS_OPTIONS = [
  { value: "cho_xac_nhan", label: "Chờ xác nhận" },
  { value: "da_xac_nhan", label: "Đã xác nhận" },
  { value: "dang_xu_ly_in", label: "Đang xử lý in" },
  { value: "cho_giao", label: "Chờ giao" },
  { value: "dang_giao", label: "Đang giao hàng" },
  { value: "hoan_tat", label: "Hoàn tất" },
];

const ALLOWED_NEXT_STATUS: Record<string, string[]> = {
  cho_xac_nhan: ["da_xac_nhan"],
  da_xac_nhan: ["dang_xu_ly_in"],
  dang_xu_ly_in: ["cho_giao"],
  cho_giao: ["dang_giao"],
  dang_giao: ["hoan_tat"],
  hoan_tat: [],
  da_huy: [],
};

function hasCustomDesignOrder(order?: ChiTietDonHang | null) {
  if (!order) return false;

  return Boolean(
    order.items?.some((item) => item.loai === "custom_design" || Boolean(item.designId)) ||
      order.sanPham?.loai === "custom_design" ||
      order.anhXemTruocThietKe
  );
}

function getAllowedNextStatuses(order?: ChiTietDonHang | null) {
  if (!order) return [];

  if (order.trangThai === "da_xac_nhan" && !hasCustomDesignOrder(order)) {
    return ["cho_giao"];
  }

  return ALLOWED_NEXT_STATUS[order.trangThai] ?? [];
}

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Đã xảy ra lỗi";
}

export default function UpdateOrderStatusModal({
  orderId,
  open,
  onClose,
}: {
  orderId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  
  const [newStatus, setNewStatus] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState<string | undefined>(undefined);
  const [trackingCode, setTrackingCode] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: () => orderService.layChiTietDonHang(orderId!),
    enabled: Boolean(orderId) && open,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { trangThai: string; shippingCarrier?: string; trackingCode?: string }) =>
      orderService.capNhatTrangThaiDonHang({
        id: orderId!,
        ...payload,
      }),
    onSuccess: async () => {
      setNewStatus("");
      setShippingCarrier(undefined);
      setTrackingCode("");
      messageApi.success("Cập nhật trạng thái đơn hàng thành công");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-order-detail", orderId],
        }),
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] }),
      ]);
      onClose();
    },
    onError: (mutationError) => {
      messageApi.error(getApiErrorMessage(mutationError));
    },
  });

  return (
    <>
      {messageContextHolder}
      {modalContextHolder}
      <Modal
        open={open}
        title="Cập nhật trạng thái đơn hàng"
        okText="Xác nhận"
        cancelText="Đóng"
        confirmLoading={updateStatusMutation.isPending || isLoading}
        okButtonProps={{ disabled: !newStatus || isLoading }}
        mask={{ closable: true }}
        onCancel={() => {
          setNewStatus("");
          setShippingCarrier(undefined);
          setTrackingCode("");
          onClose();
        }}
        onOk={() => {
          if (newStatus === "dang_giao") {
            if (!shippingCarrier) {
              messageApi.error("Vui lòng chọn hoặc nhập đơn vị vận chuyển");
              return;
            }
          }

          const performUpdate = () => {
            updateStatusMutation.mutate({
              trangThai: newStatus,
              shippingCarrier: newStatus === "dang_giao" ? shippingCarrier : undefined,
              trackingCode: newStatus === "dang_giao" ? trackingCode : undefined,
            });
          };

          if (newStatus) {
            const statusLabel = ORDER_STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || "";
            let confirmContent = "Hệ thống không cho phép lùi trạng thái sau khi đã cập nhật. Bạn có chắc chắn muốn chuyển sang trạng thái này?";

            if (newStatus === "dang_giao") {
              confirmContent = "Hệ thống không cho phép lùi trạng thái sau khi đã cập nhật. Bạn có chắc chắn đơn hàng này đã được bàn giao cho đơn vị vận chuyển?";
            } else if (newStatus === "hoan_tat") {
              confirmContent = "Hệ thống không cho phép lùi trạng thái sau khi đã cập nhật. Bạn có chắc chắn khách hàng đã nhận được hàng và thanh toán đủ?";
            }

            modal.confirm({
              title: `Xác nhận chuyển sang "${statusLabel}"?`,
              content: confirmContent,
              okText: "Đồng ý",
              cancelText: "Hủy",
              okButtonProps: { danger: true, type: "primary" },
              onOk: performUpdate,
            });
          }
        }}
      >
        {isLoading ? (
          <p className="mb-4 text-sm text-text-secondary">Đang tải thông tin đơn hàng...</p>
        ) : (
          <>
            <p className="mb-2 text-sm font-semibold text-text-main">Trạng thái mới</p>
            <Select
              value={newStatus || undefined}
              placeholder="Chọn trạng thái"
              className="w-full"
              options={ORDER_STATUS_OPTIONS.filter(
                (status) => getAllowedNextStatuses(order).includes(status.value)
              )}
              onChange={setNewStatus}
            />
            {newStatus === "dang_giao" && (
              <div className="mt-4 space-y-3 rounded-lg border border-border bg-surface-alt p-4">
                <div>
                  <p className="mb-1 text-sm font-semibold text-text-main">
                    Đơn vị vận chuyển <span className="text-red-500">*</span>
                  </p>
                  <AutoComplete
                    value={shippingCarrier}
                    options={[
                      { value: "GHTK" },
                      { value: "Viettel Post" },
                      { value: "J&T Express" },
                      { value: "Ahamove" },
                      { value: "Lalamove" },
                      { value: "VNPost" },
                    ]}
                    placeholder="Chọn hoặc nhập đơn vị vận chuyển"
                    className="w-full"
                    onChange={setShippingCarrier}
                  />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-text-main">Mã vận đơn</p>
                  <Input
                    value={trackingCode}
                    placeholder="Nhập mã vận đơn (nếu có)"
                    onChange={(e) => setTrackingCode(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
