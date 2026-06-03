"use client";

/**
 * SettingsClient – Wrapper client cho trang Cài đặt.
 *
 * Next.js App Router yêu cầu mọi component dùng React hooks (useState, useEffect...)
 * phải được đánh dấu "use client". Vì SettingsPage dùng useState để quản lý tab,
 * ta cần đặt "use client" ở đây và import SettingsPage vào.
 *
 * Cách hoạt động:
 * - page.tsx (Server Component) import SettingsClient
 * - SettingsClient (Client Component) import SettingsPage
 * - SettingsPage chứa toàn bộ UI và logic
 */

import SettingsPage from "@/components/admin/settings/SettingsPage";

export default function SettingsClient() {
  // Client wrapper đơn giản – chỉ render SettingsPage
  // Logic thực tế nằm trong SettingsPage
  return <SettingsPage />;
}
