import type { DesignElement, ShirtType, ShirtView } from "@/store/useDesignStore";

const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  den: "#000000",
  white: "#ffffff",
  trang: "#ffffff",
  blue: "#0066cc",
  navy: "#003153",
  red: "#ff0000",
  green: "#008000",
  yellow: "#ffff00",
  gray: "#9ca3af",
  grey: "#9ca3af",
  xam: "#9ca3af",
  brown: "#8b4513",
  nau: "#8b4513",
};

function normalizeColorKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\s+/g, " ");
}

export function normalizeAdminTextFill(value?: string | null): string {
  const raw = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    const [, r, g, b] = raw.toLowerCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  const named = NAMED_COLORS[normalizeColorKey(raw)];
  if (named) return named;

  const rgb = raw.match(/^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})/i);
  if (rgb) {
    const toHex = (part: string) =>
      Math.max(0, Math.min(255, Number(part) || 0))
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
  }

  return "#000000";
}

export function normalizeAdminDesignElements(elements: DesignElement[]): DesignElement[] {
  return elements.map((element) =>
    element.type === "text"
      ? { ...element, fill: normalizeAdminTextFill(element.fill) }
      : element
  );
}

export function getAdminMockupSrc(type: ShirtType, view: ShirtView, color: string): string {
  const normalized = String(color || "").trim().toLowerCase();
  const viewKey = view === "front" ? "Front" : "Back";

  if (type === "polo") {
    const navyColors = new Set(["#0066cc", "#003153", "#1d4ed8", "#1e40af", "#2563eb"]);
    const beigeColors = new Set(["#d6b89a", "#f5f5dc", "#8b4513"]);
    const colorKey = navyColors.has(normalized)
      ? "Navy"
      : beigeColors.has(normalized)
        ? "Beige"
        : "White";
    return colorKey === "Navy" && viewKey === "Back"
      ? "/images/mockups/Polo-Navy-Backt.png"
      : `/images/mockups/Polo-${colorKey}-${viewKey}.png`;
  }

  if (type === "hoodie") {
    const brownColors = new Set(["#8b4513", "#92400e", "#78350f", "#b45309", "#d97706"]);
    const colorKey = brownColors.has(normalized) ? "Brown" : "Grey";
    return `/images/mockups/Hoodie-${colorKey}-${viewKey}.png`;
  }

  const navyColors = new Set(["#0066cc", "#003153", "#1d4ed8", "#1e40af", "#2563eb"]);
  const darkColors = new Set(["#000000", "#1a1a1a", "#111111", "#0f172a", "#1e293b"]);
  const colorKey = navyColors.has(normalized)
    ? "Navy"
    : darkColors.has(normalized)
      ? "Black"
      : "White";
  return `/images/mockups/TShirt-${colorKey}-${viewKey}.png`;
}

export function getAdminMockupFilter(type: ShirtType, color: string): string | undefined {
  if (type !== "hoodie") return undefined;

  const normalized = String(color || "").trim().toLowerCase();
  if (normalized === "#000000") {
    return "grayscale(1) brightness(0.34) contrast(1.25)";
  }
  if (normalized === "#003153") {
    return "sepia(1) saturate(2.4) hue-rotate(170deg) brightness(0.48) contrast(1.25)";
  }

  return undefined;
}
