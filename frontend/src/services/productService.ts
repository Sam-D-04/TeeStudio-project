// Địa chỉ gốc của API backend (đọc từ biến môi trường, fallback về localhost khi phát triển)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Một biến thể (variant) của sản phẩm: tổ hợp màu + size, có SKU và tồn kho riêng
export interface PublicVariant {
  id: number;
  color: string;
  size: string;
  sku: string;
  stockQty: number;
}

// Thông tin sản phẩm hiển thị công khai cho khách hàng (trang chi tiết sản phẩm, design studio...)
export interface PublicProduct {
  id: number;
  name: string;
  basePrice: number;
  form: string;
  variants: PublicVariant[];
  images: Array<{ url: string; altText: string; isPrimary: boolean }>;
}

// Lấy thông tin chi tiết một sản phẩm theo id, dùng cho trang chi tiết sản phẩm và design studio
export async function getProductById(productId: number): Promise<PublicProduct> {
  const res = await fetch(`${API_BASE}/public/products/${productId}`);
  if (!res.ok) throw new Error("Không tải được thông tin sản phẩm");
  const json = await res.json();
  return json.data as PublicProduct;
}
