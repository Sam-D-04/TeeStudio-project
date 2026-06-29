"use client";

import InventoryPage from "@/components/admin/inventory/InventoryPage";

/**
 * InventoryClient – client boundary cho trang Quản lý Kho hàng.
 * Layout admin dùng chung nằm ở app/admin/layout.tsx.
 */
export default function InventoryClient({
  initialStockFilter,
  initialVariantId,
  initialSearchKeyword,
}: {
  initialStockFilter?: string;
  initialVariantId?: number;
  initialSearchKeyword?: string;
}) {
  return (
    <InventoryPage
      initialStockFilter={initialStockFilter}
      initialVariantId={initialVariantId}
      initialSearchKeyword={initialSearchKeyword}
    />
  );
}
