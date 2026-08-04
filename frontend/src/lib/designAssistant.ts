/**
 * designAssistant.ts — Công cụ nhanh dạng heuristic (công thức toán, KHÔNG phải AI)
 * hỗ trợ "Trợ lý thiết kế": toán màu WCAG + ghép cặp font.
 *
 * Việc sinh câu chữ và suy luận bố cục bằng AI thật (Gemini) nằm ở
 * services/aiDesignService.ts — gọi qua backend, không phải trong file này.
 */
import type { DesignElement } from "@/store/useDesignStore";

/* ───────────────────────── Toán màu (WCAG) ───────────────────────── */

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h || "000000", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Độ sáng tương đối theo WCAG (0 = đen, 1 = trắng). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** Tỉ lệ tương phản giữa 2 màu (1 → 21). */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function isDarkColor(hex: string): boolean {
  return relativeLuminance(hex) < 0.4;
}

/** Chọn màu chữ (trắng/đen) tương phản tốt nhất với nền. */
export function pickReadableTextColor(bgHex: string): string {
  const dark = "#111827";
  const light = "#ffffff";
  return contrastRatio(light, bgHex) >= contrastRatio(dark, bgHex) ? light : dark;
}

/** Nếu màu chữ hiện tại tương phản kém với áo thì đổi sang màu dễ đọc. */
export function ensureReadableFill(currentFill: string | undefined, shirtHex: string): string {
  const fill = currentFill || "#000000";
  return contrastRatio(fill, shirtHex) >= 3 ? fill : pickReadableTextColor(shirtHex);
}

/* ───────────────────────── HSL ↔ HEX ───────────────────────── */

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHsl(hex: string): [number, number, number] {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

/**
 * Sinh bảng màu chữ gợi ý hài hoà với màu áo, đã lọc đảm bảo tương phản đủ đọc.
 * Kết hợp: đen/trắng an toàn + màu bổ túc / tương đồng / bộ ba dựng từ hue của áo.
 */
export function suggestTextPalette(shirtHex: string): string[] {
  const [h] = hexToHsl(shirtHex);
  const candidates: string[] = [
    pickReadableTextColor(shirtHex), // an toàn nhất
    hslToHex(h + 180, 75, isDarkColor(shirtHex) ? 65 : 40), // bổ túc
    hslToHex(h + 150, 70, isDarkColor(shirtHex) ? 62 : 42),
    hslToHex(h + 30, 75, isDarkColor(shirtHex) ? 65 : 40), // tương đồng
    hslToHex(h + 120, 65, isDarkColor(shirtHex) ? 60 : 40), // bộ ba
    "#dc2626", "#2563eb", "#16a34a", "#ca8a04", "#7c3aed",
  ];
  const out: string[] = [];
  for (const c of candidates) {
    const norm = c.toLowerCase();
    if (out.includes(norm)) continue;
    if (contrastRatio(norm, shirtHex) >= 3) out.push(norm);
    if (out.length >= 5) break;
  }
  return out;
}

/* ───────────────────────── Ghép cặp font ───────────────────────── */

export interface FontPairing {
  heading: string;
  body: string;
  label: string;
}

/** Các cặp font (heading + body) tuyển chọn từ danh sách font sẵn có. */
export const FONT_PAIRINGS: FontPairing[] = [
  { heading: "Bebas Neue", body: "Roboto", label: "Impact + Sạch" },
  { heading: "Playfair Display", body: "Lato", label: "Sang trọng" },
  { heading: "Oswald", body: "Open Sans", label: "Thể thao" },
  { heading: "Alfa Slab One", body: "Poppins", label: "Đậm chất" },
  { heading: "Lobster", body: "Montserrat", label: "Vui nhộn" },
  { heading: "Righteous", body: "Inter", label: "Hiện đại" },
  { heading: "Dancing Script", body: "Quicksand", label: "Mềm mại" },
];

/* ───────────────────────── Áp dụng lên phần tử ───────────────────────── */

/** Chỉ sửa màu chữ để đảm bảo tương phản, không đụng bố cục. */
export function fixTextContrast(elements: DesignElement[], shirtHex: string): DesignElement[] {
  return elements.map((e) =>
    e.type === "text" ? { ...e, fill: ensureReadableFill(e.fill, shirtHex) } : e
  );
}

/** Áp một màu cho toàn bộ chữ (hoặc chỉ 1 phần tử nếu truyền targetId). */
export function applyTextColor(elements: DesignElement[], color: string, targetId?: string): DesignElement[] {
  return elements.map((e) => {
    if (e.type !== "text") return e;
    if (targetId && e.id !== targetId) return e;
    return { ...e, fill: color };
  });
}

/** Áp cặp font: phần tử chữ trên cùng dùng heading, còn lại dùng body. */
export function applyFontPairing(elements: DesignElement[], pairing: FontPairing): DesignElement[] {
  const texts = elements.filter((e) => e.type === "text").sort((a, b) => a.y - b.y);
  const headingId = texts[0]?.id;
  return elements.map((e) =>
    e.type === "text"
      ? { ...e, fontFamily: e.id === headingId ? pairing.heading : pairing.body }
      : e
  );
}
