import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import VnpayReturnPage, {
  VnpayReturnLoading,
} from "@/components/payment/VnpayReturnPage";

export const metadata: Metadata = {
  title: "Kết quả thanh toán | TeeStudio",
  description: "Xác minh và hiển thị kết quả thanh toán VNPAY của TeeStudio.",
};

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-100 px-4 py-10 md:py-16">
      <Link
        href="/"
        className="mx-auto mb-8 flex w-fit items-center gap-2 text-lg font-extrabold text-text-main"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container text-white">
          T
        </span>
        TeeStudio
      </Link>

      <Suspense fallback={<VnpayReturnLoading />}>
        <VnpayReturnPage />
      </Suspense>
    </main>
  );
}
