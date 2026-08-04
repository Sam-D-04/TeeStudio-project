"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text as KonvaText,
  Transformer,
  Group,
  Line,
} from "react-konva";
import type Konva from "konva";
import { useDesignStore, selectElementsBySide, type DesignElement } from "@/store/useDesignStore";

/* ─── Kiểu dữ liệu ─── */
export type PrintArea = { x: number; y: number; w: number; h: number };

/* ─── Hook tự viết: tải ảnh từ đường dẫn (src) ─── */
function useLoadImage(src: string | undefined) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) { setImage(null); return; }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    return () => { img.onload = null; img.onerror = null; };
  }, [src]);
  return image;
}

/* ─── Đường gióng (snap guide) hiện ra khi kéo phần tử gần tâm/mép vùng in ─── */
function SnapGuides({
  printArea, nodeX, nodeY, nodeW, nodeH, visible,
}: {
  printArea: PrintArea;
  nodeX: number; nodeY: number; nodeW: number; nodeH: number;
  visible: boolean;
}) {
  if (!visible) return null;
  const pa = printArea;
  const nodeCX = nodeX + nodeW / 2;
  const nodeCY = nodeY + nodeH / 2;
  const paCX = pa.x + pa.w / 2;
  const paCY = pa.y + pa.h / 2;
  const THRESH = 8;
  const guides: React.ReactElement[] = [];

  const addLine = (key: string, points: number[]) =>
    guides.push(
      <Line key={key} points={points} stroke="#ff4d7e" strokeWidth={1}
        dash={[4, 4]} listening={false} />
    );

  if (Math.abs(nodeCY - paCY) < THRESH) addLine("hc", [pa.x, paCY, pa.x + pa.w, paCY]);
  if (Math.abs(nodeCX - paCX) < THRESH) addLine("vc", [paCX, pa.y, paCX, pa.y + pa.h]);
  if (Math.abs(nodeX - pa.x) < THRESH) addLine("le", [pa.x, pa.y, pa.x, pa.y + pa.h]);
  if (Math.abs(nodeX + nodeW - (pa.x + pa.w)) < THRESH) addLine("re", [pa.x + pa.w, pa.y, pa.x + pa.w, pa.y + pa.h]);
  if (Math.abs(nodeY - pa.y) < THRESH) addLine("te", [pa.x, pa.y, pa.x + pa.w, pa.y]);
  if (Math.abs(nodeY + nodeH - (pa.y + pa.h)) < THRESH) addLine("be", [pa.x, pa.y + pa.h, pa.x + pa.w, pa.y + pa.h]);

  return <>{guides}</>;
}

/* ─── Hook tự viết: tải icon xoay (rotate) dùng cho tay cầm của Transformer ─── */
function useRotateIcon() {
  const [img, setImg] = useState<HTMLImageElement | undefined>();
  useEffect(() => {
    const image = new window.Image();
    image.src = "/images/icons/icons8-rotate.png";
    image.onload = () => setImg(image);
  }, []);
  return img;
}

/* ─── Transformer ngoài Group (không bị clip) ─── */
const TR_ANCHORS = [
  "top-left", "top-center", "top-right",
  "middle-left", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
] as const;

function ExternalTransformer({
  selectedId,
  shapeRefs,
  nodesReady,
}: {
  selectedId: string | null;
  shapeRefs: React.RefObject<Map<string, Konva.Node>>;
  nodesReady: number;
}) {
  const trRef = useRef<Konva.Transformer>(null);
  const { elements, updateElement, pushHistory } = useDesignStore();
  const el = elements.find((e) => e.id === selectedId);
  const rotateIconImg = useRotateIcon();

  useEffect(() => {
    if (!trRef.current) return;
    const node = selectedId ? shapeRefs.current.get(selectedId) : null;
    trRef.current.nodes(node ? [node] : []);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedId, shapeRefs, nodesReady]);

  if (!selectedId || !el || el.locked) return null;

  const isText = el.type === "text";

  return (
    <Transformer
      ref={trRef}
      borderStroke="#e53e3e"
      borderStrokeWidth={1.5}
      anchorStroke="#e53e3e"
      anchorFill="#ffffff"
      anchorSize={10}
      anchorCornerRadius={2}
      rotateAnchorOffset={24}
      rotateAnchorAngle={180}
      rotateLineVisible={false}
      anchorStyleFunc={(anchor) => {
        if (anchor.hasName("rotater")) {
          // Kích thước cố định cho nút xoay
          const size = 22;
          anchor.width(size);
          anchor.height(size);
          anchor.offsetX(size / 2);
          anchor.offsetY(size / 2);
          anchor.cornerRadius(size / 2); // Bo tròn hoàn toàn

          if (rotateIconImg && rotateIconImg.naturalWidth > 0) {
            anchor.fillPatternImage(rotateIconImg);
            anchor.fillPatternRepeat("no-repeat");
            // Tự động scale ảnh icon vừa khít
            anchor.fillPatternScale({
              x: size / rotateIconImg.naturalWidth,
              y: size / rotateIconImg.naturalHeight
            });
          }
          anchor.strokeEnabled(true);
        } else {
          anchor.cornerRadius(2);
        }
      }}
      rotateEnabled
      keepRatio={false}
      enabledAnchors={
        isText
          ? ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right"]
          : [...TR_ANCHORS]
      }
      onTransformStart={() => pushHistory()}
      onTransformEnd={() => {
        if (!el) return;
        const node = shapeRefs.current.get(selectedId);
        if (!node) return;

        if (el.type === "image") {
          const flipH = el.flipH ?? false;
          const flipV = el.flipV ?? false;
          const rawScaleX = node.scaleX();
          const rawScaleY = node.scaleY();
          /* Magnitude của resize (luôn dương), giữ nguyên hướng flip */
          const resScaleX = Math.abs(rawScaleX);
          const resScaleY = Math.abs(rawScaleY);
          node.scaleX(flipH ? -1 : 1);
          node.scaleY(flipV ? -1 : 1);
          const newW = Math.max(10, (node as Konva.Image).width() * resScaleX);
          const newH = Math.max(10, (node as Konva.Image).height() * resScaleY);
          /* node.x() = storeX + (flipH ? newW : 0) → giải ngược về storeX */
          const storeX = node.x() - (flipH ? newW : 0);
          const storeY = node.y() - (flipV ? newH : 0);
          updateElement(el.id, { x: storeX, y: storeY, width: newW, height: newH, rotation: node.rotation() });
        } else if (el.type === "text") {
          const flipH = el.flipH ?? false;
          const flipV = el.flipV ?? false;
          const textNode = node as Konva.Text;
          const rawScaleX = textNode.scaleX();
          const rawScaleY = textNode.scaleY();
          const resScaleX = Math.abs(rawScaleX);
          const resScaleY = Math.abs(rawScaleY);
          textNode.scaleX(flipH ? -1 : 1);
          textNode.scaleY(flipV ? -1 : 1);
          const newW = Math.max(20, textNode.width() * resScaleX);
          const newFontSize = Math.max(8, (el.fontSize || 28) * resScaleY);
          textNode.width(newW);
          textNode.fontSize(newFontSize);
          const finalH = textNode.height();
          /* node.x() = storeX + (flipH ? newW : 0) → giải ngược */
          const storeX = textNode.x() - (flipH ? newW : 0);
          const storeY = textNode.y() - (flipV ? finalH : 0);
          updateElement(el.id, {
            x: storeX, y: storeY,
            width: newW, height: finalH,
            rotation: textNode.rotation(),
            fontSize: newFontSize,
          });
        }
      }}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 10 || newBox.height < 10) return oldBox;
        return newBox;
      }}
    />
  );
}

/* ─── Phần tử hình ảnh trên canvas ─── */
function ImageShape({
  el, onSelect, shapeRefs, onDragStateChange, onNodeReady,
}: {
  el: DesignElement;
  onSelect: (e: Konva.KonvaEventObject<Event>) => void;
  shapeRefs: React.RefObject<Map<string, Konva.Node>>;
  onDragStateChange: (active: boolean, x: number, y: number, w: number, h: number) => void;
  onNodeReady: () => void;
}) {
  const image = useLoadImage(el.src);
  const shapeRef = useRef<Konva.Image>(null);
  const { updateElement, pushHistory } = useDesignStore();

  /* Đăng ký ref vào map */
  useEffect(() => {
    if (shapeRef.current) {
      shapeRefs.current.set(el.id, shapeRef.current);
      onNodeReady();
    }
    return () => { shapeRefs.current.delete(el.id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el.id, image]);

  if (!image) return null;
  const elW = el.width ?? 100;
  const elH = el.height ?? 100;
  const flipH = el.flipH ?? false;
  const flipV = el.flipV ?? false;

  /* Khi flipH=true: dịch x sang phải bằng width, scaleX=-1 → ảnh vẫn nằm đúng chỗ */
  const konvaX = el.x + (flipH ? elW : 0);
  const konvaY = el.y + (flipV ? elH : 0);

  /* Chuyển Konva x/y về store x/y (bỏ offset flip) */
  const toStoreX = (kx: number) => kx - (flipH ? elW : 0);
  const toStoreY = (ky: number) => ky - (flipV ? elH : 0);

  return (
    <KonvaImage
      ref={shapeRef}
      image={image}
      x={konvaX} y={konvaY}
      width={elW} height={elH}
      scaleX={flipH ? -1 : 1}
      scaleY={flipV ? -1 : 1}
      rotation={el.rotation}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={() => { pushHistory(); onDragStateChange(true, el.x, el.y, elW, elH); }}
      onDragMove={(e) => {
        const sx = toStoreX(e.target.x());
        const sy = toStoreY(e.target.y());
        onDragStateChange(true, sx, sy, elW, elH);
      }}
      onDragEnd={(e) => {
        const sx = toStoreX(e.target.x());
        const sy = toStoreY(e.target.y());
        onDragStateChange(false, sx, sy, elW, elH);
        updateElement(el.id, { x: sx, y: sy });
      }}
      perfectDrawEnabled={false}
    />
  );
}

/* ─── Phần tử chữ (text) trên canvas ─── */
function TextShape({
  el, onSelect, shapeRefs, onDragStateChange, onNodeReady,
}: {
  el: DesignElement;
  onSelect: (e: Konva.KonvaEventObject<Event>) => void;
  shapeRefs: React.RefObject<Map<string, Konva.Node>>;
  onDragStateChange: (active: boolean, x: number, y: number, w: number, h: number) => void;
  onNodeReady: () => void;
}) {
  const shapeRef = useRef<Konva.Text>(null);
  const { updateElement, pushHistory } = useDesignStore();

  /* Đăng ký ref vào map */
  useEffect(() => {
    if (shapeRef.current) {
      shapeRefs.current.set(el.id, shapeRef.current);
      onNodeReady();
    }
    return () => { shapeRefs.current.delete(el.id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el.id]);

  const elW = el.width ?? 150;
  const elH = el.height ?? 40;
  const flipH = el.flipH ?? false;
  const flipV = el.flipV ?? false;

  /* Khi flipH=true: dịch x sang phải bằng width, scaleX=-1 → text vẫn nằm đúng chỗ */
  const konvaX = el.x + (flipH ? elW : 0);
  const konvaY = el.y + (flipV ? elH : 0);

  /* Chuyển Konva x/y về store x/y (bỏ offset flip) */
  const toStoreX = (kx: number) => kx - (flipH ? elW : 0);
  const toStoreY = (ky: number) => ky - (flipV ? elH : 0);

  return (
    <KonvaText
      ref={shapeRef}
      text={el.textTransform === "uppercase" ? (el.text || "").toUpperCase() : (el.text || "")}
      x={konvaX} y={konvaY}
      width={elW}
      scaleX={flipH ? -1 : 1}
      scaleY={flipV ? -1 : 1}
      fontSize={el.fontSize || 28}
      fontFamily={el.fontFamily || "Arial"}
      fill={el.fill || "#000000"}
      fontStyle={el.fontStyle || "normal"}
      textDecoration={el.textDecoration === "none" ? "" : el.textDecoration || ""}
      align={el.align || "left"}
      letterSpacing={el.letterSpacing || 0}
      lineHeight={el.lineHeight || 1}
      rotation={el.rotation}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={() => { pushHistory(); onDragStateChange(true, el.x, el.y, elW, elH); }}
      onDragMove={(e) => {
        const sx = toStoreX(e.target.x());
        const sy = toStoreY(e.target.y());
        onDragStateChange(true, sx, sy, elW, elH);
      }}
      onDragEnd={(e) => {
        const sx = toStoreX(e.target.x());
        const sy = toStoreY(e.target.y());
        onDragStateChange(false, sx, sy, elW, elH);
        updateElement(el.id, { x: sx, y: sy });
      }}
      perfectDrawEnabled={false}
    />
  );
}

/* ─── Component chính: CanvasEditor ─── */
export interface CanvasEditorProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  printArea: PrintArea;
  containerW: number;
  containerH: number;
  zoom: number;
  /** Danh sách điểm đa giác dùng để clip vùng in (toạ độ logic, đơn vị px).
   *  Nếu có giá trị, vùng in sẽ được clip theo đa giác này thay vì hình chữ nhật. */
  clipPoints?: [number, number][];
  /** Khi true: khóa canvas (không cho chọn/kéo phần tử – thiết kế đã được duyệt). */
  isReadOnly?: boolean;
}

export default function CanvasEditor({
  stageRef,
  printArea,
  containerW,
  containerH,
  zoom,
  clipPoints,
  isReadOnly = false,
}: CanvasEditorProps) {
  const { elements, selectedId, setSelectedId, shirtView } = useDesignStore();

  // "elements" trong store chứa CHUNG phần tử của cả mặt trước lẫn mặt sau.
  // Chỉ vẽ lên canvas những phần tử thuộc đúng mặt đang xem - nếu không, thiết
  // kế mặt trước sẽ bị "lộ" ra khi đang xem mặt sau (2 vùng in nằm gần trùng
  // nhau trên màn hình nên trước đây rất dễ nhầm là cùng 1 thiết kế).
  // Lọc chỉ render các element thuộc về mặt áo đang được chọn xem
  const phanTuMatDangXem = selectElementsBySide(elements, shirtView);

  /* Map: elementId → Konva.Node — chia sẻ giữa shapes và Transformer */
  const shapeRefs = useRef<Map<string, Konva.Node>>(new Map());

  const [dragInfo, setDragInfo] = useState({
    active: false, x: 0, y: 0, w: 0, h: 0,
  });

  const [nodesReady, setNodesReady] = useState(0);
  const handleNodeReady = useCallback(() => setNodesReady((n) => n + 1), []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<any>) => {
    if (isReadOnly) return; // Khi đã duyệt: không cho chọn phần tử
    if (e.target === e.target.getStage()) setSelectedId(null);
  }, [isReadOnly, setSelectedId]);

  const handleDragChange = useCallback(
    (active: boolean, x: number, y: number, w: number, h: number) =>
      setDragInfo({ active, x, y, w, h }),
    []
  );

  /* Stage kích thước hiển thị = logical * zoom; dùng scaleX/Y để Konva tự convert */
  const displayW = containerW * zoom;
  const displayH = containerH * zoom;

  return (
    <Stage
      ref={stageRef}
      width={displayW}
      height={displayH}
      scaleX={zoom}
      scaleY={zoom}
      onClick={handleStageClick}
      onTap={handleStageClick}
      style={{
        position: "absolute", top: 0, left: 0, zIndex: 2,
        // Khi chế độ chỉ xem: vô hiệu pointer để không chặn các event khác
        pointerEvents: isReadOnly ? "none" : undefined,
      }}
    >
      <Layer>
        {/*
          ── Group bị CLIP theo vùng in ──────────────────────────
          Tất cả elements bên trong sẽ bị ẩn nếu vượt ra ngoài
          printArea, nhưng Transformer ở bên ngoài Group KHÔNG bị ẩn
        */}
        <Group
          {...(clipPoints && clipPoints.length > 2
            ? {
              // Polygon clip: vẽ path đa giác trên canvas 2D
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              clipFunc: (ctx: any) => {
                ctx.beginPath();
                clipPoints.forEach(([x, y]: [number, number], i: number) => {
                  if (i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                });
                ctx.closePath();
              },
            }
            : {
              // Rectangle clip (mặc định)
              clipX: printArea.x,
              clipY: printArea.y,
              clipWidth: printArea.w,
              clipHeight: printArea.h,
            })}
        >

          {phanTuMatDangXem.map((el, index) => {

            const commonProps = {
              el,
              onSelect: (e: Konva.KonvaEventObject<Event>) => {
                e.cancelBubble = true;
                if (!el.locked) setSelectedId(el.id);
              },
              shapeRefs,
              onDragStateChange: handleDragChange,
              onNodeReady: handleNodeReady,
            };
            if (el.type === "image") return <ImageShape key={el.id || index} {...commonProps} />;
            if (el.type === "text") return <TextShape key={el.id || index} {...commonProps} />;
            return null;
          })}
        </Group>

        {/*
          ── Transformer NẰM NGOÀI Group ─────────────────────────
          → Không bị clip → hiển thị đầy đủ các nút điều khiển
        */}
        <ExternalTransformer
          selectedId={selectedId}
          shapeRefs={shapeRefs}
          nodesReady={nodesReady}
        />

        {/* Đường gióng snap */}
        <SnapGuides
          printArea={printArea}
          nodeX={dragInfo.x} nodeY={dragInfo.y}
          nodeW={dragInfo.w} nodeH={dragInfo.h}
          visible={dragInfo.active}
        />
      </Layer>
    </Stage>
  );
}
