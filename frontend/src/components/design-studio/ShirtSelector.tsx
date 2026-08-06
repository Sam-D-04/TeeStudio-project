"use client";

import React from "react";
import { useDesignStore, ShirtType } from "@/store/useDesignStore";

interface ShirtSelectorProps {
  /** 
   * Có hiển thị phần chọn Loại áo (T-shirt, Polo, Hoodie) không? 
   * - Khách hàng thường chọn từ trang ngoài nên có thể ẩn (false).
   * - Admin khi tạo thiết kế mới có thể cần đổi (true).
   */
  showShirtType?: boolean;
  
  /** 
   * Bỏ qua trạng thái isRevisionMode (nếu true, component luôn cho phép sửa màu).
   * Hữu ích cho giao diện Admin.
   */
  ignoreRevisionMode?: boolean;
}

const SHIRT_TYPE_OPTIONS: { value: ShirtType; label: string }[] = [
  { value: "tshirt", label: "Áo Thun" },
  { value: "polo", label: "Áo Polo" },
  { value: "hoodie", label: "Áo Hoodie" },
  { value: "sweater", label: "Áo Sweater" },
];

export default function ShirtSelector({ 
  showShirtType = false,
  ignoreRevisionMode = false
}: ShirtSelectorProps) {
  const { 
    shirtType, 
    setShirtType, 
    shirtColor, 
    setShirtColor, 
    availableColors,
    currentDesignStatus 
  } = useDesignStore();

  const isRevisionMode = currentDesignStatus === "NEEDS_REVISION";
  const isDisabled = !ignoreRevisionMode && isRevisionMode;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* 1. Chọn Loại Áo (Chỉ hiển thị nếu showShirtType = true) */}
      {showShirtType && (
        <div
          style={{
            display: "flex",
            background: "rgba(30, 41, 59, 0.7)",
            backdropFilter: "blur(12px)",
            padding: "4px 12px",
            borderRadius: 9999,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>Loại áo:</span>
          <select
            value={shirtType}
            onChange={(e) => setShirtType(e.target.value as ShirtType)}
            disabled={isDisabled}
            style={{
              background: "transparent",
              color: "#fff",
              border: "none",
              outline: "none",
              fontSize: 13,
              fontWeight: 500,
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.5 : 1
            }}
          >
            {SHIRT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ color: "#000" }}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. Chọn Màu Áo (Hiển thị dựa vào availableColors) */}
      {availableColors.length > 0 && !isDisabled && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
            background: "rgba(30, 41, 59, 0.7)", // bg-slate-800/70
            backdropFilter: "blur(12px)",
            padding: "6px 12px",
            borderRadius: 9999,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {availableColors.map((colorHex) => {
            const isActive = shirtColor.toLowerCase() === colorHex.toLowerCase();
            return (
              <button
                key={colorHex}
                onClick={() => setShirtColor(colorHex)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: colorHex,
                  border: isActive ? "2px solid #0ea5e9" : "2px solid transparent",
                  boxShadow: isActive ? "0 0 0 2px rgba(14, 165, 233, 0.3)" : "inset 0 1px 3px rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                title={`Đổi màu áo`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
