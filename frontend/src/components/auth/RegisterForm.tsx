"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { authService } from "@/services/authService";
import useAuthStore from "@/store/useAuthStore";

export default function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(formData.password)) {
      setErrorMessage("Mật khẩu phải có tối thiểu 8 ký tự, gồm chữ và số.");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      setSession(session);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Đăng ký không thành công."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <AuthInput
        id="register-name"
        label="Họ và tên"
        value={formData.fullName}
        onChange={(value) => updateField("fullName", value)}
        autoComplete="name"
      />
      <AuthInput
        id="register-email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => updateField("email", value)}
        autoComplete="email"
      />
      <AuthInput
        id="register-phone"
        label="Số điện thoại"
        type="tel"
        value={formData.phone}
        onChange={(value) => updateField("phone", value)}
        autoComplete="tel"
      />
      <AuthInput
        id="register-password"
        label="Mật khẩu"
        type="password"
        value={formData.password}
        onChange={(value) => updateField("password", value)}
        autoComplete="new-password"
        minLength={8}
        hint="Tối thiểu 8 ký tự, gồm chữ và số."
      />
      <AuthInput
        id="register-confirm-password"
        label="Xác nhận mật khẩu"
        type="password"
        value={formData.confirmPassword}
        onChange={(value) => updateField("confirmPassword", value)}
        autoComplete="new-password"
        minLength={8}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="font-semibold text-sky-600 hover:text-sky-700">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}

function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  minLength,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  minLength?: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}
