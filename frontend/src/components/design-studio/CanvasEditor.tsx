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
import { useDesignStore, DesignElement } from "@/store/useDesignStore";

/* ─── Types ─── */
export type PrintArea = { x: number; y: number; w: number; h: number };

/* ─── Custom hook: load ảnh từ src ─── */
function useLoadImage(src: string | undefined) {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) { setImage(null); return; }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload  = () => setImage(img);
    img.onerror = () => setImage(null);
    return () => { img.onload = null; img.onerror = null; };
  }, [src]);
  return image;
}

/* ─── Snap guide lines ─── */
function SnapGuides({
  printArea, nodeX, nodeY, nodeW, nodeH, visible,
}: {
  printArea: PrintArea;
  nodeX: number; nodeY: number; nodeW: number; nodeH: number;
  visible: boolean;
}) {
  if (!visible) return null;
  const pa       = printArea;
  const nodeCX   = nodeX + nodeW / 2;
  const nodeCY   = nodeY + nodeH / 2;
  const paCX     = pa.x + pa.w / 2;
  const paCY     = pa.y + pa.h / 2;
  const THRESH   = 8;
  const guides: React.ReactElement[] = [];

  const addLine = (key: string, points: number[]) =>
    guides.push(
      <Line key={key} points={points} stroke="#ff4d7e" strokeWidth={1}
        dash={[4, 4]} listening={false} />
    );

  if (Math.abs(nodeCY - paCY) < THRESH) addLine("hc", [pa.x, paCY, pa.x + pa.w, paCY]);
  if (Math.abs(nodeCX - paCX) < THRESH) addLine("vc", [paCX, pa.y, paCX, pa.y + pa.h]);
  if (Math.abs(nodeX - pa.x) < THRESH)              addLine("le", [pa.x, pa.y, pa.x, pa.y + pa.h]);
  if (Math.abs(nodeX + nodeW - (pa.x + pa.w)) < THRESH) addLine("re", [pa.x + pa.w, pa.y, pa.x + pa.w, pa.y + pa.h]);
  if (Math.abs(nodeY - pa.y) < THRESH)              addLine("te", [pa.x, pa.y, pa.x + pa.w, pa.y]);
  if (Math.abs(nodeY + nodeH - (pa.y + pa.h)) < THRESH) addLine("be", [pa.x, pa.y + pa.h, pa.x + pa.w, pa.y + pa.h]);

  return <>{guides}</>;
}

/* ─── Custom Rotate Icon Hook ─── */
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
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          const newW = Math.max(10, (node as Konva.Image).width() * scaleX);
          const newH = Math.max(10, (node as Konva.Image).height() * scaleY);
          updateElement(el.id, { x: node.x(), y: node.y(), width: newW, height: newH, rotation: node.rotation() });
        } else if (el.type === "text") {
          const textNode = node as Konva.Text;
          const scaleX   = textNode.scaleX();
          const scaleY   = textNode.scaleY();
          textNode.scaleX(1);
          textNode.scaleY(1);
          const newW        = Math.max(20, textNode.width() * scaleX);
          const newFontSize = Math.max(8, (el.fontSize || 28) * scaleY);
          textNode.width(newW);
          textNode.fontSize(newFontSize);
          const finalH = textNode.height();
          updateElement(el.id, {
            x: textNode.x(), y: textNode.y(),
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

/* ─── Image shape ─── */
function ImageShape({
  el, isSelected, onSelect, shapeRefs, onDragStateChange, onNodeReady,
}: {
  el: DesignElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<Event>) => void;
  shapeRefs: React.RefObject<Map<string, Konva.Node>>;
  onDragStateChange: (active: boolean, x: number, y: number, w: number, h: number) => void;
  onNodeReady: () => void;
}) {
  const image    = useLoadImage(el.src);
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
  const elW = el.width  ?? 100;
  const elH = el.height ?? 100;

  return (
    <KonvaImage
      ref={shapeRef}
      image={image}
      x={el.x} y={el.y}
      width={elW} height={elH}
      rotation={el.rotation}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={() => { pushHistory(); onDragStateChange(true, el.x, el.y, elW, elH); }}
      onDragMove={(e) => onDragStateChange(true, e.target.x(), e.target.y(), elW, elH)}
      onDragEnd={(e) => {
        onDragStateChange(false, e.target.x(), e.target.y(), elW, elH);
        updateElement(el.id, { x: e.target.x(), y: e.target.y() });
      }}
      perfectDrawEnabled={false}
    />
  );
}

/* ─── Text shape ─── */
function TextShape({
  el, isSelected, onSelect, shapeRefs, onDragStateChange, onNodeReady,
}: {
  el: DesignElement;
  isSelected: boolean;
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

  const elW = el.width  ?? 150;
  const elH = el.height ?? 40;

  return (
    <KonvaText
      ref={shapeRef}
      text={el.textTransform === "uppercase" ? (el.text || "").toUpperCase() : (el.text || "")}
      x={el.x} y={el.y}
      width={elW}
      fontSize={el.fontSize   || 28}
      fontFamily={el.fontFamily || "Arial"}
      fill={el.fill            || "#000000"}
      fontStyle={el.fontStyle  || "normal"}
      textDecoration={el.textDecoration === "none" ? "" : el.textDecoration || ""}
      align={el.align || "left"}
      letterSpacing={el.letterSpacing || 0}
      lineHeight={el.lineHeight || 1}
      rotation={el.rotation}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={() => { pushHistory(); onDragStateChange(true, el.x, el.y, elW, elH); }}
      onDragMove={(e) => onDragStateChange(true, e.target.x(), e.target.y(), elW, elH)}
      onDragEnd={(e) => {
        onDragStateChange(false, e.target.x(), e.target.y(), elW, elH);
        updateElement(el.id, { x: e.target.x(), y: e.target.y() });
      }}
      perfectDrawEnabled={false}
    />
  );
}

/* ─── Main CanvasEditor ─── */
export interface CanvasEditorProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  printArea: PrintArea;
  containerW: number;
  containerH: number;
  zoom: number;
  /** Optional polygon clip points (absolute px, logical coords).
   *  When provided, replaces the rectangular clip with a polygon clip. */
  clipPoints?: [number, number][];
}

export default function CanvasEditor({
  stageRef,
  printArea,
  containerW,
  containerH,
  zoom,
  clipPoints,
}: CanvasEditorProps) {
  const { elements, selectedId, setSelectedId } = useDesignStore();

  /* Map: elementId → Konva.Node — chia sẻ giữa shapes và Transformer */
  const shapeRefs = useRef<Map<string, Konva.Node>>(new Map());

  const [dragInfo, setDragInfo] = useState({
    active: false, x: 0, y: 0, w: 0, h: 0,
  });

  const [nodesReady, setNodesReady] = useState(0);
  const handleNodeReady = useCallback(() => setNodesReady((n) => n + 1), []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<any>) => {
    if (e.target === e.target.getStage()) setSelectedId(null);
  }, [setSelectedId]);

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
      style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
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
          {elements.map((el) => {
            const commonProps = {
              el,
              isSelected: el.id === selectedId,
              onSelect:  (e: Konva.KonvaEventObject<Event>) => {
                e.cancelBubble = true;
                if (!el.locked) setSelectedId(el.id);
              },
              shapeRefs,
              onDragStateChange: handleDragChange,
              onNodeReady: handleNodeReady,
            };
            if (el.type === "image") return <ImageShape key={el.id} {...commonProps} />;
            if (el.type === "text")  return <TextShape  key={el.id} {...commonProps} />;
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
          nodeX={dragInfo.x}  nodeY={dragInfo.y}
          nodeW={dragInfo.w}  nodeH={dragInfo.h}
          visible={dragInfo.active}
        />
      </Layer>
    </Stage>
  );
}
