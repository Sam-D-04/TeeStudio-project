"use client";

import {
  ArrowLeftOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Descriptions, Divider, Skeleton, Tag } from "antd";
import { useParams, useRouter } from "next/navigation";
import * as orderService from "@/services/admin/orderService";
import type { ChiTietDonHang } from "@/services/admin/orderService";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  cho_xac_nhan: { label: "Chờ xác nhận", color: "gold" },
  da_xac_nhan: { label: "Đã xác nhận", color: "blue" },
  dang_san_xuat: { label: "Đang sản xuất", color: "cyan" },
  dang_in: { label: "Đang in", color: "purple" },
  cho_giao: { label: "Chờ giao", color: "geekblue" },
  dang_giao: { label: "Đang giao", color: "processing" },
  hoan_tat: { label: "Hoàn tất", color: "green" },
  da_huy: { label: "Đã hủy", color: "red" },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));
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
              {order.thanhToan.phuongThuc} ·{" "}
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

        <section className="rounded-xl border border-border bg-surface p-5 shadow-admin-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-card-title text-text-main">Sản phẩm</h3>
              <p className="mt-1 text-body-sm text-text-secondary">
                Danh sách đầy đủ để nhân viên kho nhặt hàng và đóng gói chính xác.
              </p>
            </div>
            {order.daXuatThongSoIn ? (
              <Tag color="green" className="m-0">
                Đã xuất thông số in
              </Tag>
            ) : (
              <Tag color="gold" className="m-0">
                Chưa xuất thông số in
              </Tag>
            )}
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
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: () => orderService.layChiTietDonHang(orderId),
    enabled: Number.isFinite(orderId) && orderId > 0,
  });

  return (
    <div>
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

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="h-10 rounded-[10px] font-semibold"
          onClick={() => router.push("/admin/don-hang/tao-moi")}
        >
          Tạo đơn khác
        </Button>
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
    </div>
  );
}
