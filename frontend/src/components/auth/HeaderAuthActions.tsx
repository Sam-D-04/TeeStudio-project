"use client";

import { Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
          <span className="px-2 text-sm font-semibold text-slate-700">{user.fullName}</span>
        )}
        <Button block={mobile} danger onClick={() => void logout()}>
          Đăng xuất
        </Button>
      </div>
    );
  }

  return (
    <div className={mobile ? "flex flex-col gap-2" : "hidden items-center gap-2 md:flex"}>
      <Link href="/dang-nhap" onClick={onNavigate}>
        <Button block={mobile}>Đăng nhập</Button>
      </Link>
      <Link href="/dang-ky" onClick={onNavigate}>
        <Button block={mobile} type="primary">
          Đăng ký
        </Button>
      </Link>
    </div>
  );
}
