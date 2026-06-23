"use client";

import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CopyOutlined,
  EditOutlined,
  HistoryOutlined,
  PlusOutlined,
  QrcodeOutlined,
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
  Drawer,
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

const CANCELLABLE_STATUSES = new Set(["cho_xac_nhan", "da_xac_nhan", "dang_xu_ly_in", "cho_giao", "dang_giao"]);
const EDITABLE_ADDRESS_STATUSES = new Set([
  "cho_xac_nhan",
  "da_xac_nhan",
  "dang_xu_ly_in",
  "cho_giao",
]);

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

/** Bảng sản phẩm compact – ảnh nhỏ 48px, gộp tên/màu/size/SKU vào 1 cột */
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-alt text-xs font-bold uppercase text-text-secondary">
            <th className="px-2 py-2">Sản phẩm</th>
            <th className="px-2 py-2 text-center">SL</th>
            <th className="px-2 py-2 text-right">Đơn giá</th>
            <th className="px-2 py-2 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const imageUrl = item.anhXemTruocThietKe || item.anhUrl;

            return (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                {/* Cột sản phẩm: ảnh nhỏ + thông tin gộp */}
                <td className="px-2 py-2 align-middle">
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-surface-alt">
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
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-text-main leading-tight">
                        {item.tenSanPham}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1">
                        {item.loai === "custom_design" ? (
                          <Tag color="blue" className="m-0 text-xs">Áo POD</Tag>
                        ) : (
                          <Tag className="m-0 text-xs">Áo mẫu</Tag>
                        )}
                        {item.designId ? (
                          <Tag color="geekblue" className="m-0 text-xs">
                            Design #{item.designId}
                          </Tag>
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-xs text-text-secondary">
                        {[
                          item.mauSac ? `Màu: ${item.mauSac}` : null,
                          item.kichCo ? `Size: ${item.kichCo}` : null,
                          item.sku ? `SKU: ${item.sku}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 text-center align-middle font-bold text-text-main">
                  {item.soLuong}
                </td>
                <td className="px-2 py-2 text-right align-middle text-text-main">
                  <div className="font-semibold">{formatCurrency(item.donGiaVnd)}</div>
                  {item.phiThietKeVnd > 0 ? (
                    <div className="mt-0.5 text-xs text-text-secondary">
                      + phí TK: {formatCurrency(item.phiThietKeVnd)}
                    </div>
                  ) : null}
                </td>
                <td className="px-2 py-2 text-right align-middle font-bold text-primary-container">
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

/** Nút "Hiển thị mã QR" → modal popup. Ẩn khi đơn PAID hoặc CANCELLED. */
function VnpayQrButton({ order }: { order: ChiTietDonHang }) {
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [isQrOpen, setIsQrOpen] = useState(false);
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

  // Ẩn nút khi đã thanh toán hoặc đã hủy
  if (isPaid || isCancelled) return null;

  return (
    <>
      {messageContextHolder}
      <Button
        size="small"
        icon={<QrcodeOutlined />}
        onClick={() => setIsQrOpen(true)}
        className="h-7 rounded-md text-xs font-semibold"
      >
        Hiển thị mã QR
      </Button>

      <Modal
        open={isQrOpen}
        title="Mã QR thanh toán VNPAY"
        footer={null}
        width={340}
        centered
        onCancel={() => setIsQrOpen(false)}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {isExpired ? (
            <div className="w-full space-y-3">
              <Alert
                showIcon
                type="error"
                title="Mã thanh toán đã hết hạn"
                description="Hãy tạo lại mã mới trước khi gửi cho khách hàng."
              />
              <Button
                type="primary"
                danger
                block
                icon={<ReloadOutlined />}
                loading={recreateMutation.isPending}
                onClick={() => recreateMutation.mutate()}
              >
                Tạo lại mã thanh toán
              </Button>
            </div>
          ) : isActive && payment.paymentUrl ? (
            <>
              <div className="rounded-xl border border-border bg-white p-3">
                <QRCode value={payment.paymentUrl} size={200} />
              </div>
              <div className="text-center">
                <Tag color="processing" className="rounded-full px-3 py-0.5 font-bold">
                  Mã QR đang hoạt động
                </Tag>
                <p className="mt-2 text-xs text-text-secondary">
                  Hết hạn lúc:{" "}
                  <strong className="text-text-main">
                    {formatExpiryTime(payment.expiresAt)}
                  </strong>
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Button
                  type="primary"
                  block
                  icon={<CopyOutlined />}
                  onClick={copyPaymentLink}
                >
                  Sao chép link thanh toán
                </Button>
                <Button block href={payment.paymentUrl} target="_blank">
                  Mở link VNPAY
                </Button>
              </div>
            </>
          ) : now === null && isPending ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : (
            <Alert
              showIcon
              type="warning"
              title="Không có mã QR khả dụng"
              description={`Trạng thái thanh toán: ${payment.status || "Không xác định"}.`}
            />
          )}
        </div>
      </Modal>
    </>
  );
}

/** Drawer lịch sử thay đổi trạng thái */
function OrderHistoryDrawer({ order }: { order: ChiTietDonHang }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="small"
        icon={<HistoryOutlined />}
        onClick={() => setOpen(true)}
        className="h-7 rounded-md text-xs font-semibold"
      >
        Lịch sử xử lý
      </Button>

      <Drawer
        title="Lịch sử thay đổi trạng thái"
        placement="right"
        size="default"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          {order.thoiGianXuLy.map((step, index) => (
            <div key={`${step.thoiGian}-${index}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${
                    step.laDangHienTai
                      ? "border-primary-container bg-primary-container"
                      : "border-border bg-white"
                  }`}
                />
                {index < order.thoiGianXuLy.length - 1 && (
                  <span className="mt-1 w-0.5 flex-1 bg-border" />
                )}
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold text-text-main leading-tight">{step.moTa}</p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {step.thoiGian} · {step.nguoiThucHien}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
}

function OrderDetailContent({ order }: { order: ChiTietDonHang }) {
  const isVnpay = order.thanhToan.phuongThuc === "VNPAY";
  const isPaid = order.thanhToan.status === "COMPLETED";

  return (
    <section className="rounded-xl border border-border bg-surface shadow-admin-card">
      {/* ── Header thẻ ── */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-container">
            <ShoppingCartOutlined />
            <span>{order.maDonHang}</span>
          </div>
          <h2 className="text-base font-extrabold text-text-main">Chi tiết đơn hàng</h2>
          <span className="text-xs text-text-secondary">· Tạo lúc {order.ngayTao}</span>
        </div>
        <div className="flex items-center gap-2">
          <OrderHistoryDrawer order={order} />
          <StatusTag status={order.trangThai} />
        </div>
      </div>

      {/* ── Thông tin chính ── */}
      <div className="px-4 pt-3 pb-0">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} bordered size="small">
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
            <div className="flex flex-wrap items-center gap-1">
              <span>{order.thanhToan.phuongThuc}</span>
              <span className="text-text-muted">·</span>
              <span>{order.thanhToan.loai || "FULL"}</span>
              <span className="text-text-muted">·</span>
              <span>{order.thanhToan.daThanh ? "Đã thanh toán" : "Chờ thanh toán"}</span>
              {isVnpay && !isPaid && order.trangThai !== "da_huy" ? (
                <VnpayQrButton order={order} />
              ) : null}
              {isPaid ? (
                <Tag color="green" className="m-0 text-xs">
                  <CheckCircleFilled className="mr-1" />
                  Đã thanh toán lúc {formatDateTime(order.thanhToan.paidAt)}
                </Tag>
              ) : null}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Vận chuyển">
            {order.donViVanChuyen || "Chưa chọn"}
          </Descriptions.Item>
          <Descriptions.Item label="Mã vận đơn">
            {order.maVanDon || "Chưa có"}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ giao hàng" span={3}>
            {order.diaChiGiaoHang}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* ── Lý do hủy (nếu có) ── */}
      {order.lyDoHuy ? (
        <div className="px-4 pt-3">
          <Alert
            showIcon
            type="warning"
            title="Lý do hủy đơn"
            description={order.lyDoHuy}
          />
        </div>
      ) : null}

      {/* ── Divider + tiêu đề bảng sản phẩm ── */}
      <div className="flex items-center justify-between gap-2 border-t border-border px-4 pt-3 pb-1 mt-3">
        <span className="text-xs font-bold uppercase tracking-wide text-text-secondary">
          Sản phẩm đặt hàng
        </span>
      </div>

      {/* ── Bảng sản phẩm ── */}
      <div className="px-4">
        <OrderItemsTable order={order} />
      </div>

      {/* ── Tổng tiền – 2 cột ── */}
      <div className="border-t border-border px-4 py-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-0">
          {/* Cột trái: chi tiết các khoản */}
          <div className="space-y-1.5 border-r border-border pr-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
              Chi tiết các khoản
            </p>
            <PriceRow label="Tạm tính" value={order.tamTinhVnd} />
            {order.phiThietKeVnd > 0 ? (
              <PriceRow label="Phí thiết kế" value={order.phiThietKeVnd} />
            ) : null}
            {order.giamGiaVnd > 0 ? (
              <PriceRow label="Giảm giá" value={-order.giamGiaVnd} />
            ) : null}
            <PriceRow label="Phí vận chuyển" value={order.phiVanChuyenVnd} />
          </div>

          {/* Cột phải: tổng cộng + thanh toán đặc biệt */}
          <div className="space-y-1.5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
              Tổng thanh toán
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-text-secondary">Tổng cộng</span>
              <span className="text-xl font-extrabold text-primary-container">
                {formatCurrency(order.tongTienVnd)}
              </span>
            </div>
            {order.tienCocVnd > 0 || order.tienThuHoCodVnd > 0 ? (
              <div className="mt-1 space-y-1 rounded-lg border border-primary-container/20 bg-sky-50 p-2">
                {order.tienCocVnd > 0 ? (
                  <PriceRow label="Thanh toán trước (Cọc)" value={order.tienCocVnd} />
                ) : null}
                {order.tienThuHoCodVnd > 0 ? (
                  <PriceRow label="Thu hộ COD khi giao" value={order.tienThuHoCodVnd} />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OrderDetailRouteClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
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
      <section className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="mb-1 px-0 font-semibold text-text-secondary hover:text-primary-container"
            onClick={() => router.push("/admin/don-hang")}
          >
            Quay lại danh sách
          </Button>
          <p className="text-xs text-text-secondary">
            Xem thông tin đơn hàng hoặc tiếp tục thao tác.
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
                  className="h-9 rounded-[10px] font-semibold"
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  Hủy đơn
                </Button>
              </Tooltip>
              {canEditAddress ? (
                <Button
                  icon={<EditOutlined />}
                  className="h-9 rounded-[10px] font-semibold"
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
            </>
          ) : null}

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="h-9 rounded-[10px] font-semibold"
            onClick={() => router.push("/admin/don-hang/tao-moi")}
          >
            Tạo đơn khác
          </Button>
        </Space>
      </section>

      {isLoading ? <Skeleton active paragraph={{ rows: 10 }} /> : null}

      {isError ? (
        <Alert
          showIcon
          type="error"
          title="Không thể tải chi tiết đơn hàng"
          description={error instanceof Error ? error.message : "Vui lòng thử lại sau"}
        />
      ) : null}

      {!isLoading && !isError && order ? <OrderDetailContent order={order} /> : null}


      {/* Modal hủy đơn */}
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

      {/* Modal sửa địa chỉ giao hàng */}
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
              Tên người nhận <span className="text-red-500">*</span>
            </p>
            <Input
              value={addrRecipientName}
              placeholder="Nhập tên người nhận..."
              onChange={(e) => setAddrRecipientName(e.target.value)}
            />
          </div>
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
      </Modal>
    </div>
  );
}
