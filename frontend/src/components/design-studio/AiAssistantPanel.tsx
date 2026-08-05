"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useDesignStore, selectElementsBySide, type DesignElement } from "@/store/useDesignStore";
import { getPrintAreaBoundary } from "./ShirtMockupImage";
import { aiDesignService, type AiDesignElement } from "@/services/aiDesignService";
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
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

const WandIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM4 20 14 10M18 14l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1Z" />
  </svg>
);

const ContrastIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 0a9 9 0 0 1 0 18" />
  </svg>
);

function toDesignElements(
  items: AiDesignElement[],
  side: DesignElement["side"]
): DesignElement[] {
  return items.map((el) => ({ ...el, id: uuidv4(), type: el.type || "text", side }));
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
  const currentElements = selectElementsBySide(elements, shirtView);
  const hasText = currentElements.some((e) => e.type === "text");
  const palette = React.useMemo(() => suggestTextPalette(shirtColor), [shirtColor]);

  const printArea = React.useMemo(() => {
    const pa = getPrintAreaBoundary(shirtType, shirtView, CONTAINER_W, CONTAINER_H);
    return { left: pa.left, top: pa.top, width: pa.width, height: pa.height };
  }, [shirtType, shirtView]);

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
    if (currentElements.length === 0) return;
    setError(null);
    setArranging(true);
    try {
      const result = await aiDesignService.arrange({ shirtType, shirtView, shirtColor, printArea, elements: currentElements });
      const updatedCurrentElements = result.map((aiEl, index) => {
        const originalEl = currentElements[index];
        return { ...originalEl, ...aiEl };
      });
      const otherSideElements = elements.filter(e => e.side !== shirtView);
      applyElements([...otherSideElements, ...updatedCurrentElements]);
    } catch (err: any) {
      setError(err.message || "AI không sắp xếp được bố cục. Vui lòng thử lại.");
    } finally {
      setArranging(false);
    }
  };

  return (
    <div className="ds-sidebar-pane flex flex-col gap-5" style={{ padding: 16, overflowY: "auto" }}>
      <div className="flex items-center gap-2 text-sky-400">
        <SparkleIcon />
        <h3 className="text-base font-bold m-0 text-slate-100">Trợ lý thiết kế AI</h3>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs shadow-inner">
          {error}
        </div>
      )}

      {/* ── Sinh thiết kế mới bằng AI ── */}
      <div className="flex flex-col gap-3">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Sáng tạo thiết kế mới</div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Mô tả ý tưởng (VD: một phi hành gia leo núi)... để trống để AI tự phiêu"
          rows={3}
          disabled={generating}
          className="w-full box-border resize-y bg-slate-800/50 border border-slate-700/50 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 rounded-xl text-slate-200 text-sm p-3 font-inherit transition-all outline-none"
        />
        <button 
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={handleGenerate} 
          disabled={generating}
        >
          <SparkleIcon /> {generating ? "AI đang vẽ..." : "Tạo bằng AI ngay"}
        </button>
      </div>

      <div className="h-px bg-slate-800/60 w-full my-1"></div>



      {/* ── Công cụ nhanh (không dùng AI) ── */}
      {hasText && (
        <div className="flex flex-col gap-3">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mt-2">Tiện ích nhanh</div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="text-xs text-slate-500 font-medium">Bảng màu hợp với nền áo:</div>
            <div className="flex flex-wrap gap-2">
              {palette.map((c) => (
                <button
                  key={c}
                  title={`Áp màu ${c} cho toàn bộ chữ`}
                  onClick={() => applyElements(applyTextColor(elements, c))}
                  className="w-8 h-8 rounded-full border-2 border-slate-700 hover:scale-110 hover:border-slate-400 transition-all shadow-sm"
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="text-xs text-slate-500 font-medium">Gợi ý cặp font chuyên gia:</div>
            <div className="grid grid-cols-1 gap-2">
              {FONT_PAIRINGS.map((p) => (
                <button 
                  key={p.label} 
                  className="flex flex-col w-full py-3 px-4 rounded-xl border border-slate-700/40 bg-gradient-to-b from-slate-800/40 to-slate-800/80 hover:border-slate-500/50 hover:from-slate-700/60 hover:to-slate-800 text-left transition-all group"
                  onClick={() => applyElements(applyFontPairing(elements, p))}
                >
                  <span className="text-[15px] font-medium text-slate-200 group-hover:text-white transition-colors tracking-wide" style={{ fontFamily: `"${p.heading}", sans-serif` }}>{p.label}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5" style={{ fontFamily: `"${p.body}", sans-serif` }}>{p.heading} + {p.body}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
