import type { ReactNode } from "react";

/**
 * Layout cho nhóm route admin studio (toàn màn hình, không có AdminShell/menu).
 * Route group (admin-studio) không ảnh hưởng tới URL.
 */
export default function AdminStudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
