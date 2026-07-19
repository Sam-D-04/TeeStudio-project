import type {
  TechpackCanvasData,
  TechpackFileIn,
  TechpackPrintSide,
} from "@/services/admin/designService";

type ShirtType = "tshirt" | "polo" | "hoodie";

type PrintAreaPx = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type ElementBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type TechpackMeasurement = {
  side: TechpackPrintSide;
  boundingBoxPx: ElementBox;
  printAreaPx: PrintAreaPx;
  widthCm: number;
  heightCm: number;
  topCm: number;
  leftCm: number;
  summary: string;
  detail: string;
  elementCount: number;
};

const DEFAULT_CANVAS = { width: 500, height: 600 };

const DEFAULT_REAL_SIZE_CM: Record<TechpackPrintSide, { width: number; height: number }> = {
  front: { width: 30, height: 40 },
  back: { width: 35, height: 45 },
};

const PRINT_AREA_CONFIG: Record<
  ShirtType,
  Record<TechpackPrintSide, { top: number; left: number; width: number; height: number }>
> = {
  tshirt: {
    front: { top: 0.31, left: 0.3, width: 0.4, height: 0.4 },
    back: { top: 0.28, left: 0.28, width: 0.44, height: 0.46 },
  },
  polo: {
    front: { top: 0.45, left: 0.27, width: 0.46, height: 0.4 },
    back: { top: 0.27, left: 0.28, width: 0.44, height: 0.46 },
  },
  hoodie: {
    front: { top: 0.34, left: 0.3, width: 0.4, height: 0.26 },
    back: { top: 0.3, left: 0.26, width: 0.48, height: 0.46 },
  },
};

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCanvasSize(canvasData: TechpackCanvasData) {
  return {
    width: toNumber(canvasData?.logicalCanvas?.width, DEFAULT_CANVAS.width),
    height: toNumber(canvasData?.logicalCanvas?.height, DEFAULT_CANVAS.height),
  };
}

function getShirtType(canvasData: TechpackCanvasData, fallback: string): ShirtType {
  const value = String(canvasData?.shirtType || fallback || "tshirt");
  return value === "polo" || value === "hoodie" ? value : "tshirt";
}

function getPrintAreaPx(
  shirtType: ShirtType,
  side: TechpackPrintSide,
  canvasWidth: number,
  canvasHeight: number
): PrintAreaPx {
  const config = PRINT_AREA_CONFIG[shirtType][side];
  return {
    top: config.top * canvasHeight,
    left: config.left * canvasWidth,
    width: config.width * canvasWidth,
    height: config.height * canvasHeight,
  };
}

function inferElementSide(
  item: { side?: TechpackPrintSide | null },
  canvasData: TechpackCanvasData
): TechpackPrintSide {
  if (item.side === "back") return "back";
  if (item.side === "front") return "front";
  return canvasData?.shirtView === "back" ? "back" : "front";
}

function estimateTextWidth(item: { text?: unknown; fontSize?: unknown; width?: unknown }) {
  const explicitWidth = toNumber(item.width, 0);
  if (explicitWidth > 0) return explicitWidth;
  const fontSize = toNumber(item.fontSize, 28);
  const textLength = String(item.text || "").length || 8;
  return Math.max(fontSize * textLength * 0.55, fontSize * 2);
}

function estimateElementBox(item: {
  x?: unknown;
  y?: unknown;
  width?: unknown;
  height?: unknown;
  rotation?: unknown;
  fontSize?: unknown;
  text?: unknown;
  type?: unknown;
}): ElementBox | null {
  const x = toNumber(item.x, Number.NaN);
  const y = toNumber(item.y, Number.NaN);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const fontSize = toNumber(item.fontSize, 28);
  const width = item.type === "text"
    ? estimateTextWidth(item)
    : toNumber(item.width, 0);
  const height = toNumber(item.height, item.type === "text" ? fontSize * 1.25 : 0);

  if (width <= 0 || height <= 0) return null;
  return {
    x,
    y,
    width,
    height,
    rotation: toNumber(item.rotation, 0),
  };
}

function getRotatedBounds(box: ElementBox): ElementBox {
  if (!box.rotation) return box;

  const radians = (box.rotation * Math.PI) / 180;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const corners = [
    [box.x, box.y],
    [box.x + box.width, box.y],
    [box.x + box.width, box.y + box.height],
    [box.x, box.y + box.height],
  ].map(([x, y]) => {
    const dx = x - centerX;
    const dy = y - centerY;
    return {
      x: centerX + dx * Math.cos(radians) - dy * Math.sin(radians),
      y: centerY + dx * Math.sin(radians) + dy * Math.cos(radians),
    };
  });

  const minX = Math.min(...corners.map((point) => point.x));
  const minY = Math.min(...corners.map((point) => point.y));
  const maxX = Math.max(...corners.map((point) => point.x));
  const maxY = Math.max(...corners.map((point) => point.y));
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    rotation: box.rotation,
  };
}

function mergeBoxes(boxes: ElementBox[]): ElementBox | null {
  if (!boxes.length) return null;
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    rotation: 0,
  };
}

export function formatCm(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}cm` : `${rounded.toFixed(1)}cm`;
}

export function tinhThongSoInCm(
  canvasData: TechpackCanvasData,
  side: TechpackPrintSide,
  fileIn: TechpackFileIn | null,
  shirtTypeFallback: string
): TechpackMeasurement | null {
  const rawItems = Array.isArray(canvasData?.elements)
    ? canvasData.elements
    : Array.isArray(canvasData?.layers)
      ? canvasData.layers
      : [];

  const sideItems = rawItems.filter((item) => inferElementSide(item, canvasData) === side);
  const boxes = sideItems
    .map(estimateElementBox)
    .filter((box): box is ElementBox => Boolean(box))
    .map(getRotatedBounds);
  const boundingBox = mergeBoxes(boxes);
  if (!boundingBox) return null;

  const canvasSize = getCanvasSize(canvasData);
  const shirtType = getShirtType(canvasData, shirtTypeFallback);
  const printAreaPx = getPrintAreaPx(shirtType, side, canvasSize.width, canvasSize.height);
  const defaultRealSize = DEFAULT_REAL_SIZE_CM[side];
  const realWidthCm = fileIn?.viTriIn?.maxWidthCm || defaultRealSize.width;
  const realHeightCm = fileIn?.viTriIn?.maxHeightCm || defaultRealSize.height;
  const scaleX = realWidthCm / printAreaPx.width;
  const scaleY = realHeightCm / printAreaPx.height;
  const widthCm = boundingBox.width * scaleX;
  const heightCm = boundingBox.height * scaleY;
  const topCm = (boundingBox.y - printAreaPx.top) * scaleY;
  const leftCm = (boundingBox.x - printAreaPx.left) * scaleX;

  return {
    side,
    boundingBoxPx: boundingBox,
    printAreaPx,
    widthCm,
    heightCm,
    topCm,
    leftCm,
    summary: `In cách cổ ${formatCm(topCm)}, chiều rộng hình ${formatCm(widthCm)}`,
    detail: `Cách mép trái vùng in ${formatCm(leftCm)}, chiều cao hình ${formatCm(heightCm)}`,
    elementCount: sideItems.length,
  };
}
