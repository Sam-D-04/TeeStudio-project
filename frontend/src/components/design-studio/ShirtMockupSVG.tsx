"use client";

import React from "react";
import { ShirtType, ShirtView } from "@/store/useDesignStore";

interface ShirtMockupProps {
  type: ShirtType;
  view: ShirtView;
  color: string;
  width: number;
  height: number;
}

/**
 * SVG-based shirt mockup that renders inline, supports any color via prop.
 * Includes a dotted "print area" rectangle for visual guidance.
 */
export default function ShirtMockupSVG({
  type,
  view,
  color,
  width,
  height,
}: ShirtMockupProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Drop shadow filter */}
      <defs>
        <filter id="shirtShadow" x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
        </filter>
        <linearGradient id="shirtShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
        </linearGradient>
      </defs>

      {type === "tshirt" && <TShirtPath color={color} view={view} />}
      {type === "polo" && <PoloPath color={color} view={view} />}
      {type === "hoodie" && <HoodiePath color={color} view={view} />}
    </svg>
  );
}

/* ─── T-Shirt SVG ─── */
function TShirtPath({ color, view }: { color: string; view: ShirtView }) {
  return (
    <g filter="url(#shirtShadow)">
      {/* Main shirt body */}
      <path
        d={
          view === "front"
            ? `M120 60 L60 100 L40 160 L80 175 L95 130 L95 440 L305 440 L305 130 L320 175 L360 160 L340 100 L280 60
               C280 60 270 100 200 100 C130 100 120 60 120 60 Z`
            : `M120 60 L60 100 L40 160 L80 175 L95 130 L95 440 L305 440 L305 130 L320 175 L360 160 L340 100 L280 60
               C280 60 260 80 200 80 C140 80 120 60 120 60 Z`
        }
        fill={color}
        stroke="#00000015"
        strokeWidth="2"
      />
      {/* Subtle gradient overlay for realism */}
      <path
        d={
          view === "front"
            ? `M120 60 L60 100 L40 160 L80 175 L95 130 L95 440 L305 440 L305 130 L320 175 L360 160 L340 100 L280 60
               C280 60 270 100 200 100 C130 100 120 60 120 60 Z`
            : `M120 60 L60 100 L40 160 L80 175 L95 130 L95 440 L305 440 L305 130 L320 175 L360 160 L340 100 L280 60
               C280 60 260 80 200 80 C140 80 120 60 120 60 Z`
        }
        fill="url(#shirtShine)"
      />
      {/* Neckline */}
      {view === "front" && (
        <path
          d="M120 60 C120 60 140 95 200 95 C260 95 280 60 280 60"
          fill="none"
          stroke="#00000020"
          strokeWidth="2"
        />
      )}
      {/* Seam lines */}
      <line x1="95" y1="130" x2="95" y2="440" stroke="#00000008" strokeWidth="1" />
      <line x1="305" y1="130" x2="305" y2="440" stroke="#00000008" strokeWidth="1" />
    </g>
  );
}

/* ─── Polo SVG ─── */
function PoloPath({ color, view }: { color: string; view: ShirtView }) {
  return (
    <g filter="url(#shirtShadow)">
      <path
        d={
          view === "front"
            ? `M120 55 L55 100 L35 165 L80 180 L95 130 L95 440 L305 440 L305 130 L320 180 L365 165 L345 100 L280 55
               C280 55 265 95 200 95 C135 95 120 55 120 55 Z`
            : `M120 55 L55 100 L35 165 L80 180 L95 130 L95 440 L305 440 L305 130 L320 180 L365 165 L345 100 L280 55
               C280 55 255 80 200 80 C145 80 120 55 120 55 Z`
        }
        fill={color}
        stroke="#00000015"
        strokeWidth="2"
      />
      <path
        d={
          view === "front"
            ? `M120 55 L55 100 L35 165 L80 180 L95 130 L95 440 L305 440 L305 130 L320 180 L365 165 L345 100 L280 55
               C280 55 265 95 200 95 C135 95 120 55 120 55 Z`
            : `M120 55 L55 100 L35 165 L80 180 L95 130 L95 440 L305 440 L305 130 L320 180 L365 165 L345 100 L280 55
               C280 55 255 80 200 80 C145 80 120 55 120 55 Z`
        }
        fill="url(#shirtShine)"
      />
      {/* Collar */}
      {view === "front" && (
        <>
          <path
            d="M155 55 L170 45 L200 42 L230 45 L245 55"
            fill={color}
            stroke="#00000020"
            strokeWidth="2"
          />
          <path
            d="M155 55 L145 45 L170 38 L200 35 L230 38 L255 45 L245 55"
            fill={color}
            stroke="#00000015"
            strokeWidth="1.5"
          />
          {/* Button placket */}
          <line x1="200" y1="55" x2="200" y2="130" stroke="#00000015" strokeWidth="1.5" />
          <circle cx="200" cy="70" r="2.5" fill="#00000020" />
          <circle cx="200" cy="90" r="2.5" fill="#00000020" />
          <circle cx="200" cy="110" r="2.5" fill="#00000020" />
        </>
      )}
      {view === "back" && (
        <path
          d="M155 55 L145 42 L200 32 L255 42 L245 55"
          fill={color}
          stroke="#00000015"
          strokeWidth="1.5"
        />
      )}
    </g>
  );
}

/* ─── Hoodie SVG ─── */
function HoodiePath({ color, view }: { color: string; view: ShirtView }) {
  return (
    <g filter="url(#shirtShadow)">
      {/* Main body */}
      <path
        d={`M110 65 L50 110 L30 180 L75 195 L90 140 L90 440 L310 440 L310 140 L325 195 L370 180 L350 110 L290 65
             C290 65 270 95 200 95 C130 95 110 65 110 65 Z`}
        fill={color}
        stroke="#00000015"
        strokeWidth="2"
      />
      <path
        d={`M110 65 L50 110 L30 180 L75 195 L90 140 L90 440 L310 440 L310 140 L325 195 L370 180 L350 110 L290 65
             C290 65 270 95 200 95 C130 95 110 65 110 65 Z`}
        fill="url(#shirtShine)"
      />
      {/* Hood */}
      {view === "front" ? (
        <>
          <path
            d="M130 65 C130 25 155 10 200 10 C245 10 270 25 270 65"
            fill={color}
            stroke="#00000015"
            strokeWidth="2"
          />
          <path
            d="M130 65 C130 25 155 10 200 10 C245 10 270 25 270 65"
            fill="url(#shirtShine)"
          />
          {/* Hood inner edge */}
          <path
            d="M145 65 C145 35 165 22 200 22 C235 22 255 35 255 65"
            fill="none"
            stroke="#00000015"
            strokeWidth="1.5"
          />
          {/* Drawstrings */}
          <line x1="185" y1="65" x2="180" y2="140" stroke="#00000015" strokeWidth="1.5" />
          <line x1="215" y1="65" x2="220" y2="140" stroke="#00000015" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <path
            d="M125 65 C125 20 155 5 200 5 C245 5 275 20 275 65"
            fill={color}
            stroke="#00000015"
            strokeWidth="2"
          />
          <path
            d="M125 65 C125 20 155 5 200 5 C245 5 275 20 275 65"
            fill="url(#shirtShine)"
          />
        </>
      )}
      {/* Kangaroo pocket (front only) */}
      {view === "front" && (
        <path
          d="M140 310 Q140 290 170 280 L230 280 Q260 290 260 310 L260 350 Q260 365 240 370 L160 370 Q140 365 140 350 Z"
          fill="none"
          stroke="#00000015"
          strokeWidth="1.5"
        />
      )}
      {/* Bottom ribbing */}
      <rect x="90" y="425" width="220" height="15" rx="2" fill="#00000008" />
    </g>
  );
}

/**
 * Returns the print area bounds (x, y, w, h) within the 400×500 SVG viewBox.
 */
export function getPrintArea(type: ShirtType, view: ShirtView) {
  switch (type) {
    case "tshirt":
      return view === "front"
        ? { x: 120, y: 110, w: 160, h: 200 }
        : { x: 120, y: 100, w: 160, h: 210 };
    case "polo":
      return view === "front"
        ? { x: 120, y: 135, w: 160, h: 190 }
        : { x: 120, y: 100, w: 160, h: 210 };
    case "hoodie":
      return view === "front"
        ? { x: 120, y: 120, w: 160, h: 150 }
        : { x: 115, y: 90, w: 170, h: 220 };
    default:
      return { x: 120, y: 110, w: 160, h: 200 };
  }
}
