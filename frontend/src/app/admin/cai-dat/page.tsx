import type { Metadata } from "next";
import SettingsClient from "@/components/admin/settings/SettingsClient";

/**
 * Trang Cài đặt quản trị – /admin/cai-dat
 *
 * Đây là Server Component (không có "use client").
 * Nó chỉ khai báo metadata (SEO) và render SettingsClient.
 *
 * Tại sao tách ra như vậy?
 * - Metadata (title, description) chỉ hoạt động ở Server Component.
 * - SettingsClient cần "use client" vì dùng useState để chuyển tab.
 * → Đây là pattern chuẩn của Next.js App Router.
 */

export const metadata: Metadata = {
  title: "Cài đặt - TeeStudio Quản trị",
  description: "Quản lý tài khoản nội bộ, phân quyền và cấu hình vận hành hệ thống TeeStudio.",
};

export default function CaiDatPage() {
  // Render client component chứa toàn bộ UI trang Cài đặt
  return <SettingsClient />;
}
