"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  canAccessAdminPath,
  getDefaultRouteForRole,
} from "@/lib/authorization";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { authService } from "@/services/authService";
import useAuthStore from "@/store/useAuthStore";

export default function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const session = await authService.login({ email, password });
      setSession(session);

      const requestedPath = new URLSearchParams(window.location.search).get("redirect");
      let destination = getDefaultRouteForRole(session.user.role);
      if (requestedPath?.startsWith("/")) {
        const canUseRequestedPath =
          session.user.role === "CUSTOMER"
            ? !requestedPath.startsWith("/admin")
            : canAccessAdminPath(session.user.role, requestedPath);
        if (canUseRequestedPath) destination = requestedPath;
      }

      router.replace(destination);
      router.refresh();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Đăng nhập không thành công."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          placeholder="ban@example.com"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="font-semibold text-sky-600 hover:text-sky-700">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
