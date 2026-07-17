"use client";

import { Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthModal from "@/components/design-studio/AuthModal";
import { getDefaultRouteForRole } from "@/lib/authorization";
import { authService } from "@/services/authService";
import useAuthStore from "@/store/useAuthStore";

export default function HeaderAuthActions({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "register" }>({
    open: false,
    tab: "login",
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Server-side token revocation is best-effort; always clear the local session.
    } finally {
      clearSession();
      onNavigate?.();
      router.replace("/");
      router.refresh();
    }
  };

  if (!hydrated) return null;

  if (user) {
    return (
      <div className={mobile ? "flex flex-col gap-2" : "hidden items-center gap-2 md:flex"}>
        {user.role !== "CUSTOMER" ? (
          <Link href={getDefaultRouteForRole(user.role)} onClick={onNavigate}>
            <Button block={mobile}>{user.fullName}</Button>
          </Link>
        ) : (
          // Khách hàng: bấm vào tên để tới trang "Đơn hàng của tôi"
          <Link href="/tai-khoan/don-hang" onClick={onNavigate}>
            <Button block={mobile}>{user.fullName}</Button>
          </Link>
        )}
        <Button block={mobile} danger onClick={() => void logout()}>
          Đăng xuất
        </Button>
      </div>
    );
  }

  const openAuth = (tab: "login" | "register") => {
    onNavigate?.();
    setAuthModal({ open: true, tab });
  };

  return (
    <>
      <div className={mobile ? "flex flex-col gap-2" : "hidden items-center gap-2 md:flex"}>
        <Button block={mobile} onClick={() => openAuth("login")}>
          Đăng nhập
        </Button>
        <Button block={mobile} type="primary" onClick={() => openAuth("register")}>
          Đăng ký
        </Button>
      </div>

      <AuthModal
        isOpen={authModal.open}
        defaultTab={authModal.tab}
        theme="light"
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
        onSuccess={(session) => {
          // Điều hướng theo vai trò: nhân sự nội bộ về trang quản trị, khách ở lại trang hiện tại
          const destination = getDefaultRouteForRole(session.user.role);
          if (destination !== "/") {
            router.replace(destination);
            router.refresh();
          }
        }}
      />
    </>
  );
}
