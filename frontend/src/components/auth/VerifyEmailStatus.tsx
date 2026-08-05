"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { authService } from "@/services/authService";
import useAuthStore from "@/store/useAuthStore";

type VerifyState = "loading" | "success" | "error";

export default function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const updateUser = useAuthStore((state) => state.updateUser);
  const user = useAuthStore((state) => state.user);
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    if (!token) {
      setState("error");
      setMessage("Liên kết xác minh không hợp lệ.");
      return;
    }

    authService
      .verifyEmail(token)
      .then((responseMessage) => {
        setState("success");
        setMessage(responseMessage || "Xác minh email thành công.");
        if (user) {
          updateUser({ ...user, emailVerified: true });
        }
      })
      .catch((error) => {
        setState("error");
        setMessage(getApiErrorMessage(error, "Xác minh email không thành công."));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="text-center">
      {state === "loading" ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Đang xác minh email...
          </h1>
          <p className="mt-2 text-sm text-slate-600">Vui lòng chờ trong giây lát.</p>
        </>
      ) : null}

      {state === "success" ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-600">
            Xác minh email thành công
          </h1>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
          <Link
            href="/"
            className="mt-6 inline-flex justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            Về trang chủ
          </Link>
        </>
      ) : null}

      {state === "error" ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-red-600">
            Xác minh email thất bại
          </h1>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
          <Link
            href="/dang-nhap"
            className="mt-6 inline-flex justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            Đăng nhập lại
          </Link>
        </>
      ) : null}
    </div>
  );
}
