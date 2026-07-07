"use client";

import {
  ArrowLeftOutlined,
  CodeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import * as designService from "@/services/admin/designService";

type JsonRecord = Record<string, unknown>;

function laObject(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function demPhanTuTrongView(value: unknown): number {
  if (!laObject(value)) return 0;
  return Array.isArray(value.elements) ? value.elements.length : 0;
}

function phanTichCanvasData(canvasData: unknown) {
  if (!laObject(canvasData)) {
    return {
      format: canvasData == null ? "Chưa có dữ liệu" : "Chuỗi hoặc kiểu dữ liệu chưa xác định",
      version: "Không xác định",
      elementCount: 0,
    };
  }

  const version = canvasData.schemaVersion ?? canvasData.version ?? "Không xác định";

  if (Array.isArray(canvasData.elements)) {
    return {
      format: "elements (Design Studio hiện tại)",
      version: String(version),
      elementCount: canvasData.elements.length,
    };
  }

  if (Array.isArray(canvasData.objects)) {
    return {
      format: "objects (định dạng Fabric)",
      version: String(version),
      elementCount: canvasData.objects.length,
    };
  }

  if (laObject(canvasData.views)) {
    const elementCount = Object.values(canvasData.views).reduce<number>(
      (total, view) => total + demPhanTuTrongView(view),
      0
    );
    return {
      format: "views (thiết kế nhiều mặt)",
      version: String(version),
      elementCount,
    };
  }

  return {
    format: "JSON chưa nhận diện",
    version: String(version),
    elementCount: 0,
  };
}

function dinhDangNgay(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Không xác định"
    : date.toLocaleString("vi-VN");
}

function nhanTrangThaiCanvas(state: designService.TrangThaiDuLieuCanvas) {
  if (state === "VALID") return "JSON hợp lệ";
  if (state === "EMPTY") return "Chưa có dữ liệu";
  return "JSON không hợp lệ";
}

export default function DesignDataWorkspace() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-design-editor-data", id],
    queryFn: () => designService.layDuLieuEditorThietKe(id),
    enabled: Number.isInteger(id) && id > 0,
  });

  const canvasSummary = useMemo(
    () => phanTichCanvasData(data?.canvasData),
    [data?.canvasData]
  );
  const canvasJson = useMemo(
    () => JSON.stringify(data?.canvasData ?? null, null, 2),
    [data?.canvasData]
  );

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => router.push(`/admin/thiet-ke/${id}`)}
        className="flex w-fit items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary-container"
      >
        <ArrowLeftOutlined />
        Quay lại chi tiết thiết kế
      </button>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <InfoCircleOutlined className="mt-0.5" />
        <div>
          <p className="font-semibold">Workspace nền tảng đang ở chế độ chỉ đọc</p>
          <p className="mt-1">
            Trang này chỉ kiểm tra dữ liệu nguồn để chuẩn bị tích hợp editor admin;
            không có thao tác tạo, sửa hoặc ghi dữ liệu xuống database.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-card p-8 text-sm text-text-secondary">
          Đang tải dữ liệu nguồn thiết kế...
        </div>
      ) : isError || !data ? (
        <div className="admin-card p-8 text-sm text-error">
          Không thể tải dữ liệu nguồn của thiết kế.
        </div>
      ) : (
        <>
          <section className="admin-card overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Dữ liệu editor phía admin
                </p>
                <h1 className="mt-1 text-2xl font-extrabold text-text-main">
                  {data.designCode} · {data.name}
                </h1>
              </div>
              <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-semibold text-text-secondary">
                {data.status}
              </span>
            </header>

            <div className="grid gap-6 p-6 lg:grid-cols-[280px_1fr]">
              <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-alt">
                {data.previewUrl ? (
                  <Image
                    src={data.previewUrl}
                    alt={`Bản xem trước ${data.designCode}`}
                    width={720}
                    height={720}
                    unoptimized
                    className="h-full max-h-[420px] w-full object-contain"
                  />
                ) : (
                  <div className="px-6 text-center text-sm text-text-secondary">
                    Chưa có ảnh preview
                  </div>
                )}
              </div>

              <dl className="grid content-start gap-x-8 gap-y-5 sm:grid-cols-2">
                {[
                  ["Khách hàng", data.owner.fullName],
                  ["Email", data.owner.email || "Chưa cập nhật"],
                  ["Số điện thoại", data.owner.phone || "Chưa cập nhật"],
                  ["Sản phẩm", data.product.name],
                  ["Dáng áo", data.product.form || "Chưa xác định"],
                  ["Biến thể", data.variant ? `${data.variant.color || "—"} / ${data.variant.size || "—"}` : "Không có"],
                  ["SKU", data.variant?.sku || "Không có"],
                  ["Màu nền", data.baseColor || "Chưa xác định"],
                  ["Phụ phí thiết kế", `${data.designFee.toLocaleString("vi-VN")}đ`],
                  ["Cập nhật lần cuối", dinhDangNgay(data.updatedAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words text-sm font-medium text-text-main">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="admin-card overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <CodeOutlined className="text-lg text-primary-container" />
                <div>
                  <h2 className="font-bold text-text-main">Chẩn đoán canvasData</h2>
                  <p className="mt-1 text-xs text-text-secondary">
                    Chỉ phân tích cấu trúc, không chuyển đổi hoặc ghi lại JSON.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-semibold text-text-secondary">
                {nhanTrangThaiCanvas(data.canvasDataState)}
              </span>
            </header>

            <div className="grid gap-4 border-b border-border p-6 sm:grid-cols-3">
              {[
                ["Định dạng nhận diện", canvasSummary.format],
                ["Phiên bản schema", canvasSummary.version],
                ["Số phần tử nhận diện", String(canvasSummary.elementCount)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-surface-alt p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-text-main">{value}</p>
                </div>
              ))}
            </div>

            <div className="p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                JSON nguồn
              </p>
              <pre className="max-h-[560px] overflow-auto rounded-xl bg-slate-950 p-5 text-xs leading-6 text-slate-100">
                {canvasJson}
              </pre>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
