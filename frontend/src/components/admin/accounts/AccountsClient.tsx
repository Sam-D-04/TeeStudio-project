"use client";

/**
 * AccountsClient – Wrapper "use client" cho trang Tài khoản.
 * Next.js App Router yêu cầu tách biệt Server Component (page.tsx) và
 * Client Component (AccountsPage.tsx). Wrapper này đảm bảo đúng pattern.
 */

import { App } from "antd";
import AccountsPage from "@/components/admin/accounts/AccountsPage";

export default function AccountsClient() {
  return (
    <App>
      <AccountsPage />
    </App>
  );
}
