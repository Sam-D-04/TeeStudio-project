"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { App } from "antd";
import {
  canAccessAdminPath,
  getDefaultRouteForRole,
  isInternalRole,
} from "@/lib/authorization";
import useAuthStore from "@/store/useAuthStore";
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
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
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

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace(`/dang-nhap?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isInternalRole(user.role)) {
      router.replace("/");
      return;
    }

    if (!canAccessAdminPath(user.role, pathname)) {
      router.replace(getDefaultRouteForRole(user.role));
    }
  }, [hydrated, pathname, router, user]);

  if (!clientReady || !hydrated || !user || !canAccessAdminPath(user.role, pathname)) {
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
        <main className="admin-main">
          <App component="div" className="contents">
            {children}
          </App>
        </main>
      </div>
    </div>
  );
}
