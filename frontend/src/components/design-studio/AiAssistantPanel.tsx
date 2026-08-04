"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useDesignStore, selectElementsBySide, type DesignElement } from "@/store/useDesignStore";
import { getPrintAreaBoundary } from "./ShirtMockupImage";
import { aiDesignService, type AiTextElement } from "@/services/aiDesignService";
import {
  FONT_PAIRINGS,
  suggestTextPalette,
  fixTextContrast,
  applyTextColor,
  applyFontPairing,
} from "@/lib/designAssistant";

const CONTAINER_W = 500;
const CONTAINER_H = 600;

const SparkleIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);
const WandIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM4 20 14 10M18 14l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1Z" />
  </svg>
);

const sectionTitle: React.CSSProperties = {
  fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em",
  color: "#94a3b8", margin: "18px 0 8px", fontWeight: 700,
};
const primaryBtn: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8, border: "none",
  background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "#fff",
  fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 8,
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
};
const ghostBtn: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0",
  fontWeight: 500, fontSize: 13, cursor: "pointer", marginBottom: 8, textAlign: "left",
};

/**
 * Gán id + type:"text" cho các phần tử AI trả về (backend chỉ trả thuộc tính
 * text). Đồng thời gắn "side" theo mặt áo đang xem lúc gọi AI - vì nội dung
 * AI sinh ra là để đặt lên đúng mặt khách đang thiết kế.
 */
function toDesignElements(
  items: AiTextElement[],
  side: DesignElement["side"]
): DesignElement[] {
  return items.map((el) => ({ ...el, id: uuidv4(), type: "text" as const, side }));
}

export default function AiAssistantPanel() {
  const elements = useDesignStore((s) => s.elements);
  const shirtType = useDesignStore((s) => s.shirtType);
  const shirtView = useDesignStore((s) => s.shirtView);
  const shirtColor = useDesignStore((s) => s.shirtColor);

  const [prompt, setPrompt] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [arranging, setArranging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const hasItems = elements.length > 0;
  // Chỉ lấy phần tử chữ CỦA MẶT ĐANG XEM - "Sắp xếp bố cục" chỉ nên sắp xếp
  // lại chữ trên mặt khách đang thiết kế, không đụng tới chữ ở mặt kia.
  const textElements = selectElementsBySide(elements, shirtView).filter(
    (e) => e.type === "text"
  );
  const hasText = textElements.length > 0;
  const palette = React.useMemo(() => suggestTextPalette(shirtColor), [shirtColor]);

  const printArea = React.useMemo(() => {
    const pa = getPrintAreaBoundary(shirtType, shirtView, CONTAINER_W, CONTAINER_H);
    return { left: pa.left, top: pa.top, width: pa.width, height: pa.height };
  }, [shirtType, shirtView]);

  /* Áp một mảng elements mới (gom 1 bước undo). */
  const applyElements = (next: DesignElement[]) => {
    useDesignStore.getState().pushHistory();
    useDesignStore.setState({ elements: next, selectedId: null });
  };

  const handleGenerate = async () => {
    if (hasItems && !confirm("AI sẽ tạo thiết kế mới và thay thế thiết kế hiện tại. Tiếp tục?")) return;
    setError(null);
    setGenerating(true);
    try {
      const result = await aiDesignService.generate({ shirtType, shirtView, shirtColor, printArea, prompt });
      applyElements(toDesignElements(result, shirtView));
    } catch (err: any) {
      setError(err.message || "AI không sinh được thiết kế. Vui lòng thử lại.");
    } finally {
      setGenerating(false);
    }
  };

  const handleArrange = async () => {
    if (!hasText) return;
    setError(null);
    setArranging(true);
    try {
      const result = await aiDesignService.arrange({ shirtType, shirtView, shirtColor, printArea, elements: textElements });
      // Ghép kết quả trở lại đúng vị trí trong mảng gốc - CHỈ áp dụng cho phần
      // tử chữ của mặt đang xem (khớp với "textElements" đã gửi lên AI ở trên),
      // giữ nguyên mọi phần tử khác (ảnh, và chữ ở mặt kia nếu có).
      let i = 0;
      const merged = elements.map((e) =>
        e.type === "text" && (e.side ?? "front") === shirtView
          ? { ...e, ...result[i++] }
          : e
      );
      applyElements(merged);
    } catch (err: any) {
      setError(err.message || "AI không sắp xếp được bố cục. Vui lòng thử lại.");
    } finally {
      setArranging(false);
    }
  };

  return (
    <div className="ds-sidebar-pane" style={{ padding: 12, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#38bdf8", marginBottom: 4 }}>
        <SparkleIcon />
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#e2e8f0" }}>Trợ lý thiết kế</h3>

      </div>


      {error && (
        <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 8, padding: "8px 10px", color: "#fca5a5", fontSize: 12, margin: "8px 0" }}>
          {error}
        </div>
      )}

      {/* ── Sinh thiết kế mới bằng AI ── */}
      <div style={sectionTitle}>Sinh thiết kế mới</div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Mô tả điều bạn muốn (VD: slogan về đam mê leo núi)… để trống để AI tự sáng tạo"
        rows={3}
        disabled={generating}
        style={{
          width: "100%", boxSizing: "border-box", resize: "vertical",
          background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
          color: "#e2e8f0", fontSize: 12, padding: "8px 10px", marginBottom: 8,
          fontFamily: "inherit",
        }}
      />
      <button style={primaryBtn} onClick={handleGenerate} disabled={generating}>
        <SparkleIcon /> {generating ? "AI đang sáng tạo…" : "Sinh thiết kế"}
      </button>

      {/* ── Tự sắp xếp bố cục bằng AI ── */}
      {hasText && (
        <>
          <div style={sectionTitle}>Cải thiện bố cục hiện tại</div>
          <button style={primaryBtn} onClick={handleArrange} disabled={arranging}>
            <WandIcon /> {arranging ? "AI đang sắp xếp…" : "Tự sắp xếp"}
          </button>

        </>
      )}

      {/* ── Công cụ nhanh (không dùng AI) ── */}
      {hasText && (
        <>
          <div style={sectionTitle}>Công cụ nhanh</div>
          <button style={ghostBtn} onClick={() => applyElements(fixTextContrast(elements, shirtColor))}>
            Sửa tương phản màu chữ cho dễ đọc
          </button>

          <div style={{ fontSize: 11, color: "#64748b", margin: "4px 0 6px" }}>Phối màu gợi ý theo màu áo</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
            {palette.map((c) => (
              <button
                key={c}
                title={`Áp màu ${c} cho chữ`}
                onClick={() => applyElements(applyTextColor(elements, c))}
                style={{
                  width: 30, height: 30, borderRadius: 8, cursor: "pointer",
                  background: c, border: "2px solid #334155",
                }}
              />
            ))}
          </div>

          <div style={{ fontSize: 11, color: "#64748b", margin: "10px 0 6px" }}>Đổi cặp font</div>
          {FONT_PAIRINGS.map((p) => (
            <button key={p.label} style={ghostBtn} onClick={() => applyElements(applyFontPairing(elements, p))}>
              <span style={{ fontWeight: 700 }}>{p.label}</span>
              <span style={{ color: "#64748b", fontSize: 11 }}> · {p.heading} + {p.body}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}
