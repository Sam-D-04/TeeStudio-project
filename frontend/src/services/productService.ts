// Địa chỉ gốc của API backend (đọc từ biến môi trường, fallback về localhost khi phát triển)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Một biến thể (variant) của sản phẩm: tổ hợp màu + size, có SKU và tồn kho riêng
export interface PublicVariant {
  id: number;
  color: string;
  colorHex: string;
  size: string;
  sku: string;
  stockQty: number;
}

// Một ảnh mockup của sản phẩm, gắn với 1 màu (colorHex) + 1 mặt (front/back)
export interface PublicProductImage {
  url: string;
  altText: string;
  isPrimary: boolean;
  colorHex: string;
  view: "front" | "back";
}

// Một mốc ưu đãi số lượng: mua từ minQty trở lên được giảm discountPercent %
export interface BulkPricingTier {
  minQty: number;
  discountPercent: number;
}

// Thông tin sản phẩm hiển thị công khai cho khách hàng (trang chi tiết sản phẩm, design studio...)
export interface PublicProduct {
  id: number;
  name: string;
  basePrice: number;
  form: string;
  variants: PublicVariant[];
  images: PublicProductImage[];
  bulkPricing: BulkPricingTier[];
}

// Lấy thông tin chi tiết một sản phẩm theo id, dùng cho trang chi tiết sản phẩm và design studio
export async function getProductById(productId: number): Promise<PublicProduct> {
  const res = await fetch(`${API_BASE}/public/products/${productId}`);
  if (!res.ok) throw new Error("Không tải được thông tin sản phẩm");
  const json = await res.json();
  return json.data as PublicProduct;
}
