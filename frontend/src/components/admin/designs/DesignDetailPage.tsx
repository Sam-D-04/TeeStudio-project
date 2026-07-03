"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import * as designService from "@/services/admin/designService";
import DesignPreview from "./DesignPreview";
import DesignStatusBadge from "./DesignStatusBadge";

export default function DesignDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["thiet-ke-chi-tiet", id],
    queryFn: () => designService.layChiTietThietKe(id),
    enabled: Number.isInteger(id) && id > 0,
  });

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => router.push("/admin/thiet-ke")}
        className="flex w-fit items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary-container"
      >
        <ArrowLeftOutlined />
        Danh sách thiết kế khách hàng
      </button>

      {isLoading ? (
        <div className="admin-card p-8 text-sm text-text-secondary">Đang tải chi tiết thiết kế...</div>
      ) : isError || !data ? (
        <div className="admin-card p-8 text-sm text-error">Không thể tải thông tin thiết kế.</div>
      ) : (
        <section className="admin-card overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Thiết kế khách hàng</p>
              <h2 className="mt-1 text-2xl font-extrabold text-text-main">{data.maThietKe}</h2>
            </div>
            <DesignStatusBadge trangThai={data.trangThai} />
          </header>

          <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-border bg-surface-alt">
              {data.urlPreview ? (
                <Image
                  src={data.urlPreview}
                  alt={`Bản xem trước ${data.maThietKe}`}
                  width={640}
                  height={640}
                  unoptimized
                  className="h-full max-h-[360px] w-full rounded-xl object-contain"
                />
              ) : (
                <div className="scale-[3]">
                  <DesignPreview mauAo={data.mauAo} maThietKe={data.maThietKe} />
                </div>
              )}
            </div>

            <dl className="grid content-start gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                ["Khách hàng", data.tenKhachHang],
                ["Số điện thoại", data.soDienThoai || "Chưa cập nhật"],
                ["Sản phẩm", data.tenSanPham],
                ["Màu áo", data.tenMauAo],
                ["Vị trí in", data.viTriIn],
                ["Ngày gửi", data.ngayGui],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-text-main">{value}</dd>
                </div>
              ))}
              {data.ghiChu && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Ghi chú xử lý</dt>
                  <dd className="mt-1 rounded-lg bg-surface-alt p-3 text-sm text-text-main">{data.ghiChu}</dd>
                </div>
              )}
            </dl>
          </div>
        </section>
      )}
    </div>
  );
}
