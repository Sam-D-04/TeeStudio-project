"use client";

import InventoryPage from "@/components/admin/inventory/InventoryPage";

/**
 * InventoryClient – client boundary cho trang Quản lý Kho hàng.
 * Layout admin dùng chung nằm ở app/admin/layout.tsx.
 */
export default function InventoryClient({
  initialStockFilter,
}: {
  initialStockFilter?: string;
}) {
  return <InventoryPage initialStockFilter={initialStockFilter} />;
}
