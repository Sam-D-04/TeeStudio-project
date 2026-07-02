"use client";

/**
 * DesignResourceTab – Tab "Tài nguyên thiết kế"
 *
 * Dữ liệu lấy từ API thật:
 *  - GET /api/admin/designs/stickers
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusOutlined,
  DeleteOutlined,
  PictureOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import * as designService from "@/services/admin/designService";
import type { Sticker } from "@/services/admin/designService";

// Màu nền cho từng loại sticker (khi chưa có ảnh thật)
const MAU_NEN_LOAI: Record<string, string> = {
  logo: "#e0f2fe",
  hinh_ve: "#f3e8ff",
  chu_viet: "#fef9c3",
};

// Nhãn hiển thị loại sticker
const NHAN_LOAI_STICKER: Record<string, string> = {
  logo: "Logo",
  hinh_ve: "Hình vẽ",
  chu_viet: "Chữ viết",
};

export default function DesignResourceTab() {
  const queryClient = useQueryClient();

  // ── State form thêm sticker ──
  const [hienFormSticker, setHienFormSticker] = useState(false);
  const [formSticker, setFormSticker] = useState({
    ten: "",
    urlAnh: "",
    loai: "hinh_ve" as "logo" | "hinh_ve" | "chu_viet",
  });

  // ─── Fetch sticker ──────────────────────────────────────────────────────
  const {
    data: danhSachSticker = [],
    isLoading: dangTaiSticker,
    isError: loiSticker,
  } = useQuery({
    queryKey: ["stickers-admin"],
    queryFn: designService.layDanhSachSticker,
  });

  // ─── Mutation: Thêm sticker ─────────────────────────────────────────────
  const mutationThemSticker = useMutation({
    mutationFn: designService.themSticker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers-admin"] });
      setHienFormSticker(false);
      setFormSticker({ ten: "", urlAnh: "", loai: "hinh_ve" });
    },
    onError: (err: Error) => alert(`Lỗi: ${err.message}`),
  });

  // ─── Mutation: Xóa sticker ──────────────────────────────────────────────
  const mutationXoaSticker = useMutation({
    mutationFn: designService.xoaSticker,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stickers-admin"] }),
    onError: (err: Error) => alert(`Lỗi khi xóa sticker: ${err.message}`),
  });

  // ─── Handlers ───────────────────────────────────────────────────────────
  function xuLyXoaSticker(id: number) {
    if (window.confirm("Bạn có chắc muốn xóa sticker này?")) {
      mutationXoaSticker.mutate(id);
    }
  }

  function xuLyGuiFormSticker(e: React.FormEvent) {
    e.preventDefault();
    if (!formSticker.ten.trim()) return alert("Vui lòng nhập tên sticker");
    if (!formSticker.urlAnh.trim()) return alert("Vui lòng nhập URL ảnh sticker");
    mutationThemSticker.mutate(formSticker);
  }

  // Style chung cho input/select trong form
  const styleInput: React.CSSProperties = {
    width: "100%",
    height: 38,
    padding: "0 12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 13,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 32 }}>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* KHU VỰC 1: Sticker có sẵn                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div>
        {/* Tiêu đề khu vực */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PictureOutlined style={{ color: "#0ea5e9", fontSize: 18 }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Sticker có sẵn
            </h3>
            <span style={{ padding: "1px 8px", borderRadius: 20, background: "#e0f2fe", color: "#0284c7", fontSize: 12, fontWeight: 600 }}>
              {danhSachSticker.length}
            </span>
          </div>

          <button
            onClick={() => setHienFormSticker(!hienFormSticker)}
            style={{
              height: 36, padding: "0 14px", display: "flex", alignItems: "center", gap: 6,
              background: "#0ea5e9", border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "#ffffff", cursor: "pointer",
            }}
          >
            <PlusOutlined style={{ fontSize: 13 }} />
            Thêm sticker
          </button>
        </div>

        {/* Form thêm sticker */}
        {hienFormSticker && (
          <form
            onSubmit={xuLyGuiFormSticker}
            style={{
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12,
              padding: 16, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                Tên sticker *
              </label>
              <input
                style={styleInput}
                placeholder="Ví dụ: Ngôi sao vàng"
                value={formSticker.ten}
                onChange={(e) => setFormSticker((f) => ({ ...f, ten: e.target.value }))}
              />
            </div>
            <div style={{ flex: "2 1 260px" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                URL ảnh (Cloudinary) *
              </label>
              <input
                style={styleInput}
                placeholder="https://res.cloudinary.com/..."
                value={formSticker.urlAnh}
                onChange={(e) => setFormSticker((f) => ({ ...f, urlAnh: e.target.value }))}
              />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                Loại *
              </label>
              <select
                style={{ ...styleInput }}
                value={formSticker.loai}
                onChange={(e) => setFormSticker((f) => ({ ...f, loai: e.target.value as typeof f.loai }))}
              >
                <option value="hinh_ve">Hình vẽ</option>
                <option value="logo">Logo</option>
                <option value="chu_viet">Chữ viết</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={mutationThemSticker.isPending}
                style={{
                  height: 38, padding: "0 16px", background: "#0ea5e9", border: "none",
                  borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#ffffff",
                  cursor: mutationThemSticker.isPending ? "not-allowed" : "pointer",
                }}
              >
                {mutationThemSticker.isPending ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => setHienFormSticker(false)}
                style={{
                  height: 38, padding: "0 16px", background: "#ffffff",
                  border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#475569",
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* Loading / Error sticker */}
        {dangTaiSticker && (
          <div style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            <LoadingOutlined style={{ fontSize: 20, marginBottom: 8, display: "block" }} />
            Đang tải sticker...
          </div>
        )}
        {loiSticker && !dangTaiSticker && (
          <div style={{ padding: "32px 0", textAlign: "center", color: "#ef4444", fontSize: 14 }}>
            <WarningOutlined style={{ fontSize: 20, marginBottom: 8, display: "block" }} />
            Không thể tải sticker.
          </div>
        )}

        {/* Lưới hiển thị sticker */}
        {!dangTaiSticker && !loiSticker && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {danhSachSticker.length === 0 && (
              <p style={{ color: "#94a3b8", fontSize: 13, gridColumn: "1 / -1" }}>Chưa có sticker nào.</p>
            )}
            {danhSachSticker.map((sticker: Sticker) => (
              <div
                key={sticker.id}
                style={{
                  background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12,
                  padding: 12, display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 8, position: "relative", transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  const div = e.currentTarget as HTMLDivElement;
                  div.style.borderColor = "#bae6fd";
                  div.style.boxShadow = "0 4px 12px rgba(14,165,233,0.1)";
                }}
                onMouseLeave={(e) => {
                  const div = e.currentTarget as HTMLDivElement;
                  div.style.borderColor = "#e2e8f0";
                  div.style.boxShadow = "none";
                }}
              >
                {/* Nút xóa – góc phải trên */}
                <button
                  title="Xóa sticker"
                  onClick={() => xuLyXoaSticker(sticker.id)}
                  style={{
                    position: "absolute", top: 8, right: 8, width: 24, height: 24,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 4, border: "none", background: "transparent",
                    color: "#94a3b8", cursor: "pointer", fontSize: 12, transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.color = "#ea580c"; btn.style.background = "#ffedd5";
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.color = "#94a3b8"; btn.style.background = "transparent";
                  }}
                >
                  <DeleteOutlined />
                </button>

                {/* Ô ảnh sticker */}
                <div
                  style={{
                    width: 80, height: 80, borderRadius: 8,
                    backgroundColor: MAU_NEN_LOAI[sticker.loai] || "#f8fafc",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid #e2e8f0", overflow: "hidden",
                  }}
                >
                  {sticker.urlAnh ? (
                    <img
                      src={sticker.urlAnh}
                      alt={sticker.ten}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <PictureOutlined style={{ fontSize: 28, color: "#94a3b8" }} />
                  )}
                </div>

                {/* Tên sticker */}
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#0f172a", textAlign: "center", wordBreak: "break-word" }}>
                  {sticker.ten}
                </p>

                {/* Badge loại */}
                <span style={{ fontSize: 10, color: "#94a3b8", background: "#f8fafc", padding: "1px 6px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  {NHAN_LOAI_STICKER[sticker.loai] || sticker.loai}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
