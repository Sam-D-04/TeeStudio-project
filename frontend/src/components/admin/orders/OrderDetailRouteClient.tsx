"use client";

import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CopyOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  AutoComplete,
  Button,
  Descriptions,
  Divider,
  Input,
  Modal,
  QRCode,
  Select,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  message,
} from "antd";
import { isAxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as orderService from "@/services/admin/orderService";
import type { ChiTietDonHang } from "@/services/admin/orderService";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  cho_xac_nhan: { label: "Chờ xác nhận", color: "gold" },
  da_xac_nhan: { label: "Đã xác nhận", color: "blue" },
  dang_xu_ly_in: { label: "Đang xử lý in", color: "cyan" },
  dang_san_xuat: { label: "Đang xử lý in (cũ)", color: "cyan" },
  dang_in: { label: "Đang xử lý in (cũ)", color: "purple" },
  cho_giao: { label: "Chờ giao", color: "geekblue" },
  dang_giao: { label: "Đang giao hàng", color: "processing" },
  hoan_tat: { label: "Hoàn tất", color: "green" },
  da_huy: { label: "Đã hủy", color: "red" },
};

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

const CANCELLABLE_STATUSES = new Set(["cho_xac_nhan", "da_xac_nhan", "dang_xu_ly_in", "cho_giao", "dang_giao"]);
const EDITABLE_ADDRESS_STATUSES = new Set([
  "cho_xac_nhan",
  "da_xac_nhan",
  "dang_xu_ly_in",
  "cho_giao",
]);

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));
}

function formatDateTime(value?: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatExpiryTime(value?: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Đã xảy ra lỗi";
}

function StatusTag({ status }: { status: string }) {
  const config = STATUS_LABELS[status] ?? { label: status, color: "default" };
  return (
    <Tag color={config.color} className="m-0 rounded-full px-3 py-1 font-semibold">
      {config.label}
    </Tag>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span
        className={`font-bold ${value < 0 ? "text-success" : "text-text-main"}`}
      >
        {value < 0 ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
      </span>
    </div>
  );
}

function OrderItemsTable({ order }: { order: ChiTietDonHang }) {
  const items = order.items?.length
    ? order.items
    : [
        {
          id: order.id,
          productId: 0,
          variantId: 0,
          designId: null,
          tenSanPham: order.sanPham.ten,
          mauSac: "",
          kichCo: order.sanPham.sizes,
          sku: "",
          soLuong: 1,
          donGiaVnd: order.tamTinhVnd,
          phiThietKeVnd: order.phiThietKeVnd,
          thanhTienVnd: order.tamTinhVnd + order.phiThietKeVnd,
          loai: order.sanPham.loai,
          anhUrl: order.sanPham.anhUrl,
          anhXemTruocThietKe: order.anhXemTruocThietKe,
          viTriIn: order.viTriIn,
          phuongPhapIn: order.phuongPhapIn,
        },
      ];

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-alt text-xs font-bold uppercase text-text-secondary">
            <th className="p-3">Hình ảnh</th>
            <th className="p-3">Tên áo</th>
            <th className="p-3">Phân loại</th>
            <th className="p-3 text-center">Số lượng</th>
            <th className="p-3 text-right">Đơn giá</th>
            <th className="p-3 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const imageUrl = item.anhXemTruocThietKe || item.anhUrl;

            return (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="p-3 align-top">
                  <div className="h-14 w-14 overflow-hidden rounded-lg border border-border bg-surface-alt">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={item.tenSanPham}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">
                        Ảnh
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <div className="font-semibold text-text-main">{item.tenSanPham}</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {item.loai === "custom_design" ? (
                      <Tag color="blue" className="m-0">
                        Áo POD
                      </Tag>
                    ) : (
                      <Tag className="m-0">Áo mẫu</Tag>
                    )}
                    {item.designId ? (
                      <Tag color="geekblue" className="m-0">
                        Design #{item.designId}
                      </Tag>
                    ) : null}
                  </div>
                </td>
                <td className="p-3 align-top text-text-secondary">
                  <div>Màu: {item.mauSac || "Chưa có"}</div>
                  <div>Size: {item.kichCo || "Chưa có"}</div>
                  {item.sku ? <div className="text-xs text-text-muted">SKU: {item.sku}</div> : null}
                </td>
                <td className="p-3 text-center align-top font-bold text-text-main">
                  {item.soLuong}
                </td>
                <td className="p-3 text-right align-top text-text-main">
                  <div className="font-semibold">{formatCurrency(item.donGiaVnd)}</div>
                  {item.phiThietKeVnd > 0 ? (
                    <div className="mt-1 text-xs text-text-secondary">
                      Phí TK: {formatCurrency(item.phiThietKeVnd)}
                    </div>
                  ) : null}
                </td>
                <td className="p-3 text-right align-top font-bold text-primary-container">
                  {formatCurrency(item.thanhTienVnd)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function VnpayPaymentPanel({ order }: { order: ChiTietDonHang }) {
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [now, setNow] = useState<number | null>(null);
  const payment = order.thanhToan;
  const expiresAtMs = Date.parse(payment.expiresAt || "");
  const isCancelled = order.trangThai === "da_huy";
  const isPaid = payment.status === "COMPLETED";
  const isPending = payment.status === "PENDING";
  const hasValidExpiry = Number.isFinite(expiresAtMs);
  const isExpired =
    now !== null && isPending && (!hasValidExpiry || now >= expiresAtMs);
  const isActive =
    now !== null &&
    isPending &&
    !isCancelled &&
    Boolean(payment.paymentUrl) &&
    hasValidExpiry &&
    now < expiresAtMs;

  useEffect(() => {
    if (!isPending || isCancelled) return;

    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [isCancelled, isPending, payment.expiresAt]);

  const recreateMutation = useMutation({
    mutationFn: () => orderService.taoLaiMaThanhToanVnpay(order.id),
    onSuccess: async () => {
      messageApi.success("Đã tạo lại mã thanh toán VNPAY");
      await queryClient.invalidateQueries({
        queryKey: ["admin-order-detail", order.id],
      });
    },
    onError: (error) => {
      messageApi.error(getApiErrorMessage(error));
    },
  });

  async function copyPaymentLink() {
    if (!payment.paymentUrl) return;

    try {
      await navigator.clipboard.writeText(payment.paymentUrl);
      messageApi.success("Đã sao chép link thanh toán VNPAY");
    } catch {
      messageApi.error("Không thể sao chép tự động");
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-admin-card">
      {messageContextHolder}
      <div className="mb-4">
        <h3 className="text-card-title text-text-main">Thanh toán VNPAY</h3>
        <p className="mt-1 text-body-sm text-text-secondary">
          Gửi link hoặc mã QR này cho khách hàng để hoàn tất thanh toán.
        </p>
      </div>

      {isCancelled ? (
        <Alert
          showIcon
          type="error"
          title="Đơn hàng đã bị hủy"
          description="Mã thanh toán VNPAY đã được ẩn vĩnh viễn."
        />
      ) : isPaid ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
          <CheckCircleFilled className="text-5xl text-green-600" />
          <p className="mt-3 text-lg font-extrabold text-green-700">
            Đã thanh toán thành công
          </p>
          <p className="mt-1 text-sm font-semibold text-green-700">
            Lúc {formatDateTime(payment.paidAt)}
          </p>
        </div>
      ) : isExpired ? (
        <div className="space-y-4">
          <Alert
            showIcon
            type="error"
            title="Mã thanh toán đã hết hạn"
            description="Hãy tạo lại mã mới trước khi gửi cho khách hàng."
          />
          <Button
            type="primary"
            danger
            icon={<ReloadOutlined />}
            loading={recreateMutation.isPending}
            onClick={() => recreateMutation.mutate()}
          >
            Tạo lại mã thanh toán VNPAY
          </Button>
        </div>
      ) : isActive && payment.paymentUrl ? (
        <div className="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
          <div className="flex justify-center rounded-xl border border-border bg-white p-4">
            <QRCode value={payment.paymentUrl} size={220} />
          </div>
          <div>
            <Tag color="processing" className="m-0 rounded-full px-3 py-1 font-bold">
              Mã QR đang hoạt động
            </Tag>
            <p className="mt-4 text-sm text-text-secondary">
              Mã thanh toán sẽ hết hạn vào lúc:{" "}
              <strong className="text-text-main">
                {formatExpiryTime(payment.expiresAt)}
              </strong>
            </p>
            <Space wrap className="mt-4">
              <Button icon={<CopyOutlined />} onClick={copyPaymentLink}>
                Sao chép link
              </Button>
              <Button href={payment.paymentUrl} target="_blank">
                Mở link VNPAY
              </Button>
            </Space>
          </div>
        </div>
      ) : now === null && isPending ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <Alert
          showIcon
          type="warning"
          title="Không có mã thanh toán VNPAY khả dụng"
          description={`Trạng thái thanh toán hiện tại: ${payment.status || "Không xác định"}.`}
        />
      )}
    </section>
  );
}

function OrderDetailContent({ order }: { order: ChiTietDonHang }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-admin-card">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-container">
                <ShoppingCartOutlined />
                {order.maDonHang}
              </div>
              <h2 className="mt-2 font-extrabold text-headline-lg-mobile text-text-main md:text-headline-lg">
                Chi tiết đơn hàng
              </h2>
              <p className="mt-1 text-body-sm text-text-secondary">
                Tạo lúc {order.ngayTao}
              </p>
            </div>
            <StatusTag status={order.trangThai} />
          </div>

          <Descriptions column={{ xs: 1, md: 2 }} bordered size="small">
            <Descriptions.Item label="Khách hàng">
              {order.tenKhachHang}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {order.sdtKhachHang}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {order.emailKhachHang || "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              {order.thanhToan.phuongThuc} · {order.thanhToan.loai || "FULL"} ·{" "}
              {order.thanhToan.daThanh ? "Đã thanh toán" : "Chờ thanh toán"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
              {order.diaChiGiaoHang}
            </Descriptions.Item>
            <Descriptions.Item label="Vận chuyển">
              {order.donViVanChuyen || "Chưa chọn"}
            </Descriptions.Item>
            <Descriptions.Item label="Mã vận đơn">
              {order.maVanDon || "Chưa có"}
            </Descriptions.Item>
          </Descriptions>
        </section>

        {order.thanhToan.phuongThuc === "VNPAY" ? (
          <VnpayPaymentPanel order={order} />
        ) : null}

        <section className="rounded-xl border border-border bg-surface p-5 shadow-admin-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-card-title text-text-main">Sản phẩm</h3>
              <p className="mt-1 text-body-sm text-text-secondary">
                Danh sách đầy đủ để nhân viên kho nhặt hàng và đóng gói chính xác.
              </p>
            </div>
          </div>

          <OrderItemsTable order={order} />
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 shadow-admin-card">
          <h3 className="text-card-title text-text-main">Lịch sử xử lý</h3>
          <div className="mt-4 space-y-3">
            {order.thoiGianXuLy.map((step, index) => (
              <div key={`${step.thoiGian}-${index}`} className="flex gap-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    step.laDangHienTai ? "bg-primary-container" : "bg-border"
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold text-text-main">{step.moTa}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {step.thoiGian} · {step.nguoiThucHien}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="sticky top-5 h-fit rounded-xl border border-border bg-surface p-5 shadow-admin-card">
        <h3 className="text-card-title text-text-main">Tổng tiền</h3>
        <div className="mt-4 space-y-3">
          <PriceRow label="Tạm tính" value={order.tamTinhVnd} />
          <PriceRow label="Phí thiết kế" value={order.phiThietKeVnd} />
          <PriceRow label="Giảm giá" value={-order.giamGiaVnd} />
          <PriceRow label="Phí vận chuyển" value={order.phiVanChuyenVnd} />
        </div>

        <Divider className="my-4" />

        <div className="flex items-end justify-between gap-3">
          <span className="text-sm font-semibold text-text-secondary">
            Tổng cộng
          </span>
          <span className="text-2xl font-extrabold text-primary-container">
            {formatCurrency(order.tongTienVnd)}
          </span>
        </div>

        {order.tienCocVnd > 0 || order.tienThuHoCodVnd > 0 ? (
          <>
            <Divider className="my-4" />
            <div className="space-y-3 rounded-lg border border-primary-container/20 bg-sky-50 p-3">
              {order.tienCocVnd > 0 ? (
                <PriceRow label="Thanh toán trước (Cọc)" value={order.tienCocVnd} />
              ) : null}
              {order.tienThuHoCodVnd > 0 ? (
                <PriceRow label="Thu hộ COD khi giao" value={order.tienThuHoCodVnd} />
              ) : null}
            </div>
          </>
        ) : null}

        {order.lyDoHuy ? (
          <Alert
            showIcon
            type="warning"
            className="mt-4"
            title="Lý do hủy"
            description={order.lyDoHuy}
          />
        ) : null}
      </aside>
    </div>
  );
}

export default function OrderDetailRouteClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState<string | undefined>(undefined);
  const [trackingCode, setTrackingCode] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addrRecipientName, setAddrRecipientName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine, setAddrLine] = useState("");

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: () => orderService.layChiTietDonHang(orderId),
    enabled: Number.isFinite(orderId) && orderId > 0,
    refetchInterval: (query) => {
      const currentOrder = query.state.data;
      const shouldPoll =
        currentOrder?.thanhToan.phuongThuc === "VNPAY" &&
        currentOrder?.thanhToan.status === "PENDING" &&
        currentOrder?.trangThai !== "da_huy";

      return shouldPoll ? 3000 : false;
    },
  });

  async function refreshOrderData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin-order-detail", orderId],
      }),
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] }),
    ]);
  }

  async function refreshStockData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-order-product-search"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-order-design-search"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory"] }),
    ]);
  }

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { trangThai: string; shippingCarrier?: string; trackingCode?: string }) =>
      orderService.capNhatTrangThaiDonHang({
        id: orderId,
        ...payload,
      }),
    onSuccess: async () => {
      setIsUpdateModalOpen(false);
      setNewStatus("");
      setShippingCarrier(undefined);
      setTrackingCode("");
      messageApi.success("Cập nhật trạng thái đơn hàng thành công");
      await refreshOrderData();
    },
    onError: (mutationError) => {
      messageApi.error(getApiErrorMessage(mutationError));
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (reason: string) => orderService.huyDonHang(orderId, reason),
    onSuccess: async () => {
      setIsCancelModalOpen(false);
      setCancelReason("");
      messageApi.success("Đã hủy đơn hàng thành công");
      await Promise.all([refreshOrderData(), refreshStockData()]);
    },
    onError: (mutationError) => {
      messageApi.error(getApiErrorMessage(mutationError));
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: (payload: { recipientName: string; phone: string; addressLine: string }) =>
      orderService.capNhatDiaChiDonHang({ id: orderId, ...payload }),
    onSuccess: async () => {
      setIsAddressModalOpen(false);
      messageApi.success("Cập nhật địa chỉ giao hàng thành công");
      await refreshOrderData();
    },
    onError: (mutationError) => {
      messageApi.error(getApiErrorMessage(mutationError));
    },
  });

  const canUpdateOrder = Boolean(
    order && order.trangThai !== "da_huy" && order.trangThai !== "hoan_tat"
  );
  const canCancelOrder = Boolean(
    order && CANCELLABLE_STATUSES.has(order.trangThai)
  );
  const canEditAddress = Boolean(
    order && EDITABLE_ADDRESS_STATUSES.has(order.trangThai)
  );
  const trimmedCancelReason = cancelReason.trim();

  return (
    <div>
      {messageContextHolder}
      {modalContextHolder}
      <section className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="mb-3 px-0 font-semibold text-text-secondary hover:text-primary-container"
            onClick={() => router.push("/admin/don-hang")}
          >
            Quay lại danh sách
          </Button>
          <p className="text-body-md text-text-secondary">
            Xem thông tin đơn hàng vừa tạo hoặc tiếp tục thao tác trong danh sách.
          </p>
        </div>

        <Space wrap>
          {canUpdateOrder ? (
            <>
              <Tooltip
                title={
                  canCancelOrder
                    ? "Hủy đơn hàng"
                    : "Không thể hủy khi đơn đã hoàn tất"
                }
              >
                <Button
                  danger
                  icon={<StopOutlined />}
                  disabled={!canCancelOrder}
                  className="h-10 rounded-[10px] font-semibold"
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  Hủy đơn
                </Button>
              </Tooltip>
              {canEditAddress ? (
                <Button
                  icon={<EditOutlined />}
                  className="h-10 rounded-[10px] font-semibold"
                  onClick={() => {
                    if (order) {
                      setAddrRecipientName(order.tenNguoiNhanGiaoHang || order.tenKhachHang || "");
                      setAddrPhone(order.sdtNguoiNhan || "");
                      setAddrLine(order.diaChiGiaoHang || order.addressLineRaw || "");
                    }
                    setIsAddressModalOpen(true);
                  }}
                >
                  Sửa địa chỉ
                </Button>
              ) : null}
              <Button
                icon={<EditOutlined />}
                className="h-10 rounded-[10px] font-semibold"
                onClick={() => setIsUpdateModalOpen(true)}
              >
                Cập nhật trạng thái
              </Button>
            </>
          ) : null}

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="h-10 rounded-[10px] font-semibold"
            onClick={() => router.push("/admin/don-hang/tao-moi")}
          >
            Tạo đơn khác
          </Button>
        </Space>
      </section>

      {isLoading ? <Skeleton active paragraph={{ rows: 12 }} /> : null}

      {isError ? (
        <Alert
          showIcon
          type="error"
          title="Không thể tải chi tiết đơn hàng"
          description={error instanceof Error ? error.message : "Vui lòng thử lại sau"}
        />
      ) : null}

      {!isLoading && !isError && order ? <OrderDetailContent order={order} /> : null}

      <Modal
        open={isUpdateModalOpen}
        title="Cập nhật trạng thái đơn hàng"
        okText="Xác nhận"
        cancelText="Đóng"
        confirmLoading={updateStatusMutation.isPending}
        okButtonProps={{ disabled: !newStatus }}
        mask={{ closable: true }}
        onCancel={() => {
          setIsUpdateModalOpen(false);
          setNewStatus("");
          setShippingCarrier(undefined);
          setTrackingCode("");
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
        <p className="mb-2 text-sm font-semibold text-text-main">
          Trạng thái mới
        </p>
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
                placeholder="Chọn hoặc nhập ĐVVC"
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
      </Modal>

      <Modal
        open={isCancelModalOpen}
        title="Hủy đơn hàng"
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{
          danger: true,
          disabled: trimmedCancelReason.length < 5,
        }}
        confirmLoading={cancelOrderMutation.isPending}
        mask={{ closable: true }}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setCancelReason("");
        }}
        onOk={() => {
          if (trimmedCancelReason.length >= 5) {
            cancelOrderMutation.mutate(trimmedCancelReason);
          }
        }}
      >
        <p className="mb-2 text-sm font-semibold text-text-main">Lý do hủy</p>
        <div className="pb-6">
          <Input.TextArea
            value={cancelReason}
            rows={4}
            maxLength={500}
            showCount
            placeholder="Ví dụ: Khách hàng yêu cầu hủy đơn..."
            onChange={(event) => setCancelReason(event.target.value)}
          />
        </div>
        {trimmedCancelReason.length > 0 && trimmedCancelReason.length < 5 ? (
          <p className="mt-0 text-xs font-semibold text-red-600">
            Lý do hủy cần ít nhất 5 ký tự.
          </p>
        ) : null}
      </Modal>

      <Modal
        open={isAddressModalOpen}
        title="Sửa địa chỉ giao hàng"
        okText="Lưu thay đổi"
        cancelText="Đóng"
        okButtonProps={{
          disabled: !addrRecipientName.trim() || !addrPhone.trim() || !addrLine.trim(),
        }}
        confirmLoading={updateAddressMutation.isPending}
        mask={{ closable: true }}
        onCancel={() => setIsAddressModalOpen(false)}
        onOk={() => {
          const recipientName = addrRecipientName.trim();
          const phone = addrPhone.trim();
          const address = addrLine.trim();
          if (!recipientName || !phone || !address) return;
          updateAddressMutation.mutate({ recipientName, phone, addressLine: address });
        }}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-text-secondary">
            Chỉ có thể sửa địa chỉ khi đơn đang ở trạng thái{" "}
            <span className="font-semibold text-text-main">Chờ xác nhận</span>,{" "}
            <span className="font-semibold text-text-main">Đã xác nhận</span>,{" "}
            <span className="font-semibold text-text-main">Đang xử lý in</span> hoặc{" "}
            <span className="font-semibold text-text-main">Chờ giao</span>.
          </p>
          <div>
            <p className="mb-1 text-sm font-semibold text-text-main">
              Số điện thoại <span className="text-red-500">*</span>
            </p>
            <Input
              value={addrPhone}
              placeholder="Nhập số điện thoại..."
              onChange={(e) => setAddrPhone(e.target.value)}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-text-main">
              Địa chỉ giao hàng <span className="text-red-500">*</span>
            </p>
            <Input.TextArea
              value={addrLine}
              rows={3}
              placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP HCM..."
              onChange={(e) => setAddrLine(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-4 py-2">
          <div>
            <p className="mb-1 text-sm font-semibold text-text-main">
              Tên người nhận <span className="text-red-500">*</span>
            </p>
            <Input
              value={addrRecipientName}
              placeholder="Nhập tên người nhận..."
              onChange={(e) => setAddrRecipientName(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
