/**
 * verify-fee-parity.mjs
 *
 * Script kiểm tra sự nhất quán giữa FE và BE trong tính phụ phí thiết kế.
 * Chạy: node verify-fee-parity.mjs
 *
 * KHÔNG cần build hay cài Jest. Script này tự định nghĩa lại hàm từ
 * designFeeCalculator.ts và calculateBoundingBoxAreaFee() để so sánh.
 */

// ─── Hằng số (phải khớp với cả 2 file gốc) ──────────────────────────────────
const PIXELS_PER_CM_X = 8.12;
const PIXELS_PER_CM_Y = 9.92;
const FEE_TIERS = [
  { maxAreaCm2: 100, fee: 20000 },
  { maxAreaCm2: 600, fee: 40000 },
];
const FEE_MAX = 60000;

function getFeeForArea(areaCm2) {
  for (const t of FEE_TIERS) {
    if (areaCm2 <= t.maxAreaCm2) return t.fee;
  }
  return FEE_MAX;
}

// ─── FE mới (designFeeCalculator.ts sau khi sửa) ────────────────────────────
function feSimOneSide(elements) {
  if (!elements || elements.length === 0) return 0;

  // Cách 1: bbox
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  elements.forEach(el => {
    const w = el.width ?? 0, h = el.height ?? 0;
    const x1 = el.x, y1 = el.y, x2 = x1 + w, y2 = y1 + h;
    if (x1 < minX) minX = x1; if (y1 < minY) minY = y1;
    if (x2 > maxX) maxX = x2; if (y2 > maxY) maxY = y2;
  });
  const bboxArea = Math.max(0, maxX - minX) / PIXELS_PER_CM_X * Math.max(0, maxY - minY) / PIXELS_PER_CM_Y;
  const bboxFee  = getFeeForArea(bboxArea);

  // Cách 2: sum individuals
  const sumArea = elements.reduce((s, el) => {
    const w = el.width ?? 0, h = el.height ?? 0;
    return s + (w / PIXELS_PER_CM_X) * (h / PIXELS_PER_CM_Y);
  }, 0);
  const sumFee = getFeeForArea(sumArea);

  return Math.min(bboxFee, sumFee);
}

function splitBySide(elements) {
  const front = elements.filter(el => (el.side ?? "front") !== "back");
  const back  = elements.filter(el => (el.side ?? "front") === "back");
  return { front, back };
}

function feSim(elements) {
  if (!elements || elements.length === 0) return 0;
  const { front, back } = splitBySide(elements);
  return feSimOneSide(front) + feSimOneSide(back);
}

// ─── BE (calculateBoundingBoxAreaFee trong admin.pricing.service.js) ─────────
function beSimOneSide(elements) {
  if (!elements || elements.length === 0) return 0;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  elements.forEach(item => {
    const scaleX = item.scaleX ?? 1, scaleY = item.scaleY ?? 1;
    const w = (item.width ?? item.w ?? 0) * scaleX;
    const h = (item.height ?? item.h ?? 0) * scaleY;
    const x1 = item.left ?? item.x ?? 0, y1 = item.top ?? item.y ?? 0;
    const x2 = x1 + w, y2 = y1 + h;
    if (x1 < minX) minX = x1; if (y1 < minY) minY = y1;
    if (x2 > maxX) maxX = x2; if (y2 > maxY) maxY = y2;
  });
  const bboxArea = Math.max(0, maxX - minX) / PIXELS_PER_CM_X * Math.max(0, maxY - minY) / PIXELS_PER_CM_Y;
  const bboxFee  = getFeeForArea(bboxArea);

  let sumArea = 0;
  elements.forEach(item => {
    const scaleX = item.scaleX ?? 1, scaleY = item.scaleY ?? 1;
    const w = (item.width ?? item.w ?? 0) * scaleX;
    const h = (item.height ?? item.h ?? 0) * scaleY;
    sumArea += (w / PIXELS_PER_CM_X) * (h / PIXELS_PER_CM_Y);
  });
  const sumFee = getFeeForArea(sumArea);

  return Math.min(bboxFee, sumFee);
}

function beSim(elements) {
  if (!elements || elements.length === 0) return 0;
  const { front, back } = splitBySide(elements);
  return beSimOneSide(front) + beSimOneSide(back);
}

// ─── Helper ──────────────────────────────────────────────────────────────────
const PX_X = PIXELS_PER_CM_X;
const PX_Y = PIXELS_PER_CM_Y;
function el(x, y, w, h, side = "front") { return { x, y, width: w, height: h, side }; }

// ─── Test cases ──────────────────────────────────────────────────────────────
const cases = [
  {
    name: "A: Canvas trống",
    elements: [],
    expectedFee: 0,
  },
  {
    name: "B: 1 logo nhỏ 10×10 cm (100 cm² = biên mức 1)",
    elements: [el(100, 100, 10 * PX_X, 10 * PX_Y)],
    expectedFee: 20000,
  },
  {
    name: "C: 2 phần tử đè chồng cùng vị trí (bbox=50cm², sum=100cm² → cùng mức 20k)",
    elements: [el(50, 50, 10 * PX_X, 5 * PX_Y), el(50, 50, 10 * PX_X, 5 * PX_Y)],
    expectedFee: 20000,
  },
  {
    name: "D: 2 logo 5×5cm ở 2 góc xa nhau → sumFee(20k) < bboxFee(60k) → 20k",
    elements: [el(0, 0, 5 * PX_X, 5 * PX_Y), el(200, 200, 5 * PX_X, 5 * PX_Y)],
    expectedFee: 20000,
  },
  {
    name: "E: Hình tràn áo 30×22 cm = 660 cm² → mức max 60k",
    elements: [el(10, 10, 30 * PX_X, 22 * PX_Y)],
    expectedFee: 60000,
  },
  {
    name: "F: 10 phần tử 5×5cm xếp ngang (sum=250cm², bbox=250cm² → 40k)",
    elements: Array.from({ length: 10 }, (_, i) => el(i * 5 * PX_X, 0, 5 * PX_X, 5 * PX_Y)),
    expectedFee: 40000,
  },
  {
    name: "G: Phần tử ở biên mức 2 (600 cm²: 30×20 cm)",
    elements: [el(0, 0, 30 * PX_X, 20 * PX_Y)],
    expectedFee: 40000,
  },
  {
    name: "H: Vừa qua biên mức 2 (601 cm²: hơn 1 cm² → 60k)",
    elements: [el(0, 0, 30 * PX_X, 20 * PX_Y), el(0, 0, 1 * PX_X, 1 * PX_Y)],
    // bbox = gần 30×20 = 600cm² vì phần tử nhỏ nằm trong lớn
    // sum = 600 + ~0.01 > 600 → sumFee = 60k; bboxFee ≈ 40k → min = 40k
    expectedFee: 40000,
  },
  {
    name: "I: Logo giống hệt, cùng toạ độ, nhưng 1 ở front + 1 ở back → cộng dồn (20k+20k=40k), KHÔNG được miễn phí mặt sau",
    elements: [
      el(100, 100, 10 * PX_X, 10 * PX_Y, "front"),
      el(100, 100, 10 * PX_X, 10 * PX_Y, "back"),
    ],
    expectedFee: 40000,
  },
  {
    name: "J: Chỉ có thiết kế ở mặt sau (front trống) → vẫn tính phí bình thường (không phải 0đ)",
    elements: [el(10, 10, 30 * PX_X, 22 * PX_Y, "back")],
    expectedFee: 60000,
  },
];

// ─── Chạy test ───────────────────────────────────────────────────────────────
let passed = 0, failed = 0;

console.log("=".repeat(70));
console.log("VERIFY: FE (sau sửa) vs BE nhất quán");
console.log("=".repeat(70));

for (const c of cases) {
  const fe = feSim(c.elements);
  const be = beSim(c.elements);
  const feMatchBe = fe === be;
  const feMatchExpected = (c.expectedFee === undefined) || (fe === c.expectedFee);

  const status = feMatchBe && feMatchExpected ? "PASS" : "FAIL";
  if (status === "PASS") passed++; else failed++;

  const icon = status === "PASS" ? "✓" : "✗";
  console.log(`\n${icon} ${c.name}`);
  console.log(`  FE = ${fe.toLocaleString()}đ | BE = ${be.toLocaleString()}đ | Expected = ${c.expectedFee?.toLocaleString() ?? "any"}đ`);
  if (!feMatchBe) console.log(`  ❌ FE ≠ BE`);
  if (!feMatchExpected) console.log(`  ❌ FE ≠ Expected`);
}

console.log("\n" + "=".repeat(70));
console.log(`Kết quả: ${passed} PASS / ${failed} FAIL`);
console.log("=".repeat(70));

if (failed > 0) process.exit(1);
