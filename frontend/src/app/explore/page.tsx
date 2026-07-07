"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Empty, Spin } from "antd";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const FORM_LABELS: Record<string, string> = {
  tshirt: "Áo Thun",
  polo:   "Áo Polo",
  hoodie: "Áo Hoodie",
};

const FORM_COLORS: Record<string, string> = {
  tshirt: "#0ea5e9",
  polo:   "#8b5cf6",
  hoodie: "#f59e0b",
};

interface Product {
  id: number;
  name: string;
  form: string;
  basePrice: number;
  material: string;
  categoryName: string;
  imageUrl: string | null;
}

function formatVND(v: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
}

export default function ExplorePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <AppHeader />
      <Suspense fallback={
        <div style={{ paddingTop: 144, display: "flex", justifyContent: "center" }}>
          <Spin size="large" />
        </div>
      }>
        <ExploreContent />
      </Suspense>
      <AppFooter />
    </div>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const q            = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState(q);

  const fetchProducts = useCallback(async (keyword: string) => {
    setLoading(true);
    try {
      const url = keyword.trim()
        ? `${API_BASE}/public/products?search=${encodeURIComponent(keyword.trim())}`
        : `${API_BASE}/public/products`;
      const res  = await fetch(url);
      const json = await res.json();
      setProducts((json.data as Product[]) ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearch(q);
    void fetchProducts(q);
  }, [q, fetchProducts]);

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    if (trimmed) router.push(`/explore?q=${encodeURIComponent(trimmed)}`);
    else         router.push("/explore");
  };

  return (
    <main style={{ paddingTop: 80, paddingBottom: 64 }}>
        <div className="container-main">

          {/* ── Page header ── */}
          <div style={{ padding: "36px 0 28px" }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              Khám phá sản phẩm
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 24px" }}>
              Tất cả các loại áo có sẵn tại TeeStudio
            </p>

            {/* Inline search bar */}
            <Input.Search
              placeholder="Tìm theo tên, chất liệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={handleSearch}
              allowClear
              onClear={() => handleSearch("")}
              size="large"
              style={{ maxWidth: 480, borderRadius: 10 }}
            />

            {q && (
              <p style={{ marginTop: 12, fontSize: 14, color: "#64748b" }}>
                Kết quả cho <strong style={{ color: "#0f172a" }}>"{q}"</strong>
                {" — "}{products.length} sản phẩm
              </p>
            )}
          </div>

          {/* ── Product grid ── */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "64px 0" }}>
              <Empty
                description={
                  <span style={{ color: "#64748b", fontSize: 15 }}>
                    {q ? `Không tìm thấy sản phẩm nào cho "${q}"` : "Chưa có sản phẩm nào"}
                  </span>
                }
              />
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  const formLabel = FORM_LABELS[product.form] ?? product.form;
  const formColor = FORM_COLORS[product.form] ?? "#64748b";

  return (
    <Link href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background:   "#fff",
          borderRadius: 14,
          border:       "1px solid #e2e8f0",
          overflow:     "hidden",
          cursor:       "pointer",
          transition:   "box-shadow 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        {/* Image */}
        <div style={{
          height: 200,
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }}
            />
          ) : (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#cbd5e1" strokeWidth="1.5" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
              {product.name}
            </h3>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px",
              borderRadius: 20, background: `${formColor}15`, color: formColor,
              flexShrink: 0, marginLeft: 8,
            }}>
              {formLabel}
            </span>
          </div>

          {product.material && (
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#94a3b8" }}>
              {product.material}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0ea5e9" }}>
              {formatVND(product.basePrice)}
            </span>
            <span style={{
              fontSize: 12, padding: "5px 12px", borderRadius: 8,
              background: "#f0f9ff", color: "#0ea5e9", fontWeight: 600,
              border: "1px solid #bae6fd",
            }}>
              Thiết kế ngay
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
