"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Rect } from "react-konva";
import type Konva from "konva";
import { useDesignStore, DesignElement } from "@/store/useDesignStore";

/* ─── PrintArea type ─── */
type PrintArea = { x: number; y: number; w: number; h: number };

/* ─── Clamp vị trí element trong print area ─── */
function clampToPrintArea(
  pos: { x: number; y: number },
  elW: number,
  elH: number,
  pa: PrintArea
) {
  return {
    x: Math.max(pa.x, Math.min(pos.x, pa.x + pa.w - elW)),
    y: Math.max(pa.y, Math.min(pos.y, pa.y + pa.h - elH)),
  };
}

/* ─── Kiểm tra newBox có nằm trong print area không ─── */
function boxFitsInPrintArea(
  box: { x: number; y: number; width: number; height: number },
  pa: PrintArea
) {
  return (
    box.x >= pa.x &&
    box.y >= pa.y &&
    box.x + box.width <= pa.x + pa.w &&
    box.y + box.height <= pa.y + pa.h
  );
}

/* ─── Custom hook load ảnh ─── */
function useLoadImage(src: string | undefined) {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
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

/* ─── Image element ─── */
function CanvasImageElement({
  el,
  isSelected,
  onSelect,
  printArea,
  onDragActive,
}: {
  el: DesignElement;
  isSelected: boolean;
  onSelect: () => void;
  printArea: PrintArea;
  onDragActive: (active: boolean) => void;
}) {
  const image = useLoadImage(el.src);
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { updateElement, pushHistory } = useDesignStore();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!image) return null;

  const elW = el.width ?? 100;
  const elH = el.height ?? 100;

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={el.x}
        y={el.y}
        width={elW}
        height={elH}
        rotation={el.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        /* ── Giới hạn kéo trong print area ── */
        dragBoundFunc={(pos) => clampToPrintArea(pos, elW, elH, printArea)}
        onDragStart={() => { pushHistory(); onDragActive(true); }}
        onDragEnd={(e) => {
          onDragActive(false);
          updateElement(el.id, { x: e.target.x(), y: e.target.y() });
        }}
        onTransformStart={() => pushHistory()}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          /* Clamp vị trí sau transform */
          const newW = Math.max(5, node.width() * scaleX);
          const newH = Math.max(5, node.height() * scaleY);
          const clamped = clampToPrintArea({ x: node.x(), y: node.y() }, newW, newH, printArea);
          updateElement(el.id, {
            x: clamped.x,
            y: clamped.y,
            width: newW,
            height: newH,
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            "top-left", "top-right",
            "bottom-left", "bottom-right",
            "middle-left", "middle-right",
            "top-center", "bottom-center",
          ]}
          borderStroke="#0ea5e9"
          borderStrokeWidth={2}
          anchorStroke="#0ea5e9"
          anchorFill="#ffffff"
          anchorSize={10}
          anchorCornerRadius={2}
          /* ── Chặn resize ra ngoài print area ── */
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            if (!boxFitsInPrintArea(newBox, printArea)) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

/* ─── Text element ─── */
function CanvasTextElement({
  el,
  isSelected,
  onSelect,
  printArea,
  onDragActive,
}: {
  el: DesignElement;
  isSelected: boolean;
  onSelect: () => void;
  printArea: PrintArea;
  onDragActive: (active: boolean) => void;
}) {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { updateElement, pushHistory } = useDesignStore();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const elW = el.width ?? 150;
  const elH = el.height ?? 40;

  return (
    <>
      <KonvaText
        ref={shapeRef}
        text={el.text || ""}
        x={el.x}
        y={el.y}
        width={elW}
        fontSize={el.fontSize || 28}
        fontFamily={el.fontFamily || "Arial"}
        fill={el.fill || "#000000"}
        fontStyle={el.fontStyle || "normal"}
        rotation={el.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        /* ── Giới hạn kéo trong print area ── */
        dragBoundFunc={(pos) => {
          // Dùng kích thước thực tế của node nếu có
          const node = shapeRef.current;
          const w = node ? node.width() : elW;
          const h = node ? node.height() : elH;
          return clampToPrintArea(pos, w, h, printArea);
        }}
        onDragStart={() => { pushHistory(); onDragActive(true); }}
        onDragEnd={(e) => {
          onDragActive(false);
          updateElement(el.id, { x: e.target.x(), y: e.target.y() });
        }}
        onTransformStart={() => pushHistory()}
        onTransform={(e) => {
          const node = shapeRef.current;
          const tr = trRef.current;
          if (!node || !tr) return;

          const activeAnchor = tr.getActiveAnchor();
          
          // Chỉ cập nhật width realtime khi kéo 2 cạnh bên (để text tự wrap mượt mà)
          if (activeAnchor === 'middle-left' || activeAnchor === 'middle-right') {
            const scaleX = node.scaleX();
            node.width(Math.max(20, node.width() * scaleX));
            node.scaleX(1);
            node.scaleY(1);
          }
          // Khi kéo góc, để Konva tự scale hình ảnh của text (scaleX/scaleY thay đổi) 
          // Không can thiệp để thao tác mượt mà không bị giật, sẽ tính lại fontSize lúc thả chuột
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          if (!node) return;
          
          // Lấy scale sau khi kéo xong
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          // Reset scale về 1
          node.scaleX(1);
          node.scaleY(1);
          
          // Tính width và fontSize mới dựa vào scale cuối cùng
          const newW = Math.max(20, node.width() * scaleX);
          const newFontSize = Math.max(8, (el.fontSize || 28) * scaleY);
          
          // Gắn lại vào node để text render chuẩn
          node.width(newW);
          node.fontSize(newFontSize);
          
          // Chiều cao tự do theo text sau khi wrap và đổi size
          const finalH = node.height(); 
          
          const clamped = clampToPrintArea({ x: node.x(), y: node.y() }, newW, finalH, printArea);
          updateElement(el.id, {
            x: clamped.x,
            y: clamped.y,
            width: newW,
            height: finalH,
            rotation: node.rotation(),
            fontSize: newFontSize,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            "top-left", "top-right",
            "bottom-left", "bottom-right",
            "middle-left", "middle-right",
          ]}
          borderStroke="#6366f1"
          borderStrokeWidth={2}
          anchorStroke="#6366f1"
          anchorFill="#ffffff"
          anchorSize={10}
          anchorCornerRadius={2}
          /* ── Chặn resize ra ngoài print area ── */
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 10) return oldBox;
            if (!boxFitsInPrintArea(newBox, printArea)) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

/* ─── Print Area Guide (dashed rect + visual feedback khi kéo) ─── */
function PrintAreaGuide({
  x, y, width, height, highlighted,
}: {
  x: number; y: number; width: number; height: number; highlighted: boolean;
}) {
  return (
    <>
      {/* Nền mờ phía ngoài print area khi đang kéo */}
      {highlighted && (
        <Rect
          x={0} y={0}
          width={99999} height={99999}
          fill="rgba(0,0,0,0.25)"
          listening={false}
        />
      )}
      {/* Viền print area */}
      <Rect
        x={x} y={y}
        width={width} height={height}
        stroke={highlighted ? "rgba(14,165,233,0.9)" : "rgba(14,165,233,0.3)"}
        strokeWidth={highlighted ? 2 : 1}
        dash={highlighted ? [] : [6, 4]}
        listening={false}
        /* Khi highlight: xoá nền tối bên trong vùng in */
        fill={highlighted ? "transparent" : undefined}
        globalCompositeOperation={highlighted ? "destination-out" : undefined}
      />
      {/* Viền thật (luôn hiện) đè lên composite bên trên */}
      {highlighted && (
        <Rect
          x={x} y={y}
          width={width} height={height}
          stroke="rgba(14,165,233,0.9)"
          strokeWidth={2}
          listening={false}
        />
      )}
    </>
  );
}

/* ─── Main Canvas Editor ─── */
interface CanvasEditorProps {
  stageWidth: number;
  stageHeight: number;
  displayWidth: number;
  displayHeight: number;
  zoom: number;
  printArea: PrintArea;
  stageRef: React.RefObject<Konva.Stage | null>;
}

export default function CanvasEditor({
  stageWidth,
  stageHeight,
  displayWidth,
  displayHeight,
  zoom,
  printArea,
  stageRef,
}: CanvasEditorProps) {
  const { elements, selectedId, setSelectedId } = useDesignStore();
  /* Bật highlight khi đang kéo element */
  const [isDragging, setIsDragging] = useState(false);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<any>) => {
      if (e.target === e.target.getStage()) {
        setSelectedId(null);
      }
    },
    [setSelectedId]
  );

  return (
    <Stage
      ref={stageRef}
      width={displayWidth}
      height={displayHeight}
      scaleX={zoom}
      scaleY={zoom}
      onClick={handleStageClick}
      onTap={handleStageClick}
      className="ds-canvas-stage"
    >
      <Layer>
        {/* Print area guide – highlight khi đang kéo */}
        <PrintAreaGuide
          x={printArea.x}
          y={printArea.y}
          width={printArea.w}
          height={printArea.h}
          highlighted={isDragging}
        />

        {/* Render tất cả elements */}
        {elements.map((el) => {
          if (el.type === "image") {
            return (
              <CanvasImageElement
                key={el.id}
                el={el}
                isSelected={el.id === selectedId}
                onSelect={() => setSelectedId(el.id)}
                printArea={printArea}
                onDragActive={setIsDragging}
              />
            );
          }
          if (el.type === "text") {
            return (
              <CanvasTextElement
                key={el.id}
                el={el}
                isSelected={el.id === selectedId}
                onSelect={() => setSelectedId(el.id)}
                printArea={printArea}
                onDragActive={setIsDragging}
              />
            );
          }
          return null;
        })}
      </Layer>
    </Stage>
  );
}
