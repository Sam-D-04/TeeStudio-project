/**
 * ProductCategories.tsx – Server Component
 * Fetch danh sách phôi áo từ API backend, render thẻ danh mục tĩnh.
 * Giao diện giữ nguyên, data (tên, giá) lấy từ DB.
 */

import ProductCategoriesClient from "./ProductCategoriesClient";

// ─── Kiểu dữ liệu từ API ──────────────────────────────────────────────────────
export interface ProductFromDB {
  id: number;
  name: string;
  form: "tshirt" | "polo" | "hoodie";
  basePrice: number;
  material: string;
  categoryName: string;
  imageUrl: string | null;
}

// ─── Fetch data ───────────────────────────────────────────────────────────────
async function getProducts(): Promise<ProductFromDB[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}/public/products`,
      { next: { revalidate: 60 } } // ISR: cache 60 giây
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// ─── UI config map (không lưu trong DB – thuần giao diện) ────────────────────
export const SHIRT_UI_MAP = {
  tshirt: {
    accentBg:    "linear-gradient(140deg, #e0f2fe 0%, #bae6fd 100%)",
    accentColor: "#0ea5e9",
    svgColor:    "#7dd3fc",
    mockupImg:   null as string | null,
    badge:       "Bán chạy",
    badgeBg:     "#dcfce7",
    badgeColor:  "#16a34a",
  },
  polo: {
    accentBg:    "linear-gradient(140deg, #cffafe 0%, #a5f3fc 100%)",
    accentColor: "#0891b2",
    svgColor:    "#67e8f9",
    mockupImg:   "/images/mockups/Polo-Navy-Front.png",
    badge:       "Đồng phục",
    badgeBg:     "#e0f2fe",
    badgeColor:  "#0284c7",
  },
  hoodie: {
    accentBg:    "linear-gradient(140deg, #ede9fe 0%, #c7d2fe 100%)",
    accentColor: "#6366f1",
    svgColor:    "#a5b4fc",
    mockupImg:   null as string | null,
    badge:       "Mới về",
    badgeBg:     "#fef9c3",
    badgeColor:  "#ca8a04",
  },
} as const;

// ─── Fallback khi API lỗi ────────────────────────────────────────────────────
const FALLBACK_PRODUCTS: ProductFromDB[] = [
  { id: 1, name: "Áo Thun",   form: "tshirt", basePrice: 145000, material: "Cotton 100%",   categoryName: "Áo Thun",   imageUrl: null },
  { id: 2, name: "Áo Polo",   form: "polo",   basePrice: 225000, material: "Vải cá sấu",    categoryName: "Áo Polo",   imageUrl: null },
  { id: 3, name: "Áo Hoodie", form: "hoodie", basePrice: 385000, material: "Nỉ dày",         categoryName: "Áo Hoodie", imageUrl: null },
];

// ─── Server Component ─────────────────────────────────────────────────────────
export default async function ProductCategories() {
  const products = await getProducts();

  // Nhóm theo form, chỉ lấy 1 product đại diện cho mỗi form
  const formOrder: ("tshirt" | "polo" | "hoodie")[] = ["tshirt", "polo", "hoodie"];
  const productMap = new Map(products.map((p) => [p.form, p]));

  const displayList = formOrder
    .map((form) => productMap.get(form))
    .filter(Boolean) as ProductFromDB[];

  // Nếu API trả về thiếu (hoặc lỗi), dùng fallback cho form còn thiếu
  const finalList = formOrder.map(
    (form) => displayList.find((p) => p.form === form) ?? FALLBACK_PRODUCTS.find((p) => p.form === form)!
  );

  return <ProductCategoriesClient products={finalList} />;
}
