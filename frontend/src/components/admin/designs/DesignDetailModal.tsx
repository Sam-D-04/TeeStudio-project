"use client";

import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PictureOutlined,
  ReloadOutlined,
  SkinOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Image, Input, Modal, Skeleton, message } from "antd";
import { isAxiosError } from "axios";
import { useState } from "react";
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

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["thiet-ke-chi-tiet", designId],
    queryFn: () => designService.layChiTietThietKe(designId!),
    enabled: open && designId !== null,
    staleTime: 30_000,
  });

  const requestRevisionMutation = useMutation({
    mutationFn: () =>
      designService.yeuCauChinhSuaThietKe(designId!, revisionNote.trim()),
    onSuccess: async () => {
      messageApi.success("Đã gửi yêu cầu chỉnh sửa thiết kế đến khách hàng");
      setRevisionNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-chi-tiet", designId] }),
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-danh-sach"] }),
        queryClient.invalidateQueries({ queryKey: ["thiet-ke-thong-ke"] }),
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
      ]);
    },
    onError: (error) => {
      messageApi.error(getApiErrorMessage(error));
    },
  });

  const trimmedRevisionNote = revisionNote.trim();
  const canApproveDesign =
    data?.trangThai === "cho_kiem_tra" || data?.trangThai === "can_chinh_sua";
  const handleClose = () => {
    setRevisionNote("");
    onClose();
  };

  return (
    <>
      {messageContextHolder}
      {modalContextHolder}
      <Modal
        open={open}
        onCancel={handleClose}
        width={1040}
        centered
        destroyOnHidden
        title={null}
        footer={
          <Button icon={<CloseOutlined />} onClick={handleClose}>
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

              {canApproveDesign ? (
                <div className="rounded-xl border border-primary-container/25 bg-primary-fixed/30 p-4">
                  <div className="text-sm font-bold text-text-main">Xử lý thiết kế</div>
                  <p className="mb-3 mt-1 text-xs leading-5 text-text-secondary">
                    {data.trangThai === "can_chinh_sua"
                      ? "Kiểm tra lại bản khách đã chỉnh sửa. Nếu thiết kế đã đạt yêu cầu, hãy duyệt trước khi xác nhận đơn hàng."
                      : "Nếu bản thiết kế đã đạt yêu cầu, hãy duyệt trước khi xác nhận đơn hàng."}
                  </p>
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

                  {data.trangThai === "cho_kiem_tra" ? (
                    <>
                      <div className="my-4 border-t border-border" />
                      <div className="text-sm font-bold text-text-main">
                        Phản hồi chỉnh sửa cho khách
                      </div>
                      <p className="mb-3 mt-1 text-xs leading-5 text-text-secondary">
                        Ghi rõ những nội dung cần thay đổi. Ghi chú này sẽ được lưu cùng thiết kế
                        để khách hàng theo dõi.
                      </p>
                      <Input.TextArea
                        value={revisionNote}
                        rows={4}
                        maxLength={1000}
                        showCount
                        placeholder="Ví dụ: Vui lòng tăng kích thước logo và căn giữa hình in mặt trước..."
                        disabled={requestRevisionMutation.isPending || approveMutation.isPending}
                        onChange={(event) => setRevisionNote(event.target.value)}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button
                          danger
                          type="primary"
                          icon={<EditOutlined />}
                          loading={requestRevisionMutation.isPending}
                          disabled={trimmedRevisionNote.length < 5 || approveMutation.isPending}
                          onClick={() => requestRevisionMutation.mutate()}
                        >
                          Yêu cầu chỉnh sửa thiết kế
                        </Button>
                      </div>
                      {trimmedRevisionNote.length > 0 && trimmedRevisionNote.length < 5 ? (
                        <p className="mb-0 mt-2 text-right text-xs font-medium text-red-600">
                          Ghi chú cần có ít nhất 5 ký tự.
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="mb-0 mt-3 text-xs text-text-secondary">
                      Ghi chú yêu cầu chỉnh sửa được hiển thị ở phía trên để đối chiếu.
                    </p>
                  )}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      )}
      </Modal>
    </>
  );
}
