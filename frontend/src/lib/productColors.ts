export type ProductColor = {
  name: string;
  hex: string;
};

export const FALLBACK_PRODUCT_COLOR = "#94a3b8";

/**
 * Bảng màu gợi ý ban đầu. Đây chỉ là gợi ý giao diện, không giới hạn màu
 * người dùng có thể tạo thêm.
 */
export const DEFAULT_PRODUCT_COLORS: ProductColor[] = [
  { name: "Đen", hex: "#1a1a1a" },
  { name: "Trắng", hex: "#ffffff" },
  { name: "Trắng sữa", hex: "#f8f5f0" },
  { name: "Xám", hex: "#6b7280" },
  { name: "Xám nhạt", hex: "#d1d5db" },
  { name: "Xanh hải quân", hex: "#1e3a8a" },
  { name: "Xanh dương", hex: "#2563eb" },
  { name: "Xanh lá", hex: "#16a34a" },
  { name: "Đỏ", hex: "#dc2626" },
  { name: "Cam", hex: "#ea580c" },
  { name: "Vàng", hex: "#ca8a04" },
  { name: "Hồng", hex: "#ec4899" },
  { name: "Tím", hex: "#7c3aed" },
  { name: "Nâu", hex: "#92400e" },
  { name: "Be", hex: "#d4b896" },
];

export function mergeProductColors(
  ...groups: Array<ReadonlyArray<ProductColor> | undefined>
): ProductColor[] {
  const colors = new Map<string, ProductColor>();

  for (const group of groups) {
    for (const color of group ?? []) {
      const name = color.name.trim();
      if (!name) continue;

      const key = name.toLocaleLowerCase("vi-VN");
      if (!colors.has(key)) {
        colors.set(key, {
          name,
          hex: /^#[0-9a-fA-F]{6}$/.test(color.hex)
            ? color.hex.toLowerCase()
            : FALLBACK_PRODUCT_COLOR,
        });
      }
    }
  }

  return Array.from(colors.values());
}
