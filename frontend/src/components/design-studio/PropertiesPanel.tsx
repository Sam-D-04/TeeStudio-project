"use client";

import { useDesignStore } from "@/store/useDesignStore";
import { getPrintAreaBoundary } from "./ShirtMockupImage";

const CANVAS_W = 500;
const CANVAS_H = 600;

/* ─── Các icon SVG dùng trong panel ─── */
const CopyIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
);
const UpIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);
const DownIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);
const LockIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);
const UnlockIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 0 1 4.5-4.5 4.5 4.5 0 0 1 4.5 4.5v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const RotateIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
const ImageIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
  </svg>
);
const TypeIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20h10M10 4v16m0-16h4a4 4 0 010 8h-4" />
  </svg>
);

const FlipHIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M7 7l-4 4 4 4M17 7l4 4-4 4" />
  </svg>
);
const FlipVIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M7 7l4-4 4 4M7 17l4 4 4-4" />
  </svg>
);

/* ─── Icon căn chỉnh vị trí (căn trái/phải/giữa...) ─── */
const AlignLeftIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h10M3 18h14M3 3v18" />
  </svg>
);
const AlignCenterHIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 9h18M5 15h14" />
  </svg>
);
const AlignRightIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M11 12h10M7 18h14M21 3v18" />
  </svg>
);
const AlignTopIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12M9 3v18M15 3v10M3 3h18" />
  </svg>
);
const AlignCenterVIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M9 3v18M15 5v14" />
  </svg>
);
const AlignBottomIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 21h12M9 3v18M15 11v10M3 21h18" />
  </svg>
);

export default function PropertiesPanel() {
  const {
    selectedId,
    elements,
    shirtType,
    shirtView,
    updateElement,
    removeElement,
    duplicateElement,
    moveElementUp,
    moveElementDown,
    toggleLock,
    pushHistory,
    flipElement,
  } = useDesignStore();

  const el = elements.find((e) => e.id === selectedId);

  if (!el) {
    return (
      <aside className="ds-properties">
        <div className="ds-no-selection">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
          </svg>
          <p>Chọn một phần tử<br />để chỉnh sửa</p>
        </div>
      </aside>
    );
  }

  const handlePropChange = (key: string, value: number | string) => {
    updateElement(el.id, { [key]: value });
  };

  const align = (axis: "x" | "y", position: "start" | "center" | "end") => {
    const pa = getPrintAreaBoundary(shirtType, shirtView, CANVAS_W, CANVAS_H);
    pushHistory();
    if (axis === "x") {
      const x =
        position === "start"  ? pa.left :
        position === "center" ? pa.left + (pa.width  - el.width)  / 2 :
                                pa.left + pa.width  - el.width;
      updateElement(el.id, { x });
    } else {
      const y =
        position === "start"  ? pa.top :
        position === "center" ? pa.top  + (pa.height - el.height) / 2 :
                                pa.top  + pa.height - el.height;
      updateElement(el.id, { y });
    }
  };

  const isImage = el.type === "image";

  return (
    <aside className="ds-properties">

      {/* ── Nhãn loại phần tử (ảnh / văn bản) + trạng thái khoá ── */}
      <div className="ds-prop-type-badge-row">
        <span className={`ds-prop-type-badge ${isImage ? "ds-prop-type-badge--image" : "ds-prop-type-badge--text"}`}>
          {isImage ? <ImageIcon /> : <TypeIcon />}
          {isImage ? "Hình ảnh" : "Văn bản"}
        </span>
        {el.locked && (
          <span className="ds-prop-locked-tag">
            <LockIcon /> Đã khoá
          </span>
        )}
      </div>

      <div className="ds-prop-divider" />

      {/* ── Nhập nội dung văn bản ── */}
      {!isImage && (
        <>
          <div className="ds-prop-field" style={{ width: "100%", flexDirection: "column", alignItems: "flex-start", gap: 6, marginBottom: 16 }}>
            <label className="ds-prop-field-label" style={{ width: "100%", textAlign: "left", fontSize: 13 }}>Nội dung chữ:</label>
            <textarea
              className="ds-prop-input"
              value={el.text || ""}
              onChange={(e) => handlePropChange("text", e.target.value)}
              onBlur={() => pushHistory()}
              disabled={el.locked}
              rows={3}
              style={{ width: "100%", resize: "vertical", padding: "8px", lineHeight: 1.4 }}
              placeholder="Nhập nội dung chữ..."
            />
          </div>
          <div className="ds-prop-divider" />
        </>
      )}

      {/* ── Lưới nhập nhanh vị trí (X, Y) và kích thước (W, H, góc xoay) ── */}
      <div className="ds-prop-grid">
        <div className="ds-prop-field">
          <label className="ds-prop-field-label">X</label>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.x)}
            onChange={(e) => handlePropChange("x", parseInt(e.target.value) || 0)}
            onBlur={() => pushHistory()}
            disabled={el.locked}
          />
        </div>
        <div className="ds-prop-field">
          <label className="ds-prop-field-label">Y</label>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.y)}
            onChange={(e) => handlePropChange("y", parseInt(e.target.value) || 0)}
            onBlur={() => pushHistory()}
            disabled={el.locked}
          />
        </div>
        <div className="ds-prop-field">
          <label className="ds-prop-field-label">W</label>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.width)}
            onChange={(e) => handlePropChange("width", parseInt(e.target.value) || 1)}
            onBlur={() => pushHistory()}
            disabled={el.locked}
          />
        </div>
        <div className="ds-prop-field">
          <label className="ds-prop-field-label">H</label>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.height)}
            onChange={(e) => handlePropChange("height", parseInt(e.target.value) || 1)}
            onBlur={() => pushHistory()}
            disabled={el.locked}
          />
        </div>
        <div className="ds-prop-field ds-prop-field--wide">
          <label className="ds-prop-field-label"><RotateIcon /> Xoay</label>
          <div className="ds-prop-field-with-suffix">
            <input
              className="ds-prop-input"
              type="number"
              value={Math.round(el.rotation)}
              onChange={(e) => handlePropChange("rotation", parseInt(e.target.value) || 0)}
              onBlur={() => pushHistory()}
              disabled={el.locked}
            />
            <span className="ds-prop-input-suffix">°</span>
          </div>
        </div>
      </div>

      <div className="ds-prop-divider" />

      {/* ── Căn chỉnh vị trí theo vùng in ── */}
      {!el.locked && (
        <>
          <div className="ds-prop-section-label">Căn chỉnh theo vùng in</div>
          <div className="ds-prop-align-row">
            <button
              className="ds-prop-align-btn"
              title="Căn trái"
              onClick={() => align("x", "start")}
            >
              <AlignLeftIcon />
            </button>
            <button
              className="ds-prop-align-btn"
              title="Căn giữa ngang"
              onClick={() => align("x", "center")}
            >
              <AlignCenterHIcon />
            </button>
            <button
              className="ds-prop-align-btn"
              title="Căn phải"
              onClick={() => align("x", "end")}
            >
              <AlignRightIcon />
            </button>
            <button
              className="ds-prop-align-btn"
              title="Căn trên"
              onClick={() => align("y", "start")}
            >
              <AlignTopIcon />
            </button>
            <button
              className="ds-prop-align-btn"
              title="Căn giữa dọc"
              onClick={() => align("y", "center")}
            >
              <AlignCenterVIcon />
            </button>
            <button
              className="ds-prop-align-btn"
              title="Căn dưới"
              onClick={() => align("y", "end")}
            >
              <AlignBottomIcon />
            </button>
          </div>
          <div className="ds-prop-divider" />
        </>
      )}

      {/* ── Hàng thao tác nhanh: nhân đôi / khoá / flip / đổi thứ tự lớp ── */}
      <div className="ds-prop-actions-row">
        <button
          className="ds-prop-icon-btn"
          onClick={() => duplicateElement(el.id)}
          title="Nhân đôi"
        >
          <CopyIcon />
          <span>Nhân đôi</span>
        </button>
        <button
          className={`ds-prop-icon-btn ${el.locked ? "ds-prop-icon-btn--active" : ""}`}
          onClick={() => toggleLock(el.id)}
          title={el.locked ? "Mở khoá" : "Khoá"}
        >
          {el.locked ? <LockIcon /> : <UnlockIcon />}
          <span>{el.locked ? "Mở khoá" : "Khoá"}</span>
        </button>
        <button
          className="ds-prop-icon-btn"
          onClick={() => moveElementUp(el.id)}
          title="Lên trên"
        >
          <UpIcon />
          <span>Lên trên</span>
        </button>
        <button
          className="ds-prop-icon-btn"
          onClick={() => moveElementDown(el.id)}
          title="Xuống dưới"
        >
          <DownIcon />
          <span>Xuống</span>
        </button>
        {/* Flip ngang / dọc — áp dụng cho cả text lẫn image */}
        <button
          className={`ds-prop-icon-btn ${el.flipH ? "ds-prop-icon-btn--active" : ""}`}
          onClick={() => flipElement(el.id, "H")}
          title="Lật ngang"
          disabled={el.locked}
        >
          <FlipHIcon />
          <span>Lật ngang</span>
        </button>
        <button
          className={`ds-prop-icon-btn ${el.flipV ? "ds-prop-icon-btn--active" : ""}`}
          onClick={() => flipElement(el.id, "V")}
          title="Lật dọc"
          disabled={el.locked}
        >
          <FlipVIcon />
          <span>Lật dọc</span>
        </button>
      </div>

      <div className="ds-prop-divider" />

      {/* ── Nút xoá phần tử ── */}
      <button
        className="ds-prop-delete-btn"
        onClick={() => removeElement(el.id)}
      >
        <TrashIcon /> Xoá phần tử
      </button>

    </aside>
  );
}
