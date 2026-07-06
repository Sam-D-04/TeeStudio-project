import React from "react";
import { useDesignStore } from "@/store/useDesignStore";
import { getPrintAreaBoundary } from "./ShirtMockupImage";

const CONTAINER_W = 500;
const CONTAINER_H = 600;

export default function StaticTextToolbar() {
  const { selectedId, elements, updateElement, shirtType, shirtView } = useDesignStore();
  const selectedEl = elements.find((e) => e.id === selectedId);

  if (!selectedEl || selectedEl.type !== "text") return null;

  const isBold   = selectedEl.fontStyle?.includes("bold")   ?? false;
  const isItalic = selectedEl.fontStyle?.includes("italic") ?? false;
  const isUnderline    = selectedEl.textDecoration === "underline";
  const isLinethrough  = selectedEl.textDecoration === "linethrough";
  const isUppercase    = selectedEl.textTransform  === "uppercase";
  const align          = selectedEl.align || "left";

  const handleToggleStyle = (type: "bold" | "italic") => {
    const next =
      type === "bold"
        ? isBold
          ? isItalic ? "italic" : "normal"
          : isItalic ? "bold italic" : "bold"
        : isItalic
          ? isBold ? "bold" : "normal"
          : isBold ? "bold italic" : "italic";
    updateElement(selectedId!, { fontStyle: next as "normal" | "bold" | "italic" | "bold italic" });
  };

  const handleToggleDeco = (deco: "underline" | "linethrough") => {
    updateElement(selectedId!, {
      textDecoration: selectedEl.textDecoration === deco ? "none" : deco,
    });
  };

  const handlePosition = (pos: "top" | "v-center" | "bottom" | "left" | "h-center" | "right") => {
    const pa = getPrintAreaBoundary(shirtType, shirtView, CONTAINER_W, CONTAINER_H);
    const w = selectedEl.width;
    const h = selectedEl.height;
    let x = selectedEl.x;
    let y = selectedEl.y;
    switch (pos) {
      case "top":      y = pa.top;                          break;
      case "v-center": y = pa.top + (pa.height - h) / 2;   break;
      case "bottom":   y = pa.top + pa.height - h;          break;
      case "left":     x = pa.left;                         break;
      case "h-center": x = pa.left + (pa.width  - w) / 2;  break;
      case "right":    x = pa.left + pa.width  - w;         break;
    }
    updateElement(selectedId!, { x, y });
  };

  const fontSize = selectedEl.fontSize || 28;

  return (
    <div className="ds-text-toolbar">
      {/* Font name (read-only, click to go to sidebar) */}
      <div className="ds-text-toolbar-font">
        {selectedEl.fontFamily || "Inter"}
      </div>

      <div className="ds-text-toolbar-divider" />

      {/* Font size stepper */}
      <div className="ds-text-toolbar-size">
        <button
          className="ds-text-toolbar-size-btn"
          onClick={() => updateElement(selectedId!, { fontSize: Math.max(8, fontSize - 1) })}
        >−</button>
        <input
          type="number"
          className="ds-text-toolbar-size-input"
          value={fontSize}
          min={8} max={200}
          onChange={(e) => updateElement(selectedId!, { fontSize: parseInt(e.target.value) || 28 })}
        />
        <button
          className="ds-text-toolbar-size-btn"
          onClick={() => updateElement(selectedId!, { fontSize: Math.min(200, fontSize + 1) })}
        >+</button>
      </div>

      {/* Color */}
      <div className="ds-text-toolbar-color-wrap" title="Màu chữ">
        <input
          type="color"
          className="ds-text-toolbar-color"
          value={selectedEl.fill || "#ffffff"}
          onChange={(e) => updateElement(selectedId!, { fill: e.target.value })}
        />
        <span
          className="ds-text-toolbar-color-bar"
          style={{ background: selectedEl.fill || "#ffffff" }}
        />
      </div>

      <div className="ds-text-toolbar-divider" />

      {/* Format buttons */}
      <div className="ds-text-toolbar-group">
        <button
          title="In đậm"
          className={`ds-text-toolbar-btn ${isBold ? "ds-text-toolbar-btn--active" : ""}`}
          onClick={() => handleToggleStyle("bold")}
        >
          <strong>B</strong>
        </button>
        <button
          title="In nghiêng"
          className={`ds-text-toolbar-btn ${isItalic ? "ds-text-toolbar-btn--active" : ""}`}
          onClick={() => handleToggleStyle("italic")}
        >
          <em style={{ fontStyle: "italic" }}>I</em>
        </button>
        <button
          title="Gạch chân"
          className={`ds-text-toolbar-btn ${isUnderline ? "ds-text-toolbar-btn--active" : ""}`}
          onClick={() => handleToggleDeco("underline")}
        >
          <span style={{ textDecoration: "underline" }}>U</span>
        </button>
        <button
          title="Gạch ngang chữ"
          className={`ds-text-toolbar-btn ${isLinethrough ? "ds-text-toolbar-btn--active" : ""}`}
          onClick={() => handleToggleDeco("linethrough")}
        >
          <span style={{ textDecoration: "line-through" }}>S</span>
        </button>
        <button
          title="Chữ in hoa"
          className={`ds-text-toolbar-btn ${isUppercase ? "ds-text-toolbar-btn--active" : ""}`}
          onClick={() => updateElement(selectedId!, { textTransform: isUppercase ? "none" : "uppercase" })}
        >
          TT
        </button>
      </div>

      <div className="ds-text-toolbar-divider" />

      {/* Align */}
      <div className="ds-text-toolbar-group">
        <button
          title="Căn trái"
          className={`ds-text-toolbar-btn ${align === "left" ? "ds-text-toolbar-btn--active" : ""}`}
          onClick={() => updateElement(selectedId!, { align: "left" })}
        >
          <AlignLeftIcon />
        </button>
        <button
          title="Căn giữa"
          className={`ds-text-toolbar-btn ${align === "center" ? "ds-text-toolbar-btn--active" : ""}`}
          onClick={() => updateElement(selectedId!, { align: "center" })}
        >
          <AlignCenterIcon />
        </button>
        <button
          title="Căn phải"
          className={`ds-text-toolbar-btn ${align === "right" ? "ds-text-toolbar-btn--active" : ""}`}
          onClick={() => updateElement(selectedId!, { align: "right" })}
        >
          <AlignRightIcon />
        </button>
      </div>

      <div className="ds-text-toolbar-divider" />

      {/* Position */}
      <div className="ds-text-toolbar-group">
        <button title="Căn mép trên"     className="ds-text-toolbar-btn" onClick={() => handlePosition("top")}>      <PosTopIcon />      </button>
        <button title="Căn giữa dọc"     className="ds-text-toolbar-btn" onClick={() => handlePosition("v-center")}> <PosMidVIcon />     </button>
        <button title="Căn mép dưới"     className="ds-text-toolbar-btn" onClick={() => handlePosition("bottom")}>   <PosBotIcon />      </button>
        <button title="Căn mép trái"     className="ds-text-toolbar-btn" onClick={() => handlePosition("left")}>     <PosLeftIcon />     </button>
        <button title="Căn giữa ngang"   className="ds-text-toolbar-btn" onClick={() => handlePosition("h-center")}> <PosMidHIcon />     </button>
        <button title="Căn mép phải"     className="ds-text-toolbar-btn" onClick={() => handlePosition("right")}>    <PosRightIcon />    </button>
      </div>
    </div>
  );
}

/* ── SVG Icon helpers ── */
const AlignLeftIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6"  x2="21" y2="6"  /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></svg>;
const AlignCenterIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6"  x2="21" y2="6"  /><line x1="6" y1="12" x2="18" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>;
const AlignRightIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6"  x2="21" y2="6"  /><line x1="9" y1="12" x2="21" y2="12" /><line x1="6" y1="18" x2="21" y2="18" /></svg>;

const PosTopIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="3" x2="12" y2="21"/><polyline points="6 9 12 3 18 9"/></svg>;
const PosBotIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="21" x2="12" y2="3"/><polyline points="18 15 12 21 6 15"/></svg>;
const PosMidVIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="2" x2="12" y2="22"/><line x1="3" y1="12" x2="21" y2="12"/></svg>;
const PosLeftIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="12" x2="21" y2="12"/><polyline points="9 6 3 12 9 18"/></svg>;
const PosRightIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="21" y1="12" x2="3" y2="12"/><polyline points="15 18 21 12 15 6"/></svg>;
const PosMidHIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>;
