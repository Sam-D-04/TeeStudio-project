"use client";

import Link from "next/link";
import { useState } from "react";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { authService } from "@/services/authService";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const responseMessage = await authService.forgotPassword(email);
      setMessage(
        responseMessage ||
          "Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.",
      );
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể gửi yêu cầu. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (message) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kiểm tra email</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
        <Link
          href="/dang-nhap"
          className="mt-6 inline-flex justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-slate-600">
          Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
        </p>
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
        <label htmlFor="forgot-password-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="forgot-password-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/dang-nhap" className="font-semibold text-sky-600 hover:text-sky-700">
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
