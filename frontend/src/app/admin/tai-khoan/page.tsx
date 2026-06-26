import type { Metadata } from "next";
import AccountsClient from "@/components/admin/accounts/AccountsClient";

export const metadata: Metadata = {
  title: "Quản lý Tài khoản | TeeStudio Admin",
  description:
    "Quản lý tài khoản khách hàng và nhân sự nội bộ của TeeStudio.",
};

/**
 * Page route: /admin/tai-khoan
 * Server Component – render metadata SEO và giao tiếp với client component.
 */
export default function TaiKhoanPage() {
  return <AccountsClient />;
}
