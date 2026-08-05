"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { authService } from "@/services/authService";

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-red-600">
          Liên kết không hợp lệ
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Liên kết đặt lại mật khẩu bị thiếu hoặc không hợp lệ.
        </p>
        <Link
          href="/quen-mat-khau"
          className="mt-6 inline-flex justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
        >
          Yêu cầu liên kết mới
        </Link>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-emerald-600">
          Đặt lại mật khẩu thành công
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Vui lòng đăng nhập lại bằng mật khẩu mới.
        </p>
        <Link
          href="/dang-nhap"
          className="mt-6 inline-flex justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!PASSWORD_PATTERN.test(password)) {
      setErrorMessage("Mật khẩu phải có tối thiểu 8 ký tự, gồm chữ và số.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setIsDone(true);
      setTimeout(() => router.replace("/dang-nhap"), 3000);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Đặt lại mật khẩu không thành công."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đặt lại mật khẩu</h1>
        <p className="mt-2 text-sm text-slate-600">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <div>
        <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700">
          Mật khẩu mới
        </label>
        <input
          id="reset-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
        <p className="mt-1 text-xs text-gray-500">Tối thiểu 8 ký tự, gồm chữ và số.</p>
      </div>

      <div>
        <label
          htmlFor="reset-password-confirm"
          className="block text-sm font-medium text-gray-700"
        >
          Xác nhận mật khẩu mới
        </label>
        <input
          id="reset-password-confirm"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );
}
