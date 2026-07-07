"use client";

import {
  CalendarOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PictureOutlined,
  ReloadOutlined,
  SkinOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Image, Modal, Skeleton } from "antd";
import * as designService from "@/services/admin/designService";
import DesignStatusBadge from "./DesignStatusBadge";

type DesignDetailModalProps = {
  designId: number | null;
  open: boolean;
  onClose: () => void;
};

type DetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
};

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex min-w-0 gap-3 rounded-xl border border-border bg-white p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {label}
        </div>
        <div className="mt-1 break-words text-sm font-semibold text-text-main">{value}</div>
      </div>
    </div>
  );
}

export default function DesignDetailModal({
  designId,
  open,
  onClose,
}: DesignDetailModalProps) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["thiet-ke-chi-tiet", designId],
    queryFn: () => designService.layChiTietThietKe(designId!),
    enabled: open && designId !== null,
    staleTime: 30_000,
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1040}
      centered
      destroyOnHidden
      title={null}
      footer={
        <Button icon={<CloseOutlined />} onClick={onClose}>
          Đóng
        </Button>
      }
      styles={{
        body: { maxHeight: "calc(100vh - 190px)", overflowY: "auto", paddingTop: 4 },
      }}
    >
      {isLoading ? (
        <div className="py-3">
          <Skeleton active avatar={{ shape: "square", size: 160 }} paragraph={{ rows: 7 }} />
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
        <div>
          <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4 pr-8">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                Chi tiết thiết kế khách hàng
              </p>
              <h2 className="mb-0 mt-1 text-2xl font-extrabold text-text-main">
                {data.maThietKe}
              </h2>
            </div>
            <DesignStatusBadge trangThai={data.trangThai} />
          </header>

          <div className="grid gap-6 lg:grid-cols-[minmax(360px,1.1fr)_minmax(340px,0.9fr)]">
            <section>
              <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-alt p-3">
                {data.urlPreview ? (
                  <Image
                    src={data.urlPreview}
                    alt={`Bản xem trước thiết kế ${data.maThietKe}`}
                    className="max-h-[520px] w-full rounded-xl object-contain"
                    rootClassName="flex w-full items-center justify-center"
                    preview={{ mask: "Bấm để phóng to" }}
                  />
                ) : (
                  <div className="flex min-h-[390px] w-full flex-col items-center justify-center gap-4 rounded-xl bg-white text-center text-text-muted">
                    <PictureOutlined className="text-5xl" />
                    <div>
                      <p className="m-0 font-semibold text-text-secondary">Chưa có ảnh xem trước</p>
                      <p className="mb-0 mt-1 text-xs">Màu áo: {data.tenMauAo}</p>
                    </div>
                  </div>
                )}
              </div>
              {data.urlPreview && (
                <p className="mb-0 mt-2 text-center text-xs text-text-muted">
                  Bấm vào ảnh để xem toàn màn hình và thu phóng.
                </p>
              )}
            </section>

            <section className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <DetailItem icon={<UserOutlined />} label="Khách hàng" value={data.tenKhachHang} />
                <DetailItem
                  icon={<PhoneOutlined />}
                  label="Số điện thoại"
                  value={data.soDienThoai || "Chưa cập nhật"}
                />
                <DetailItem icon={<SkinOutlined />} label="Sản phẩm" value={data.tenSanPham} />
                <DetailItem
                  icon={
                    <span
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: data.mauAo }}
                    />
                  }
                  label="Màu áo"
                  value={
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span>{data.tenMauAo}</span>
                      <span className="font-normal text-text-muted">({data.mauAo})</span>
                    </span>
                  }
                />
                <DetailItem icon={<EnvironmentOutlined />} label="Vị trí in" value={data.viTriIn} />
                <DetailItem icon={<CalendarOutlined />} label="Ngày gửi" value={data.ngayGui} />
              </div>

              <div className="rounded-xl border border-border bg-surface-alt p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Ghi chú xử lý
                </div>
                <p className="mb-0 mt-2 whitespace-pre-wrap text-sm leading-6 text-text-main">
                  {data.ghiChu || "Chưa có ghi chú cho thiết kế này."}
                </p>
              </div>
            </section>
          </div>
        </div>
      )}
    </Modal>
  );
}
