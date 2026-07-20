import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md space-y-7 rounded-2xl bg-white p-8 shadow-lg">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
