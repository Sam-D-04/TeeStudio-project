/**
 * ProductShowcase.tsx – Server Component (Phương án B)
 * Hiển thị các màu áo nổi bật còn hàng từ bảng productvariant trong DB.
 * Fetch server-side, không cần useState hay useEffect.
 */

import ProductShowcaseClient from "./ProductShowcaseClient";

// ─── Kiểu dữ liệu từ API ──────────────────────────────────────────────────────
export interface ColorVariantFromDB {
  color: string;
  form: "tshirt" | "polo" | "hoodie";
  productName: string;
  basePrice: number;
  totalStock: number;
}

// ─── Fetch data ───────────────────────────────────────────────────────────────
async function getColorVariants(): Promise<ColorVariantFromDB[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}/public/products/colors`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// ─── Server Component ─────────────────────────────────────────────────────────
export default async function ProductShowcase() {
  const variants = await getColorVariants();
  return <ProductShowcaseClient variants={variants} />;
}
