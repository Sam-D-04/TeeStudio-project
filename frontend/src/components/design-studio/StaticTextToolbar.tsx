import React, { useState, useRef, useEffect } from "react";
import { useDesignStore } from "@/store/useDesignStore";
import { getPrintAreaBoundary } from "./ShirtMockupImage";
import { ALL_FONTS } from "@/constants/fonts";

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
      {/* Font name — custom dropdown */}
      <FontDropdown
        value={selectedEl.fontFamily || "Inter"}
        onChange={(font) => updateElement(selectedId!, { fontFamily: font })}
      />

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

/* ── Custom Font Dropdown ── */
function FontDropdown({ value, onChange }: { value: string; onChange: (f: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll active item into view when opening
  useEffect(() => {
    if (open && listRef.current) {
      const active = listRef.current.querySelector("[data-active='true']") as HTMLElement;
      if (active) active.scrollIntoView({ block: "center" });
    }
  }, [open]);

  const filtered = search.trim()
    ? ALL_FONTS.filter(f => f.toLowerCase().includes(search.toLowerCase()))
    : ALL_FONTS;

  return (
    <div ref={ref} style={{ position: "relative", height: "100%" }}>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(o => !o); setSearch(""); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 10px",
          height: "100%",
          background: "transparent",
          border: "none",
          color: "#e2e8f0",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          minWidth: 110,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontFamily: `"${value}", sans-serif` }}>{value}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "fixed",
          zIndex: 9999,
          top: (() => {
            const el = ref.current;
            if (!el) return 0;
            const rect = el.getBoundingClientRect();
            return rect.bottom + 4;
          })(),
          left: (() => {
            const el = ref.current;
            if (!el) return 0;
            return el.getBoundingClientRect().left;
          })(),
          width: 200,
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 8,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Search */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #334155" }}>
            <input
              autoFocus
              type="text"
              placeholder="Tìm font..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 5,
                color: "#e2e8f0",
                fontSize: 12,
                padding: "5px 8px",
                outline: "none",
              }}
            />
          </div>

          {/* Font list */}
          <div ref={listRef} style={{ maxHeight: 300, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "12px", color: "#64748b", fontSize: 12, textAlign: "center" }}>
                Không tìm thấy
              </div>
            ) : filtered.map(font => (
              <button
                key={font}
                data-active={font === value}
                onClick={() => { onChange(font); setOpen(false); setSearch(""); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "7px 12px",
                  background: font === value ? "#0f172a" : "transparent",
                  border: "none",
                  borderLeft: font === value ? "2px solid #38bdf8" : "2px solid transparent",
                  color: font === value ? "#38bdf8" : "#cbd5e1",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 12,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (font !== value) (e.currentTarget as HTMLElement).style.background = "#334155"; }}
                onMouseLeave={e => { if (font !== value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span>{font}</span>
                <span style={{ fontFamily: `"${font}", sans-serif`, fontSize: 14, color: "#94a3b8" }}>Aa</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
