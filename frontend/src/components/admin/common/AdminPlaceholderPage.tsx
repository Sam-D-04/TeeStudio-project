"use client";

import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
  statusLabel?: string;
};

export default function AdminPlaceholderPage({
  title,
  description,
  statusLabel = "Đang phát triển",
}: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <p className="text-label-bold font-bold uppercase text-primary-container">
          {statusLabel}
        </p>
        <h2 className="text-headline-lg-mobile font-extrabold leading-8 text-text-main md:text-headline-lg">
          {title}
        </h2>
        <p className="max-w-2xl text-body-md text-text-secondary">
          {description}
        </p>
      </section>

      <section className="admin-card p-6">
        <div className="max-w-3xl space-y-4">
          <h3 className="text-card-title font-bold text-text-main">
            Khu vực này chưa có chức năng chi tiết
          </h3>
          <p className="text-body-md text-text-secondary">
            Route đã được giữ trong layout quản trị để menu, topbar và thao tác Back/Forward của trình duyệt luôn ổn định.
          </p>
          <Link
            href="/admin"
            className="inline-flex h-control-h items-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-button-text font-semibold text-text-secondary transition-colors hover:border-tertiary-container hover:text-text-main"
          >
            <ArrowLeftOutlined />
            Về tổng quan
          </Link>
        </div>
      </section>
    </div>
  );
}
