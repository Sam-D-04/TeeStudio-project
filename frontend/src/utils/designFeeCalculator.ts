/**
 * designFeeCalculator.ts
 * 
 * Tính phụ phí thiết kế (designFee) dựa trên diện tích bao phủ (Bounding Box)
 * của toàn bộ các phần tử trên canvas.
 *
 * Thuật toán Bounding Box:
 *   - Vẽ 1 hình chữ nhật ảo bao trọn tất cả item (dù chúng có đè lên nhau).
 *   - Đổi diện tích từ px² sang cm² (tỷ lệ: 1 cm = 15 px).
 *   - Đối chiếu với 3 bậc giá để trả về designFee.
 *
 * Lưu ý về tọa độ Konva:
 *   - Trong Konva, `x` và `y` của phần tử là GÓC TRÊN-TRÁI (khác Fabric.js dùng tâm).
 *   - Góc phải-dưới = (x + width, y + height).
 *
 * Bậc giá:
 *   - Mức 1: Bao phủ <= 100 cm²  → 0đ       (Cụm logo/chữ nhỏ)
 *   - Mức 2: Bao phủ <= 600 cm²  → 30.000đ  (Hình in cỡ A4)
 *   - Mức 3: Bao phủ >  600 cm²  → 60.000đ  (Hình in tràn áo)
 */

import type { DesignElement } from "@/store/useDesignStore";

/** Tỷ lệ quy đổi: 1 cm = 4.67 pixels trên canvas (Dựa trên vùng in 200x240px tương đương 45x49cm) */
export const PIXELS_PER_CM = 4.67;

/** Bậc giá theo diện tích (cm²) */
export const FEE_TIERS = [
  { maxAreaCm2: 100, fee: 0,     label: "Miễn phí" },
  { maxAreaCm2: 600, fee: 30000, label: "30.000đ"  },
] as const;

export const FEE_MAX    = 60000;
export const FEE_MAX_LABEL = "60.000đ";

/**
 * Tính toán tổng diện tích Bounding Box (cm²) của toàn bộ các phần tử.
 * @param elements - Mảng phần tử thiết kế từ useDesignStore
 * @returns totalAreaCm2 – Diện tích bao phủ tính bằng cm²
 */
export function calcBoundingBoxAreaCm2(elements: DesignElement[]): number {
  if (!elements || elements.length === 0) return 0;

  let minX = Infinity,  minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  elements.forEach((el) => {
    // Konva: (x, y) là góc trên-trái của phần tử
    const x1 = el.x;
    const y1 = el.y;
    const x2 = el.x + (el.width  ?? 0);
    const y2 = el.y + (el.height ?? 0);

    if (x1 < minX) minX = x1;
    if (y1 < minY) minY = y1;
    if (x2 > maxX) maxX = x2;
    if (y2 > maxY) maxY = y2;
  });

  const widthCm  = Math.max(0, maxX - minX) / PIXELS_PER_CM;
  const heightCm = Math.max(0, maxY - minY) / PIXELS_PER_CM;
  return widthCm * heightCm;
}

/**
 * Tính phụ phí thiết kế dựa trên diện tích Bounding Box.
 * @param elements - Mảng phần tử thiết kế từ useDesignStore
 * @returns { fee, label, areaCm2 }
 */
export function calcDesignFee(elements: DesignElement[]): {
  fee: number;
  label: string;
  areaCm2: number;
} {
  const areaCm2 = calcBoundingBoxAreaCm2(elements);

  for (const tier of FEE_TIERS) {
    if (areaCm2 <= tier.maxAreaCm2) {
      return { fee: tier.fee, label: tier.label, areaCm2 };
    }
  }

  return { fee: FEE_MAX, label: FEE_MAX_LABEL, areaCm2 };
}
