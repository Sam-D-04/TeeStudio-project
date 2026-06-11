import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md space-y-7 rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Đăng nhập TeeStudio
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Dành cho khách hàng và nhân sự nội bộ
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
