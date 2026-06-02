"use client";

import type { ReactNode } from "react";
import { useState, useSyncExternalStore } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

type AdminShellProps = {
  children: ReactNode;
};

function subscribeToClientReady(onStoreChange: () => void) {
  const timerId = window.setTimeout(onStoreChange, 0);

  return () => {
    window.clearTimeout(timerId);
  };
}

function getClientReadySnapshot() {
  return true;
}

function getServerReadySnapshot() {
  return false;
}

export default function AdminShell({ children }: AdminShellProps) {
  const clientReady = useSyncExternalStore(
    subscribeToClientReady,
    getClientReadySnapshot,
    getServerReadySnapshot,
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const shellClassName = sidebarCollapsed
    ? "admin-dashboard-shell admin-dashboard-shell--sidebar-collapsed"
    : "admin-dashboard-shell";

  if (!clientReady) {
    return <div className="admin-dashboard-shell" suppressHydrationWarning />;
  }

  return (
    <div className={shellClassName}>
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />
      <AdminTopbar onMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="admin-content-area">
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
