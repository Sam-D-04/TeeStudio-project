"use client";

/**
 * QueryProvider.tsx – Cung cấp React Query context cho toàn bộ ứng dụng Admin.
 *
 * React Query cần một QueryClient duy nhất được đặt ở cấp cao nhất.
 * Vì layout.tsx là Server Component, nên phải tách provider này
 * thành một Client Component riêng.
 *
 * Cách dùng:
 *   Bọc <QueryProvider> trong layout.tsx (hoặc admin/layout.tsx)
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

type QueryProviderProps = {
  children: ReactNode;
};

export default function QueryProvider({ children }: QueryProviderProps) {
  // Dùng useState để tạo QueryClient một lần duy nhất cho mỗi lần mount.
  // Không khai báo ngoài component để tránh chia sẻ cache giữa các request SSR.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dữ liệu được coi là "cũ" sau 1 phút → tự động refetch
            staleTime: 60 * 1000,
            // Khi query thất bại, thử lại 1 lần trước khi báo lỗi
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
