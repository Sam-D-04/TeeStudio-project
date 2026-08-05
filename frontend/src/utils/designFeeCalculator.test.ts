/**
 * designFeeCalculator.test.ts
 *
 * Kiểm tra sự nhất quán giữa FE (designFeeCalculator.ts) và BE
 * (admin.pricing.service.js – calculateBoundingBoxAreaFee).
 *
 * Chạy: npx jest src/utils/designFeeCalculator.test.ts
 *
 * Bộ test mẫu được thiết kế bao phủ 4 kịch bản:
 *   A. Canvas trống
 *   B. 1 logo nhỏ nằm gọn (≤ 100 cm²)
 *   C. 2 phần tử đè chồng lên nhau (bbox > sum → phải lấy sumFee)
 *   D. 2 phần tử ở 2 góc xa nhau (bbox >> sum → phải lấy sumFee)
 *   E. Thiết kế lớn tràn áo (> 600 cm²)
 *
 * PIXELS_PER_CM = 4.67  (khớp với backend)
 * Công thức BE: min(bboxFee, sumFee)
 */

import {
  calcDesignFee,
  calcBoundingBoxAreaCm2,
  calcSumIndividualAreasCm2,
  PIXELS_PER_CM_X,
  PIXELS_PER_CM_Y,
  FEE_TIERS,
  FEE_MAX,
} from "./designFeeCalculator";

// ── Helper tạo element mẫu ────────────────────────────────────────────
type MinElement = {
  id: string; type: "image" | "text"; x: number; y: number;
  width: number; height: number; rotation: number; side: "front" | "back";
};
function makeEl(
  x: number, y: number, w: number, h: number,
  opts: Partial<MinElement> = {}
): MinElement {
  return {
    id: Math.random().toString(36).slice(2),
    type: "image",
    x, y,
    width: w,
    height: h,
    rotation: 0,
    side: "front",
    ...opts,
  };
}

// ── Hàm BE mô phỏng (JavaScript thuần, khớp với admin.pricing.service.js) ───
// Dùng để cross-check: nếu FE và "BE-sim" cho kết quả giống nhau thì đúng.
const PX_X = PIXELS_PER_CM_X;
const PX_Y = PIXELS_PER_CM_Y;
function getFeeForArea(areaCm2: number): number {
  for (const t of FEE_TIERS) {
    if (areaCm2 <= t.maxAreaCm2) return t.fee;
  }
  return FEE_MAX;
}

/** Tính min(bboxFee, sumFee) cho MỘT mặt áo (không tách side) */
function beSimulateOneSide(elements: MinElement[]): number {
  if (!elements || elements.length === 0) return 0;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  elements.forEach((el) => {
    const w = el.width  ?? 0; // scaleX=1 (Konva commit sau resize)
    const h = el.height ?? 0;
    const x1 = el.x, y1 = el.y;
    const x2 = x1 + w, y2 = y1 + h;
    if (x1 < minX) minX = x1;
    if (y1 < minY) minY = y1;
    if (x2 > maxX) maxX = x2;
    if (y2 > maxY) maxY = y2;
  });

  const bboxArea = Math.max(0, maxX - minX) / PX_X * Math.max(0, maxY - minY) / PX_Y;
  const bboxFee  = getFeeForArea(bboxArea);

  const sumArea = elements.reduce((s, el) => {
    const w = el.width ?? 0, h = el.height ?? 0;
    return s + (w / PX_X) * (h / PX_Y);
  }, 0);
  const sumFee = getFeeForArea(sumArea);

  return Math.min(bboxFee, sumFee);
}

/**
 * Mô phỏng hàm calculateBoundingBoxAreaFee() của backend (đã sửa 2 mặt):
 * tách elements theo `side`, tính phí riêng từng mặt rồi cộng lại.
 */
function beSimulate(elements: MinElement[]): number {
  if (!elements || elements.length === 0) return 0;
  const front = elements.filter((el) => (el.side ?? "front") !== "back");
  const back  = elements.filter((el) => (el.side ?? "front") === "back");
  return beSimulateOneSide(front) + beSimulateOneSide(back);
}

// ── Test cases ───────────────────────────────────────────────────────────────

describe("designFeeCalculator — khớp với backend", () => {

  // A. Canvas trống
  test("A: canvas rỗng → 0đ", () => {
    const r = calcDesignFee([]);
    expect(r.fee).toBe(0);
    expect(r.label).toBe("Miễn phí");
    expect(r.bboxAreaCm2).toBe(0);
    expect(r.sumAreaCm2).toBe(0);
    expect(beSimulate([])).toBe(0);
  });

  // B. 1 logo nhỏ: 81.2 × 99.2 px ≈ 10 cm × 10 cm = 100 cm² (mức 1 đúng biên)
  test("B: 1 logo nhỏ 10×10 cm → 20.000đ, khớp BE", () => {
    const w = 10 * PX_X, h = 10 * PX_Y; // 81.2 × 99.2 px
    const els = [makeEl(100, 100, w, h)];
    const r = calcDesignFee(els);
    expect(r.fee).toBe(20000);
    expect(r.fee).toBe(beSimulate(els));
  });

  // C. 2 phần tử đè chồng hoàn toàn: bbox = sum → kết quả như nhau
  test("C: 2 phần tử đè chồng hoàn toàn → bbox = 2×sum → lấy sumFee", () => {
    const w = 10 * PX_X, h = 5 * PX_Y; // 10×5 cm = 50 cm² mỗi cái
    // Đặt cùng vị trí → bbox = 10×5 = 50 cm², sum = 100 cm²
    const els = [makeEl(50, 50, w, h), makeEl(50, 50, w, h)];
    const r = calcDesignFee(els);
    const bboxArea = calcBoundingBoxAreaCm2(els);
    const sumArea  = calcSumIndividualAreasCm2(els);
    // bbox = 50 cm² (≤100 → fee=20k), sum = 100 cm² (≤100 → fee=20k)
    expect(bboxArea).toBeCloseTo(50, 0);
    expect(sumArea).toBeCloseTo(100, 0);
    expect(r.fee).toBe(20000); // min(20k, 20k)
    expect(r.fee).toBe(beSimulate(els));
  });

  // D. 2 phần tử ở 2 góc xa: bbox >> sum → phải lấy sumFee (có lợi hơn cho khách)
  test("D: 2 logo nhỏ đặt 2 góc xa nhau → sumFee < bboxFee → lấy sumFee", () => {
    // Mỗi logo: 5×5 cm = 25 cm²; tổng sum = 50 cm² → fee = 20.000đ
    const w = 5 * PX_X, h = 5 * PX_Y;
    // Đặt cách nhau xa: bbox sẽ bao phủ vùng lớn hơn
    const els = [
      makeEl(0,   0,   w, h), // góc trên-trái
      makeEl(200, 200, w, h), // góc dưới-phải (cách 200/4.67 ≈ 43 cm)
    ];
    const bboxArea = calcBoundingBoxAreaCm2(els);
    const sumArea  = calcSumIndividualAreasCm2(els);
    const r = calcDesignFee(els);

    // bbox rất lớn (43+5)×(43+5) ≈ 2304 cm² → fee = 60k
    expect(bboxArea).toBeGreaterThan(600);
    // sum = 50 cm² → fee = 20k
    expect(sumArea).toBeCloseTo(50, 0);
    // FE chọn min → 20k
    expect(r.fee).toBe(20000);
    // FE == BE
    expect(r.fee).toBe(beSimulate(els));
  });

  // E. Thiết kế lớn: 1 hình in tràn áo 30×22 cm = 660 cm² → mức 3
  test("E: hình tràn áo > 600 cm² → 60.000đ, khớp BE", () => {
    const w = 30 * PX_X, h = 22 * PX_Y;
    const els = [makeEl(10, 10, w, h)];
    const r = calcDesignFee(els);
    expect(r.fee).toBe(60000);
    expect(r.label).toBe("60.000đ");
    expect(r.fee).toBe(beSimulate(els));
  });

  // F. Trường hợp biên: sum vượt 600 cm² nhưng bbox thấp hơn → lấy bboxFee
  test("F: nhiều phần tử nhỏ xếp sát nhau, sum > bbox → lấy bboxFee", () => {
    // 10 phần tử, mỗi cái 5×5 cm = 25 cm² → sum = 250 cm² (≤600 → 40k)
    // Xếp thành hàng ngang: bbox = (10×5)×5 = 250 cm² (≤600 → 40k) → min = 40k
    const w = 5 * PX_X, h = 5 * PX_Y;
    const els = Array.from({ length: 10 }, (_, i) =>
      makeEl(i * 5 * PX_X, 0, w, h)
    );
    const r = calcDesignFee(els);
    expect(r.fee).toBe(40000);
    expect(r.fee).toBe(beSimulate(els));
  });

  // G. Logo giống hệt nhau, cùng toạ độ, nhưng 1 cái ở mặt trước và 1 cái ở mặt sau
  //    → phải tính phí RIÊNG từng mặt (không được coi là "đè lên nhau" rồi miễn phí mặt sau)
  test("G: cùng vị trí nhưng khác mặt (front/back) → tính phí độc lập, cộng dồn", () => {
    const w = 10 * PX_X, h = 10 * PX_Y; // 10x10cm = 100cm² → 20.000đ mỗi mặt
    const els = [
      makeEl(100, 100, w, h, { side: "front" }),
      makeEl(100, 100, w, h, { side: "back" }),
    ];
    const r = calcDesignFee(els);
    expect(r.fee).toBe(40000); // 20.000đ (front) + 20.000đ (back), KHÔNG được là 20.000đ
    expect(r.front.fee).toBe(20000);
    expect(r.back.fee).toBe(20000);
    expect(r.fee).toBe(beSimulate(els));
  });

  // H. Chỉ có phần tử ở mặt sau (front trống) → vẫn phải tính phí, không được miễn phí
  test("H: chỉ thiết kế mặt sau (front trống) → vẫn tính phí bình thường", () => {
    const w = 30 * PX_X, h = 22 * PX_Y; // > 600cm² → 60.000đ
    const els = [makeEl(10, 10, w, h, { side: "back" })];
    const r = calcDesignFee(els);
    expect(r.fee).toBe(60000);
    expect(r.front.fee).toBe(0);
    expect(r.back.fee).toBe(60000);
    expect(r.fee).toBe(beSimulate(els));
  });

  // I. Phần tử thiếu field `side` (thiết kế cũ trước khi có 2 mặt) → mặc định coi là "front"
  test("I: phần tử thiếu side (thiết kế cũ) → mặc định tính vào mặt trước", () => {
    const w = 10 * PX_X, h = 10 * PX_Y;
    const legacyEl = makeEl(100, 100, w, h);
    delete (legacyEl as Partial<MinElement>).side;
    const r = calcDesignFee([legacyEl]);
    expect(r.fee).toBe(20000);
    expect(r.front.fee).toBe(20000);
    expect(r.back.fee).toBe(0);
  });

});

// ── Test hằng số khớp với backend ───────────────────────────────────────────

describe("Hằng số phải khớp với backend (admin.pricing.service.js)", () => {
  test("PIXELS_PER_CM_X và Y", () => {
    expect(PIXELS_PER_CM_X).toBe(8.12);
    expect(PIXELS_PER_CM_Y).toBe(9.92);
  });

  test("FEE_TIERS = [{100, 20000}, {600, 40000}]", () => {
    expect(FEE_TIERS[0].maxAreaCm2).toBe(100);
    expect(FEE_TIERS[0].fee).toBe(20000);
    expect(FEE_TIERS[1].maxAreaCm2).toBe(600);
    expect(FEE_TIERS[1].fee).toBe(40000);
  });

  test("FEE_MAX = 60000", () => {
    expect(FEE_MAX).toBe(60000);
  });
});
