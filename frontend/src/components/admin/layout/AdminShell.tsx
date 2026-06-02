"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="admin-dashboard-shell">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <AdminTopbar onMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="admin-content-area">
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
