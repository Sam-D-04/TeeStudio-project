"use client";

import {
  CheckOutlined,
  EditOutlined,
  PictureOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Image, Input, Modal, Skeleton, message, Radio } from "antd";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import * as designService from "@/services/admin/designService";
import DesignStatusBadge from "./DesignStatusBadge";
import AdminShirtMockupImage from "./AdminShirtMockupImage";
import { getPrintAreaBoundary } from "@/components/design-studio/ShirtMockupImage";
import { ShirtType, ShirtView } from "@/store/useDesignStore";

const getShirtType = (name: string): ShirtType => {
  const lower = (name || "").toLowerCase();
  if (lower.includes('polo')) return 'polo';
  if (lower.includes('hoodie')) return 'hoodie';
  return 'tshirt';
};

type DesignDetailModalProps = {
  designId: number | null;
  open: boolean;
  onClose: () => void;
};

type FieldProps = {
  label: string;
  value: ReactNode;
  wide?: boolean;
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  PRINTING: "Đang in",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

const PRODUCTION_STATUS_LABELS: Record<string, string> = {
  WAITING_DESIGN_APPROVAL: "Chờ duyệt thiết kế",
  APPROVED: "Đã duyệt",
  READY_TO_PRINT: "Chờ gửi xưởng",
  PROCESSING: "Đang xử lý",
  PRINTING: "Đang in",
  PRINTED: "Đã in xong",
  PACKED: "Đã đóng gói",
};

function Field({ label, value, wide = false }: FieldProps) {
  return (
    <div className={wide ? "min-w-0 sm:col-span-2" : "min-w-0"}>
      <div className="text-[11px] font-semibold uppercase text-text-muted">
        {label}
      </div>
      <div className="mt-1 min-h-5 break-words text-sm font-semibold leading-5 text-text-main">
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-3">
      <h3 className="mb-3 text-sm font-bold text-text-main">{title}</h3>
      {children}
    </section>
  );
}

function EmptyValue({ children = "Chưa có" }: { children?: ReactNode }) {
  return <span className="font-normal text-text-muted">{children}</span>;
}

function formatCurrency(value?: number | null) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function getStatusLabel(value?: string | null, labels?: Record<string, string>) {
  if (!value) return "Chưa cập nhật";
  return labels?.[value] || value;
}

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Đã xảy ra lỗi";
}

export default function DesignDetailModal({
  designId,
  open,
  onClose,
}: DesignDetailModalProps) {
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [revisionNote, setRevisionNote] = useState("");
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["thiet-ke-chi-tiet", designId],
    queryFn: () => designService.layChiTietThietKe(designId!),
    enabled: open && designId !== null,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (open && data?.trangThai === "can_chinh_sua" && data?.ghiChu) {
      setRevisionNote(data.ghiChu);
    } else if (!open) {
      setRevisionNote("");
    }
  }, [open, data?.trangThai, data?.ghiChu]);

  const requestRevisionMutation = useMutation({
    mutationFn: () =>
      designService.yeuCauChinhSuaThietKe(designId!, revisionNote.trim()),
    onSuccess: async () => {
      messageApi.success(
        data?.trangThai === "can_chinh_sua"
          ? "Đã cập nhật yêu cầu chỉnh sửa thiết kế"
          : "Đã gửi yêu cầu chỉnh sửa thiết kế đến khách hàng"
      );
      setRevisionNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-chi-tiet", designId] }),
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-danh-sach"] }),
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-thong-ke"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order-detail"] }),
      ]);
    },
    onError: (error) => {
      messageApi.error(getApiErrorMessage(error));
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => designService.duyetThietKe(designId!),
    onSuccess: async () => {
      messageApi.success("Đã duyệt thiết kế thành công");
      setRevisionNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-chi-tiet", designId] }),
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-danh-sach"] }),
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-thong-ke"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order-detail"] }),
      ]);
    },
    onError: (error) => {
      messageApi.error(getApiErrorMessage(error));
    },
  });

  const trimmedRevisionNote = revisionNote.trim();
  const canApproveDesign =
    data?.trangThai === "cho_kiem_tra" || data?.trangThai === "can_chinh_sua";
  const relatedOrders = data?.donHangLienQuan ?? [];

  const handleClose = () => {
    setRevisionNote("");
    onClose();
  };

  return (
    <>
      {messageContextHolder}
      {modalContextHolder}
      <Modal
        className="design-detail-modal"
        open={open}
        onCancel={handleClose}
        width="min(1440px, calc(100vw - 32px))"
        style={{ top: 16 }}
        destroyOnHidden
        title={null}
        footer={null}
        styles={{
          body: {
            maxHeight: "calc(100vh - 76px)",
            overflow: "hidden",
            padding: "52px 0 0",
          },
        }}
      >
        <div className="design-detail-modal-scroll">
          {isLoading ? (
            <div className="py-3">
              <Skeleton active avatar={{ shape: "square", size: 220 }} paragraph={{ rows: 9 }} />
            </div>
          ) : isError || !data ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tải chi tiết thiết kế"
              description="Dữ liệu có thể đã thay đổi hoặc kết nối tới máy chủ đang bị gián đoạn."
              action={
                <Button
                  size="small"
                  icon={<ReloadOutlined spin={isFetching} />}
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  Thử lại
                </Button>
              }
            />
          ) : (
            <div className="pr-4">
              <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase text-text-muted">
                    Chi tiết thiết kế
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="m-0 break-words text-2xl font-bold text-text-main">
                      {data.maThietKe}
                    </h2>
                    {data.maDonHang ? (
                      <Link
                        href={
                          relatedOrders[0]?.orderId
                            ? `/admin/don-hang/${relatedOrders[0].orderId}`
                            : `/admin/don-hang?keyword=${encodeURIComponent(data.maDonHang)}`
                        }
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Đơn {data.maDonHang}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-text-muted">Chưa gắn đơn hàng</span>
                    )}
                  </div>
                  <div className="mt-1 max-w-[760px] break-words text-sm text-text-secondary">
                    {data.tenThietKe || "Thiết kế chưa đặt tên"}
                  </div>
                </div>
                <DesignStatusBadge trangThai={data.trangThai} />
              </header>

              <div className="grid gap-4 xl:grid-cols-[minmax(520px,0.95fr)_minmax(600px,1.05fr)]">
                <section className="min-w-0">
                  <div className="flex h-[calc(100vh-185px)] min-h-[500px] flex-col overflow-hidden rounded-lg border border-border bg-surface-alt">
                    {data.printFileUrlBack && (
                      <div className="flex justify-center border-b border-border bg-white p-2">
                        <Radio.Group
                          options={[
                            { label: 'Mặt trước', value: 'front' },
                            { label: 'Mặt sau', value: 'back' },
                          ]}
                          onChange={({ target: { value } }) => setActiveTab(value)}
                          value={activeTab}
                          optionType="button"
                          buttonStyle="solid"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 items-center justify-center p-3">
                      {data.urlPreview || data.printFileUrlFront || data.printFileUrlBack ? (() => {
                        const containerW = 400;
                        const containerH = 480;
                        const shirtType = getShirtType(data.tenSanPham || "");
                        const currentView = activeTab as ShirtView;
                        const printSrc = activeTab === 'front' ? data.printFileUrlFront : data.printFileUrlBack;

                        if (printSrc) {
                          const boundary = getPrintAreaBoundary(shirtType, currentView, containerW, containerH);
                          return (
                            <>
                              <div
                                onClick={() => setPreviewOpen(true)}
                                className="group"
                                style={{
                                  width: containerW,
                                  height: containerH,
                                  position: "relative",
                                  backgroundColor: "#f8fafc",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                  cursor: "pointer"
                                }}
                              >
                                <AdminShirtMockupImage
                                  type={shirtType}
                                  view={currentView}
                                  color={data.mauAo || "#ffffff"}
                                  width={containerW}
                                  height={containerH}
                                />
                                <img
                                  src={printSrc}
                                  alt={`Thiết kế ${activeTab}`}
                                  style={{
                                    position: "absolute",
                                    top: boundary.top,
                                    left: boundary.left,
                                    width: boundary.width,
                                    height: boundary.height,
                                    objectFit: "contain",
                                    pointerEvents: "none"
                                  }}
                                />
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                                  <span className="flex items-center gap-2 font-medium text-white">
                                    Phóng to
                                  </span>
                                </div>
                              </div>
                              <Modal
                                open={previewOpen}
                                onCancel={(e) => {
                                  e.stopPropagation();
                                  setPreviewOpen(false);
                                }}
                                footer={null}
                                width={600}
                                centered
                                styles={{
                                  body: { padding: 0, display: 'flex', justifyContent: 'center' },
                                  mask: { backgroundColor: 'rgba(0, 0, 0, 0.85)' }
                                }}
                              >
                                <div
                                  style={{
                                    width: 600,
                                    height: 720,
                                    position: "relative",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  <AdminShirtMockupImage
                                    type={shirtType}
                                    view={currentView}
                                    color={data.mauAo || "#ffffff"}
                                    width={600}
                                    height={720}
                                  />
                                  <img
                                    src={printSrc}
                                    alt={`Thiết kế ${activeTab} phóng to`}
                                    style={{
                                      position: "absolute",
                                      top: getPrintAreaBoundary(shirtType, currentView, 600, 720).top,
                                      left: getPrintAreaBoundary(shirtType, currentView, 600, 720).left,
                                      width: getPrintAreaBoundary(shirtType, currentView, 600, 720).width,
                                      height: getPrintAreaBoundary(shirtType, currentView, 600, 720).height,
                                      objectFit: "contain",
                                      pointerEvents: "none"
                                    }}
                                  />
                                </div>
                              </Modal>
                            </>
                          );
                        }

                        return (
                          <Image
                            src={data.urlPreview || ''}
                            alt="Bản xem trước"
                            className="max-h-[calc(100vh-265px)] w-full rounded-md object-contain"
                            rootClassName="flex w-full items-center justify-center"
                            preview={{ mask: "Phóng to" }}
                          />
                        );
                      })() : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-md bg-white text-center text-text-muted">
                          <PictureOutlined className="text-4xl" />
                          <div>
                            <p className="m-0 font-semibold text-text-secondary">
                              Chưa có ảnh xem trước
                            </p>
                            <p className="mb-0 mt-1 text-xs">Màu áo: {data.tenMauAo}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="grid min-w-0 content-start gap-3">
                  <Section title="Thông tin chính">
                    <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                      <Field label="Mã đơn hàng" value={
                        data.maDonHang ? (
                          <span className="break-all">{data.maDonHang}</span>
                        ) : (
                          <EmptyValue>Chưa phát sinh đơn</EmptyValue>
                        )
                      } />
                      <Field label="Ngày gửi" value={data.ngayGui || <EmptyValue />} />
                      <Field label="ID thiết kế" value={data.id} />
                      <Field label="Cập nhật" value={data.ngayCapNhat || <EmptyValue />} />
                      <Field label="Khách hàng" value={data.tenKhachHang} />
                      <Field label="SĐT" value={data.soDienThoai || <EmptyValue />} />
                      <Field label="Email" value={data.emailKhachHang || <EmptyValue />} wide />
                    </div>
                  </Section>

                  <Section title="Sản phẩm và biến thể">
                    <div className="grid gap-x-5 gap-y-3 sm:grid-cols-3">
                      <Field label="Sản phẩm" value={data.tenSanPham} />
                      <Field label="ID sản phẩm" value={data.productId || data.sanPhamId} />
                      <Field label="ID biến thể" value={data.variantId || <EmptyValue />} />
                      <Field label="SKU" value={data.skuAo || <EmptyValue />} />
                      <Field label="Size" value={data.sizeAo || <EmptyValue />} />
                      <Field
                        label="Màu áo"
                        value={
                          <span className="inline-flex min-w-0 max-w-full items-center gap-2">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full border border-border"
                              style={{ backgroundColor: data.mauAo }}
                            />
                            <span className="break-words">
                              {data.tenMauAo} ({data.mauAo})
                            </span>
                          </span>
                        }
                      />
                      <Field
                        label="Tồn biến thể"
                        value={
                          data.tonKhoBienThe === null || data.tonKhoBienThe === undefined
                            ? <EmptyValue />
                            : data.tonKhoBienThe
                        }
                      />
                      <Field label="Vị trí in" value={data.viTriIn || <EmptyValue />} />
                      <Field label="Phương pháp in" value={data.phuongPhapIn || <EmptyValue />} />
                      <Field label="Phí PP in" value={formatCurrency((data.phiPhuongPhapInFront ?? 0) + (data.phiPhuongPhapInBack ?? 0))} />
                      <Field label="Phí diện tích in" value={formatCurrency((data.phiDienTichInFront ?? 0) + (data.phiDienTichInBack ?? 0))} />
                      <Field label="Phí thiết kế" value={formatCurrency(data.phiThietKe)} />
                    </div>
                  </Section>

                  <Section title="Đơn hàng liên quan">
                    {relatedOrders.length === 0 ? (
                      <p className="m-0 text-sm text-text-muted">
                        Thiết kế này chưa được gắn vào đơn hàng nào.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                          <thead>
                            <tr className="border-b border-border text-[11px] uppercase text-text-muted">
                              <th className="py-2 pr-3 font-semibold">Mã đơn</th>
                              <th className="py-2 pr-3 font-semibold">Ngày đặt</th>
                              <th className="py-2 pr-3 font-semibold">Size</th>
                              <th className="py-2 pr-3 font-semibold">SL</th>
                              <th className="py-2 pr-3 font-semibold">Đơn hàng</th>
                              <th className="py-2 pr-3 font-semibold">Sản xuất</th>
                              {/* <th className="py-2 text-right font-semibold">Thành tiền</th> */}
                            </tr>
                          </thead>
                          <tbody>
                            {relatedOrders.map((order) => (
                              <tr key={order.orderItemId} className="border-b border-border/70 last:border-0">
                                <td className="py-2 pr-3 font-semibold">
                                  <Link
                                    href={`/admin/don-hang/${order.orderId}`}
                                    className="text-primary hover:underline"
                                  >
                                    {order.maDonHang}
                                  </Link>
                                </td>
                                <td className="py-2 pr-3 text-text-secondary">{order.ngayDatDon}</td>
                                <td className="py-2 pr-3 text-text-secondary">{order.sizeAo || "-"}</td>
                                <td className="py-2 pr-3 text-text-secondary">{order.soLuong}</td>
                                <td className="py-2 pr-3 text-text-secondary">
                                  {getStatusLabel(order.trangThaiDonHang, ORDER_STATUS_LABELS)}
                                </td>
                                <td className="py-2 pr-3 text-text-secondary">
                                  {getStatusLabel(order.trangThaiSanXuat, PRODUCTION_STATUS_LABELS)}
                                </td>
                                {/* <td className="py-2 text-right font-semibold">
                                  {formatCurrency(order.thanhTien)}
                                </td> */}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Section>

                  <Section title="Ghi chú xử lý">
                    <p className="m-0 max-h-24 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-text-main">
                      {data.ghiChu || "Chưa có ghi chú cho thiết kế này."}
                    </p>
                  </Section>

                  {canApproveDesign ? (
                    <Section title="Xử lý thiết kế">
                      <div className="min-w-0">
                        <div className="design-revision-note-field">
                          <Input.TextArea
                            value={revisionNote}
                            rows={3}
                            maxLength={1000}
                            showCount
                            placeholder="Nhập nội dung cần khách chỉnh sửa..."
                            disabled={requestRevisionMutation.isPending || approveMutation.isPending}
                            onChange={(event) => setRevisionNote(event.target.value)}
                          />
                        </div>

                        {data.trangThai === "can_chinh_sua" ? (
                          <p className="mb-0 mt-2 text-xs leading-5 text-text-secondary">
                            Kiểm tra bản khách đã chỉnh sửa trước khi duyệt.
                          </p>
                        ) : null}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <Button
                              type="primary"
                              icon={<CheckOutlined />}
                              loading={approveMutation.isPending}
                              disabled={requestRevisionMutation.isPending}
                              onClick={() => {
                                modalApi.confirm({
                                  title: `Duyệt thiết kế ${data.maThietKe}?`,
                                  content:
                                    "Thiết kế sẽ chuyển sang trạng thái Đã duyệt. Sản phẩm chỉ được đưa vào hàng chờ in sau khi đơn hàng được xác nhận.",
                                  okText: "Duyệt thiết kế",
                                  cancelText: "Hủy",
                                  onOk: () => approveMutation.mutateAsync(),
                                });
                              }}
                            >
                              Duyệt thiết kế
                            </Button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              danger
                              icon={<EditOutlined />}
                              loading={requestRevisionMutation.isPending}
                              disabled={trimmedRevisionNote.length === 0 || approveMutation.isPending || (data.trangThai === "can_chinh_sua" && trimmedRevisionNote === data.ghiChu?.trim())}
                              onClick={() => {
                                if (data.trangThai === "can_chinh_sua") {
                                  modalApi.confirm({
                                    title: "Cập nhật yêu cầu chỉnh sửa?",
                                    content: "Hệ thống sẽ gửi thêm một email cập nhật đính chính đến cho khách hàng.",
                                    okText: "Gửi cập nhật",
                                    cancelText: "Hủy",
                                    onOk: () => requestRevisionMutation.mutateAsync(),
                                  });
                                } else {
                                  requestRevisionMutation.mutate();
                                }
                              }}
                            >
                              {data.trangThai === "can_chinh_sua" ? "Cập nhật yêu cầu chỉnh sửa" : "Yêu cầu chỉnh sửa"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Section>
                  ) : null}
                </section>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
