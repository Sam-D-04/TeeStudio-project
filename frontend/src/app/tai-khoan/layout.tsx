"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Popconfirm, Spin } from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import useAuthStore from "@/store/useAuthStore";
import { authService } from "@/services/authService";

const menuItems = [
  { key: "/tai-khoan/ho-so", label: "Hồ sơ của tôi", icon: <UserOutlined /> },
  { key: "/tai-khoan/dia-chi", label: "Sổ địa chỉ", icon: <EnvironmentOutlined /> },
  { key: "/tai-khoan/don-hang", label: "Đơn hàng của tôi", icon: <ShoppingCartOutlined /> },
];

export default function TaiKhoanLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Đăng xuất chủ động cũng làm user thành null, nhưng không được để guard bên
  // dưới "cướp" điều hướng và đá về trang đăng nhập thay vì trang chủ - cờ này
  // báo cho guard biết đây là logout có chủ đích, không phải phiên hết hạn.
  const isLoggingOutRef = useRef(false);

  // Khu vực tài khoản chỉ dành cho khách hàng đã đăng nhập - kiểm tra tập trung
  // ở layout để mọi tab con (hồ sơ, địa chỉ, đơn hàng) không cần lặp lại logic này.
  useEffect(() => {
    if (hydrated && !user && !isLoggingOutRef.current) {
      router.replace(`/dang-nhap?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, router, pathname]);

  const handleLogout = async () => {
    isLoggingOutRef.current = true;
    try {
      await authService.logout();
    } catch {
      // Thu hồi token phía server là best-effort, luôn xoá phiên cục bộ.
    } finally {
      clearSession();
      router.replace("/");
      router.refresh();
    }
  };

  if (!hydrated || !user) {
    return (
      <>
        <AppHeader />
        <main
          style={{
            minHeight: "100vh",
            backgroundColor: "#f1f5f9",
            paddingTop: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#f1f5f9",
          paddingTop: 80,
          paddingBottom: 64,
        }}
      >
        <div className="container-main">
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              Tài khoản của tôi
            </h1>
          </div>

          <div
            className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]"
          >
            {/* ── Sidebar (desktop) / Tabs ngang (mobile) ── */}
            <nav
              className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
            >
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.key);
                return (
                  <Link
                    key={item.key}
                    href={item.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#0284c7" : "#475569",
                      background: isActive ? "#e0f2fe" : "transparent",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.background = "#f0f9ff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      }
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}

              {/* Đăng xuất là hành động huỷ phiên, không phải điều hướng giữa các
                  tab - tách riêng bằng đường phân cách để không bị nhầm là một
                  mục trong danh sách điều hướng bên trên. Đây cũng là lối vào
                  đăng xuất duy nhất của khách (header chỉ còn tên/avatar). */}
              <div
                className="mx-1 border-l border-slate-200 lg:mx-0 lg:my-2 lg:border-l-0 lg:border-t"
                style={{ flexShrink: 0 }}
              />

              <Popconfirm
                title="Đăng xuất khỏi TeeStudio?"
                okText="Đăng xuất"
                cancelText="Huỷ"
                okButtonProps={{ danger: true }}
                onConfirm={() => void handleLogout()}
              >
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#dc2626",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <LogoutOutlined />
                  Đăng xuất
                </button>
              </Popconfirm>
            </nav>

            {/* ── Nội dung tab hiện tại ── */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                padding: 24,
                minWidth: 0,
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </>
  );
}
