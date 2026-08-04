/**
 * designFeeCalculator.ts
 *
 * Tính phụ phí thiết kế (designFee) dựa trên canvas elements của Design Studio.
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  QUAN TRỌNG — PHẢI ĐỒNG BỘ VỚI BACKEND                      ║
 * ║  File này phải cho kết quả GIỐNG HỆT hàm                    ║
 * ║  calculateBoundingBoxAreaFee() trong:                        ║
 * ║  backend/src/modules/pricing/admin.pricing.service.js        ║
 * ║                                                              ║
 * ║  Mọi thay đổi bậc giá / hằng số / thuật toán ở đây          ║
 * ║  đều PHẢI được cập nhật đồng thời ở backend và ngược lại.   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Thuật toán (khớp 100% với BE):
 *   0. Tách elements làm 2 mảng theo `side`: mặt trước (front) và mặt sau (back).
 *      Tính phí RIÊNG cho từng mặt rồi cộng lại — 2 mặt không được "đè" lên
 *      nhau khi tính Bounding Box, nếu không mặt sau sẽ bị tính miễn phí.
 *   Với mỗi mặt:
 *   1. Tính diện tích Bounding Box của các elements thuộc mặt đó → bboxFee
 *   2. Tính tổng diện tích rời rạc từng element (có nhân scaleX/scaleY) → sumFee
 *   3. Lấy min(bboxFee, sumFee) — luôn chọn mức giá có lợi hơn cho khách
 *
 * Tọa độ Konva:
 *   - (x, y) là GÓC TRÊN-TRÁI; góc dưới-phải = (x + width, y + height)
 *   - scaleX/scaleY thường = 1 sau khi resize (Konva commit scale vào width/height),
 *     nhưng vẫn phải nhân để nhất quán với cách BE đọc canvasData từ DB.
 *
 * Bậc giá (phải khớp với backend):
 *   - Canvas trống    →   0đ (miễn phí)
 *   - Diện tích ≤ 100 cm²  →  20.000đ  (Logo nhỏ)
 *   - Diện tích ≤ 600 cm²  →  40.000đ  (Hình tầm trung)
 *   - Diện tích  > 600 cm²  →  60.000đ  (In tràn áo)
 */

import type { DesignElement } from "@/store/useDesignStore";

export type PrintMethodDef = {
  id: number;
  code: string;
  name: string;
  extraCost: number;
};

// ─── Hằng số (phải khớp với admin.pricing.service.js) ───────────────────────

/** 
 * Tỷ lệ pixel / cm trên canvas
 * - Theo rộng ngực: 61 cm = 495 px => 1 cm ≈ 8.12 px
 * - Theo dài áo: 76 cm = 754 px => 1 cm ≈ 9.92 px
 */
export const PIXELS_PER_CM_X = 8.12;
export const PIXELS_PER_CM_Y = 9.92;

/** Bậc giá theo diện tích (cm²) */
export const FEE_TIERS = [
  { maxAreaCm2: 100, fee: 20000, label: "20.000đ" },
  { maxAreaCm2: 600, fee: 40000, label: "40.000đ" },
] as const;

export const FEE_MAX       = 60000;
export const FEE_MAX_LABEL = "60.000đ";

// ─── Hàm nội bộ ─────────────────────────────────────────────────────────────

/** Tra bảng bậc giá theo diện tích (cm²) */
function getFeeForArea(areaCm2: number): number {
  for (const tier of FEE_TIERS) {
    if (areaCm2 <= tier.maxAreaCm2) return tier.fee;
  }
  return FEE_MAX;
}

/**
 * Lấy nhãn tiếng Việt cho một mức phí.
 * Không dùng bảng tra FEE_TIERS vì tổng phí 2 mặt (front + back) có thể ra
 * một con số không trùng bậc giá nào (vd 20.000 + 40.000 = 60.000 trùng ngẫu
 * nhiên, nhưng 40.000 + 40.000 = 80.000 thì không) — format trực tiếp là an toàn nhất.
 */
function getLabelForFee(fee: number): string {
  if (fee === 0) return "Miễn phí";
  return `${fee.toLocaleString("vi-VN")}đ`;
}

/** Tách elements theo mặt áo; phần tử thiếu `side` (thiết kế cũ) mặc định là "front" */
function splitBySide(elements: DesignElement[]): {
  front: DesignElement[];
  back: DesignElement[];
} {
  const front: DesignElement[] = [];
  const back: DesignElement[] = [];
  for (const el of elements) {
    if ((el.side ?? "front") === "back") back.push(el);
    else front.push(el);
  }
  return { front, back };
}

/** Tính phí cho MỘT mặt áo (không tách side — caller phải tự lọc trước) */
function calcFeeForOneSide(elements: DesignElement[]): {
  fee: number;
  bboxAreaCm2: number;
  sumAreaCm2: number;
  areaCm2: number;
} {
  if (!elements || elements.length === 0) {
    return { fee: 0, bboxAreaCm2: 0, sumAreaCm2: 0, areaCm2: 0 };
  }

  const bboxAreaCm2 = calcBoundingBoxAreaCm2(elements);
  const bboxFee     = getFeeForArea(bboxAreaCm2);

  const sumAreaCm2    = calcSumIndividualAreasCm2(elements);
  const individualFee = getFeeForArea(sumAreaCm2);

  const fee     = Math.min(bboxFee, individualFee);
  const areaCm2 = fee === bboxFee ? bboxAreaCm2 : sumAreaCm2;

  return { fee, bboxAreaCm2, sumAreaCm2, areaCm2 };
}

// ─── Hàm export ─────────────────────────────────────────────────────────────

/**
 * Tính diện tích Bounding Box (cm²) bao trọn toàn bộ elements.
 * Xuất ra ngoài để dùng trong UI hiển thị thông tin debug nếu cần.
 */
export function calcBoundingBoxAreaCm2(elements: DesignElement[]): number {
  if (!elements || elements.length === 0) return 0;

  let minX = Infinity,  minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  elements.forEach((el) => {
    const scaleX = 1; // Konva commit scale vào width sau resize; giữ =1 nhất quán BE
    const scaleY = 1;
    const w = (el.width  ?? 0) * scaleX;
    const h = (el.height ?? 0) * scaleY;
    const x1 = el.x;
    const y1 = el.y;
    const x2 = x1 + w;
    const y2 = y1 + h;

    if (x1 < minX) minX = x1;
    if (y1 < minY) minY = y1;
    if (x2 > maxX) maxX = x2;
    if (y2 > maxY) maxY = y2;
  });

  const widthCm  = Math.max(0, maxX - minX) / PIXELS_PER_CM_X;
  const heightCm = Math.max(0, maxY - minY) / PIXELS_PER_CM_Y;
  return widthCm * heightCm;
}

/**
 * Tính tổng diện tích rời rạc (cm²) của từng element.
 * Khác với BBox: không bị phình to khi elements nằm phân tán.
 */
export function calcSumIndividualAreasCm2(elements: DesignElement[]): number {
  if (!elements || elements.length === 0) return 0;
  return elements.reduce((sum, el) => {
    const scaleX = 1; // Konva commit scale vào width sau resize
    const scaleY = 1;
    const w = (el.width  ?? 0) * scaleX;
    const h = (el.height ?? 0) * scaleY;
    return sum + (w / PIXELS_PER_CM_X) * (h / PIXELS_PER_CM_Y);
  }, 0);
}

/** Chi tiết phí của một mặt áo */
export type SideFeeInfo = {
  fee: number;
  bboxAreaCm2: number;
  sumAreaCm2: number;
  areaCm2: number;
};

/**
 * Tính phụ phí thiết kế — kết quả KHỚP với backend.
 *
 * Thuật toán: tách elements theo `side` (front/back), tính min(bboxFee, sumFee)
 * RIÊNG cho từng mặt, rồi cộng lại — 2 mặt áo được tính phí độc lập, không
 * "đè" bounding box lên nhau (nếu không mặt sau sẽ vô tình được in miễn phí).
 *
 * @param elements - Mảng phần tử từ useDesignStore (mặt trước + mặt sau)
 * @param printExtraCost - Phí in thêm của phương pháp in được chọn (từ DB)
 * @returns { fee, label, bboxAreaCm2, sumAreaCm2, front, back }
 */
export function calcDesignFee(elements: DesignElement[], printExtraCost: number = 0): {
  /** Tổng phí = phí mặt trước + phí mặt sau */
  fee: number;
  label: string;
  /** Tổng diện tích Bounding Box 2 mặt (cm²) — để hiển thị debug */
  bboxAreaCm2: number;
  /** Tổng diện tích rời rạc 2 mặt (cm²) — để hiển thị debug */
  sumAreaCm2: number;
  /** Giữ lại trường areaCm2 cũ (= tổng diện tích đại diện 2 mặt) để không break caller cũ */
  areaCm2: number;
  /** Chi tiết phí riêng mặt trước */
  front: SideFeeInfo;
  /** Chi tiết phí riêng mặt sau */
  back: SideFeeInfo;
} {
  // Canvas trống → miễn phí
  if (!elements || elements.length === 0) {
    const empty: SideFeeInfo = { fee: 0, bboxAreaCm2: 0, sumAreaCm2: 0, areaCm2: 0 };
    return { fee: 0, label: "Miễn phí", bboxAreaCm2: 0, sumAreaCm2: 0, areaCm2: 0, front: empty, back: empty };
  }

  const { front: frontElements, back: backElements } = splitBySide(elements);
  const front = calcFeeForOneSide(frontElements);
  const back  = calcFeeForOneSide(backElements);

  const baseFee = front.fee + back.fee;
  // Cộng thêm phụ phí phương pháp in (chỉ cộng nếu baseFee > 0, tức là có in)
  const fee = baseFee > 0 ? baseFee + printExtraCost : 0;

  return {
    fee,
    label: getLabelForFee(fee),
    bboxAreaCm2: front.bboxAreaCm2 + back.bboxAreaCm2,
    sumAreaCm2: front.sumAreaCm2 + back.sumAreaCm2,
    areaCm2: front.areaCm2 + back.areaCm2,
    front,
    back,
  };
}
