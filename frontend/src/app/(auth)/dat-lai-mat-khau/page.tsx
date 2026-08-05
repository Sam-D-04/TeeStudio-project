import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md space-y-7 rounded-2xl bg-white p-8 shadow-lg">
        <Suspense fallback={<p className="text-center text-sm text-slate-600">Đang tải...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
