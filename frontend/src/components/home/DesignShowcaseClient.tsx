"use client";

import { useRouter } from "next/navigation";
import { ShowcaseDesignItem } from "./DesignShowcase";

interface Props {
  designs: ShowcaseDesignItem[];
}

/* ── Utility: chọn màu chữ tương phản với nền ────────────────────────────── */
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1e293b" : "#f8fafc";
}

/* ── Card thiết kế mẫu ───────────────────────────────────────────────────── */
function DesignCard({ design, index }: { design: ShowcaseDesignItem; index: number }) {
  const router = useRouter();

  const handleUse = () => {
    router.push(`/design-studio?templateDesignId=${design.id}`);
  };

  const contrastColor = getContrastColor(design.baseColor || "#ffffff");

  return (
    <div
      className="ds-showcase-card"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={handleUse}
      title={`Dùng mẫu: ${design.name}`}
    >
      {/* Nền áo theo màu baseColor */}
      <div
        className="ds-showcase-card__bg"
        style={{ background: design.baseColor || "#f1f5f9" }}
      >
        {/* Ảnh preview thiết kế */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={design.previewUrl}
          alt={design.name}
          className="ds-showcase-card__img"
          loading="lazy"
          draggable={false}
        />

        {/* Overlay hover */}
        <div className="ds-showcase-card__overlay">
          <button className="ds-showcase-card__btn" onClick={handleUse}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM4 20 14 10" />
            </svg>
            Dùng mẫu này
          </button>
        </div>
      </div>

      {/* Tên thiết kế */}
      <div className="ds-showcase-card__footer">
        <span className="ds-showcase-card__name">{design.name}</span>
        <span className="ds-showcase-card__tag" style={{ background: design.baseColor, color: contrastColor }}>
          Xem &amp; sửa
        </span>
      </div>
    </div>
  );
}

/* ── Section chính ───────────────────────────────────────────────────────── */
export default function DesignShowcaseClient({ designs }: Props) {
  return (
    <section className="ds-showcase-section">
      {/* Header */}
      <div className="ds-showcase-header">
        <div className="ds-showcase-badge">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          Thiết kế mẫu từ TeeStudio
        </div>
        <h2 className="ds-showcase-title">
          Bắt đầu từ mẫu có sẵn
        </h2>
        <p className="ds-showcase-desc">
          Chọn một thiết kế bên dưới để mở trong Design Studio — bạn có thể chỉnh sửa, thay màu, thêm chi tiết theo ý thích rồi đặt hàng ngay.
        </p>
      </div>

      {/* Grid thiết kế */}
      <div className="ds-showcase-grid">
        {designs.map((design, i) => (
          <DesignCard key={design.id} design={design} index={i} />
        ))}
      </div>

      <style>{`
        .ds-showcase-section {
          padding: 80px 24px;
          max-width: 1280px;
          margin: 0 auto;
        }

        .ds-showcase-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .ds-showcase-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.12));
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          color: #818cf8;
          margin-bottom: 16px;
          letter-spacing: 0.02em;
        }

        .ds-showcase-title {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          color: #f1f5f9;
          margin: 0 0 16px;
          line-height: 1.2;
          background: linear-gradient(135deg, #e2e8f0 0%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ds-showcase-desc {
          font-size: 16px;
          color: #94a3b8;
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .ds-showcase-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .ds-showcase-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .ds-showcase-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .ds-showcase-section { padding: 56px 16px; }
        }

        /* Card */
        .ds-showcase-card {
          cursor: pointer;
          border-radius: 16px;
          overflow: hidden;
          background: #1e293b;
          border: 1px solid rgba(99,102,241,0.12);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          animation: ds-card-in 0.45s ease both;
        }

        @keyframes ds-card-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ds-showcase-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.4);
          border-color: rgba(99,102,241,0.4);
        }

        /* Phần ảnh */
        .ds-showcase-card__bg {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ds-showcase-card__img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .ds-showcase-card:hover .ds-showcase-card__img {
          transform: scale(1.05);
        }

        /* Overlay hiện khi hover */
        .ds-showcase-card__overlay {
          position: absolute;
          inset: 0;
          background: rgba(15,23,42,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.22s ease;
          backdrop-filter: blur(2px);
        }

        .ds-showcase-card:hover .ds-showcase-card__overlay {
          opacity: 1;
        }

        .ds-showcase-card__btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: white;
          border: none;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transform: translateY(8px);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
        }

        .ds-showcase-card:hover .ds-showcase-card__btn {
          transform: translateY(0);
        }

        .ds-showcase-card__btn:hover {
          box-shadow: 0 6px 20px rgba(99,102,241,0.5);
        }

        /* Footer */
        .ds-showcase-card__footer {
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .ds-showcase-card__name {
          font-size: 13px;
          font-weight: 600;
          color: #cbd5e1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .ds-showcase-card__tag {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 100px;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.03em;
          opacity: 0.9;
        }
      `}</style>
    </section>
  );
}
