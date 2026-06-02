"use client";

/**
 * ProductsClient – wrapper client component cho trang quản lý phôi áo.
 *
 * Next.js App Router yêu cầu các component có interactivity (useState, onClick,...)
 * phải được đánh dấu "use client".
 * File page.tsx là Server Component, nên cần file wrapper này để import ProductsPage.
 *
 * Pattern này giống OrdersClient.tsx trong module orders.
 */

import ProductsPage from "@/components/admin/products/ProductsPage";

export default function ProductsClient() {
  return <ProductsPage />;
}
