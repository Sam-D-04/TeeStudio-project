/**
 * /product/[id]/page.tsx  – Server Component
 * Fetch chi tiết sản phẩm từ public API và render ProductDetailClient.
 * Không yêu cầu đăng nhập.
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import ProductDetailClient, {
  ProductDetail,
} from "@/components/product/ProductDetailClient";

// ─── Fetch data (Server Side) ─────────────────────────────────────────────────
async function getProduct(id: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}/public/products/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <AppHeader />
      <Suspense fallback={
        <div style={{ minHeight: "100vh", background: "#f1f5f9", paddingTop: 64 }}>
          <div className="container-main" style={{ padding: "80px 24px", display: "flex", justifyContent: "center" }}>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>Đang tải...</div>
          </div>
        </div>
      }>
        <ProductDetailClient product={product} />
      </Suspense>
      <AppFooter />
    </>
  );
}

// ─── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return { title: "Sản phẩm không tồn tại – TeeStudio" };
  }
  return {
    title: `${product.name} – TeeStudio`,
    description: `${product.name} – ${product.material}. Thiết kế áo in theo yêu cầu từ ${product.basePrice.toLocaleString("vi-VN")}đ tại TeeStudio.`,
  };
}
