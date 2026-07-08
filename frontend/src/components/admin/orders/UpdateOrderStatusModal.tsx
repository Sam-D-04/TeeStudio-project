import { EyeOutlined } from "@ant-design/icons";
import { Alert, AutoComplete, Button, Input, Modal, Select, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAxiosError } from "axios";
import { isOrderStatusLockedByPayment } from "@/lib/paymentDisplay";
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

function areAllCustomItemsPrinted(order?: ChiTietDonHang | null) {
  const customItems = order?.items?.filter((item) => Boolean(item.designId)) ?? [];
  return customItems.length === 0 || customItems.every((item) =>
    ["PRINTED", "PACKED"].includes(item.productionStatus || "")
  );
}

function getProductionStatusBlockReason(order?: ChiTietDonHang | null) {
  if (!order || order.trangThai !== "dang_xu_ly_in") return null;

  const itemsChuaInXong = order.items?.filter(
    (item) => Boolean(item.designId) && !["PRINTED", "PACKED"].includes(item.productionStatus || "")
  ) ?? [];
  if (itemsChuaInXong.length === 0) return null;

  const soAoDangIn = itemsChuaInXong
    .filter((item) => item.productionStatus === "PRINTING")
    .reduce((tong, item) => tong + item.soLuong, 0);
  const soAoChoGuiXuong = itemsChuaInXong
    .filter((item) => item.productionStatus !== "PRINTING")
    .reduce((tong, item) => tong + item.soLuong, 0);
  const chiTiet = [
    soAoChoGuiXuong > 0 ? `${soAoChoGuiXuong} áo Chờ gửi xưởng` : "",
    soAoDangIn > 0 ? `${soAoDangIn} áo Đang in` : "",
  ].filter(Boolean).join(", ");

  return `Chưa thể chuyển sang Chờ giao vì còn sản phẩm chưa in xong (${chiTiet}). Hãy cập nhật tiến độ tại Thiết kế & In ấn → Đơn cần in. Trạng thái Chờ giao sẽ được mở khóa khi tất cả áo đã in xong.`;
}

function getAllowedNextStatuses(order?: ChiTietDonHang | null) {
  if (!order) return [];

  if (
    isOrderStatusLockedByPayment({
      method: order.thanhToan.phuongThuc,
      paymentType: order.thanhToan.loai,
      status: order.thanhToan.status,
    })
  ) {
    return [];
  }

  if (order.trangThai === "da_xac_nhan" && !hasCustomDesignOrder(order)) {
    return ["cho_giao"];
  }

  if (order.trangThai === "dang_xu_ly_in" && !areAllCustomItemsPrinted(order)) {
    return [];
  }

  return ALLOWED_NEXT_STATUS[order.trangThai] ?? [];
}

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Đã xảy ra lỗi";
}

function isCodWaitingForDeliveryReconciliation(order?: ChiTietDonHang | null) {
  return Boolean(
    order &&
      order.thanhToan.phuongThuc === "COD" &&
      order.thanhToan.status === "PENDING"
  );
}

function canCompleteOrder(order?: ChiTietDonHang | null) {
  if (!order) return false;

  const payment = order.thanhToan;
  if (payment.phuongThuc === "COD") {
    return ["PENDING", "PARTIALLY_PAID", "PAID"].includes(
      payment.status || ""
    );
  }

  if (payment.loai === "DEPOSIT") {
    return (
      ["PARTIALLY_PAID", "PAID"].includes(payment.status || "") &&
      order.tienThuHoCodVnd > 0
    );
  }

  return payment.status === "PAID";
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  
  const [newStatus, setNewStatus] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState<string | undefined>(undefined);
  const [trackingCode, setTrackingCode] = useState("");
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: () => orderService.layChiTietDonHang(orderId!),
    enabled: Boolean(orderId) && open,
  });
  const isStateLocked = isOrderStatusLockedByPayment({
    method: order?.thanhToan.phuongThuc,
    paymentType: order?.thanhToan.loai,
    status: order?.thanhToan.status,
  });
  const productionStatusBlockReason = getProductionStatusBlockReason(order);
  const canRequestDesignRevision =
    order?.trangThai === "cho_xac_nhan" && hasCustomDesignOrder(order);
  const designIdToReview =
    order?.items?.find((item) => Boolean(item.designId))?.designId ?? null;

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
        queryClient.invalidateQueries({ queryKey: ["admin-payments"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-payments-stats"] }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            String(query.queryKey[0] || "").startsWith("dashboard/"),
        }),
      ]);
      onClose();
    },
    onError: (mutationError) => {
      messageApi.error(getApiErrorMessage(mutationError));
    },
  });

  const requestRevisionMutation = useMutation({
    mutationFn: () =>
      orderService.yeuCauChinhSuaThietKeDonHang(orderId!, revisionNote.trim()),
    onSuccess: async () => {
      setRevisionNote("");
      setShowRevisionInput(false);
      messageApi.success("Đã gửi yêu cầu khách chỉnh sửa thiết kế");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-order-detail", orderId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-danh-sach"] }),
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-thong-ke"] }),
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
        okButtonProps={{ disabled: !newStatus || isLoading || isStateLocked || showRevisionInput }}
        mask={{ closable: true }}
        onCancel={() => {
          setNewStatus("");
          setShippingCarrier(undefined);
          setTrackingCode("");
          setShowRevisionInput(false);
          setRevisionNote("");
          onClose();
        }}
        onOk={() => {
          if (newStatus === "dang_giao") {
            if (!shippingCarrier) {
              messageApi.error("Vui lòng chọn hoặc nhập đơn vị vận chuyển");
              return;
            }
          }

          if (isStateLocked) {
            messageApi.error(
              "Đơn hàng đang chờ thanh toán online hoặc tiền cọc; chỉ có thể hủy đơn hàng."
            );
            return;
          }

          if (newStatus === "hoan_tat" && !canCompleteOrder(order)) {
            messageApi.error(
              "Không thể hoàn tất: khoản thanh toán của đơn hàng chưa ở trạng thái hợp lệ."
            );
            return;
          }

          const performUpdate = () => {
            updateStatusMutation.mutate({
              trangThai: newStatus,
              shippingCarrier: newStatus === "dang_giao" ? shippingCarrier : undefined,
              trackingCode: newStatus === "dang_giao" ? trackingCode : undefined,
            });
          };

          // Modal hiện tại đã là bước xác nhận; không mở thêm hộp xác nhận
          // khi hoàn tất đơn hàng.
          if (newStatus === "hoan_tat") {
            performUpdate();
            return;
          }

          if (newStatus) {
            const statusLabel = ORDER_STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || "";
            let confirmContent = "Hệ thống không cho phép lùi trạng thái sau khi đã cập nhật. Bạn có chắc chắn muốn chuyển sang trạng thái này?";

            if (newStatus === "dang_giao") {
              confirmContent = "Hệ thống không cho phép lùi trạng thái sau khi đã cập nhật. Bạn có chắc chắn đơn hàng này đã được bàn giao cho đơn vị vận chuyển?";
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
            {isStateLocked ? (
              <Alert
                className="mb-4"
                type="warning"
                showIcon
                title="Đã khóa cập nhật trạng thái"
                description="Khách hàng chưa thanh toán online hoặc tiền cọc. Bạn chỉ có thể hủy đơn hàng từ trang chi tiết đơn."
              />
            ) : null}
            {!isStateLocked && productionStatusBlockReason ? (
              <Alert
                className="mb-4"
                type="warning"
                showIcon
                title="Chưa đủ điều kiện chuyển trạng thái"
                description={productionStatusBlockReason}
              />
            ) : null}
            {canRequestDesignRevision ? (
              <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <Alert
                  className="mb-3"
                  type="info"
                  showIcon
                  title="Đơn hàng có thiết kế khách hàng"
                  description="Khi chuyển đơn sang Đã xác nhận, hệ thống sẽ tự duyệt thiết kế và đưa sản phẩm vào hàng chờ in. Nếu mẫu chưa đạt, hãy yêu cầu khách chỉnh sửa trước."
                />
                {designIdToReview ? (
                  <Button
                    className="mb-3"
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      router.push(`/admin/thiet-ke?designId=${designIdToReview}`)
                    }
                  >
                    Xem thiết kế
                  </Button>
                ) : null}
                {!showRevisionInput ? (
                  <Button danger onClick={() => setShowRevisionInput(true)}>
                    Yêu cầu chỉnh sửa thiết kế
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1 text-sm font-semibold text-text-main">
                        Ghi chú cho khách hàng <span className="text-red-500">*</span>
                      </p>
                      <Input.TextArea
                        value={revisionNote}
                        rows={4}
                        maxLength={1000}
                        showCount
                        placeholder="Mô tả cụ thể nội dung khách hàng cần chỉnh sửa..."
                        onChange={(event) => setRevisionNote(event.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => {
                          setShowRevisionInput(false);
                          setRevisionNote("");
                        }}
                      >
                        Hủy
                      </Button>
                      <Button
                        danger
                        type="primary"
                        loading={requestRevisionMutation.isPending}
                        disabled={revisionNote.trim().length < 5}
                        onClick={() => requestRevisionMutation.mutate()}
                      >
                        Gửi yêu cầu
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            <p className="mb-2 text-sm font-semibold text-text-main">Trạng thái mới</p>
            <Select
              value={newStatus || undefined}
              placeholder={productionStatusBlockReason
                ? "Chưa có trạng thái được phép chuyển"
                : "Chọn trạng thái"}
              className="w-full"
              disabled={isStateLocked || Boolean(productionStatusBlockReason)}
              notFoundContent={productionStatusBlockReason || "Không có trạng thái tiếp theo phù hợp"}
              options={ORDER_STATUS_OPTIONS.filter(
                (status) => getAllowedNextStatuses(order).includes(status.value)
              )}
              onChange={setNewStatus}
            />
            {newStatus === "hoan_tat" && isCodWaitingForDeliveryReconciliation(order) && (
              <Alert
                className="mt-4"
                type="warning"
                showIcon
                title="Đơn COD chưa đối soát"
                description="Khi hoàn tất đơn, hệ thống chỉ chuyển khoản COD sang Chờ đối soát. Doanh thu sẽ được ghi nhận sau khi xác nhận thu COD tại trang Thanh toán."
              />
            )}
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
