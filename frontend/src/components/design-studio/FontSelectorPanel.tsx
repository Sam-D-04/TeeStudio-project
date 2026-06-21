import React, { useState } from "react";
import { useDesignStore } from "@/store/useDesignStore";
import { FONT_CATEGORIES, ALL_FONTS } from "@/constants/fonts";

export default function FontSelectorPanel() {
  const { selectedId, elements, updateElement, addElement, shirtType, shirtView } = useDesignStore();
  const selectedEl = elements.find((e) => e.id === selectedId);

  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [search, setSearch] = useState("");

  const currentFont = selectedEl?.fontFamily || "Inter";

  const handleFontChange = (font: string) => {
    if (selectedEl && selectedEl.type === "text") {
      updateElement(selectedId!, { fontFamily: font });
    } else {
      addElement({
        type: "text",
        x: 500 * 0.30 + 500 * 0.40 * 0.2,
        y: 600 * 0.28 + 600 * 0.42 * 0.1,
        width: 200,
        height: 40,
        rotation: 0,
        text: "Văn bản mẫu",
        fontSize: 28,
        fontFamily: font,
        fill: "#000000",
        fontStyle: "normal",
      });
    }
  };

  const rawFonts =
    activeCategoryId === "all"
      ? ALL_FONTS
      : FONT_CATEGORIES.find((c) => c.id === activeCategoryId)?.fonts || [];

  const fontsToShow = search.trim()
    ? rawFonts.filter((f) => f.toLowerCase().includes(search.toLowerCase()))
    : rawFonts;

  return (
    <div className="ds-font-selector">
      {/* Search */}
      <div className="ds-font-search">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Tìm font chữ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="ds-font-body">
        {/* Cột trái: Danh mục */}
        <div className="ds-font-categories">
          <button
            onClick={() => setActiveCategoryId("all")}
            className={`ds-font-cat-btn ${activeCategoryId === "all" ? "ds-font-cat-btn--active" : ""}`}
          >
            <span>Tất cả</span>
            <span className="ds-font-cat-count">{ALL_FONTS.length}</span>
          </button>

          {FONT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`ds-font-cat-btn ${activeCategoryId === cat.id ? "ds-font-cat-btn--active" : ""}`}
            >
              <span>{cat.name}</span>
              <span className="ds-font-cat-count">{cat.fonts.length}</span>
            </button>
          ))}
        </div>

        {/* Cột phải: Danh sách Font */}
        <div className="ds-font-list">
          {fontsToShow.length === 0 ? (
            <div className="ds-font-empty">Không tìm thấy font nào</div>
          ) : (
            fontsToShow.map((font) => (
              <button
                key={font}
                onClick={() => handleFontChange(font)}
                className={`ds-font-item ${currentFont === font ? "ds-font-item--active" : ""}`}
              >
                <span className="ds-font-name">{font}</span>
                <span
                  className="ds-font-preview"
                  style={{ fontFamily: `"${font}", sans-serif` }}
                >
                  Aa
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Hint khi chưa chọn text */}
      {(!selectedEl || selectedEl.type !== "text") && (
        <div className="ds-font-hint">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          Chọn một đoạn văn bản trên áo để thay đổi font
        </div>
      )}
    </div>
  );
}
