"use client";

/**
 * DesignResourceTab – Tab "Tài nguyên thiết kế"
 *
 * Dữ liệu lấy từ API thật:
 *  - GET /api/admin/designs/stickers
 */

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  PictureOutlined,
  UploadOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import * as designService from "@/services/admin/designService";
import type { Sticker } from "@/services/admin/designService";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

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
    loai: "hinh_ve" as "logo" | "hinh_ve" | "chu_viet",
  });
  const [anhSticker, setAnhSticker] = useState<File | null>(null);
  const [xemTruocAnh, setXemTruocAnh] = useState("");

  useEffect(() => {
    return () => {
      if (xemTruocAnh) URL.revokeObjectURL(xemTruocAnh);
    };
  }, [xemTruocAnh]);

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
      setFormSticker({ ten: "", loai: "hinh_ve" });
      setAnhSticker(null);
      setXemTruocAnh("");
    },
    onError: (error) => alert(getApiErrorMessage(error, "Không thể thêm sticker")),
  });

  // ─── Mutation: Xóa sticker ──────────────────────────────────────────────
  const mutationXoaSticker = useMutation({
    mutationFn: designService.xoaSticker,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stickers-admin"] }),
    onError: (error) => alert(getApiErrorMessage(error, "Không thể xóa sticker")),
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
    if (!anhSticker) return alert("Vui lòng chọn ảnh sticker");
    mutationThemSticker.mutate({ ...formSticker, ten: formSticker.ten.trim(), anh: anhSticker });
  }

  function xuLyChonAnh(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!acceptedTypes.includes(file.type)) {
      e.target.value = "";
      return alert("Ảnh sticker phải là JPG, PNG, WEBP, GIF hoặc SVG");
    }

    if (file.size > 5 * 1024 * 1024) {
      e.target.value = "";
      return alert("Ảnh sticker không được vượt quá 5 MB");
    }

    setAnhSticker(file);
    setXemTruocAnh(URL.createObjectURL(file));
  }

  function dongModalSticker() {
    if (mutationThemSticker.isPending) return;
    setHienFormSticker(false);
    setFormSticker({ ten: "", loai: "hinh_ve" });
    setAnhSticker(null);
    setXemTruocAnh("");
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
            onClick={() => setHienFormSticker(true)}
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

        <Modal
          title="Thêm sticker"
          open={hienFormSticker}
          onCancel={dongModalSticker}
          footer={null}
          centered
          width={480}
          destroyOnHidden
          mask={{ closable: !mutationThemSticker.isPending }}
          closable={!mutationThemSticker.isPending}
        >
          <form
            onSubmit={xuLyGuiFormSticker}
            style={{
              paddingTop: 12, display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            <div>
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
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                Ảnh sticker *
              </label>
              <input
                id="sticker-image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={xuLyChonAnh}
                style={{ display: "none" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label
                  htmlFor="sticker-image-input"
                  style={{
                    height: 38,
                    padding: "0 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  <UploadOutlined />
                  Chọn ảnh
                </label>
                <span
                  title={anhSticker?.name}
                  style={{
                    minWidth: 0,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: anhSticker ? "#334155" : "#94a3b8",
                    fontSize: 12,
                  }}
                >
                  {anhSticker?.name || "Chưa chọn ảnh"}
                </span>
              </div>
              <p style={{ margin: "5px 0 0", fontSize: 11, color: "#94a3b8" }}>
                JPG, PNG, WEBP, GIF hoặc SVG. Tối đa 5 MB.
              </p>
              {xemTruocAnh && (
                <div style={{
                  marginTop: 10, width: 96, height: 96, border: "1px solid #e2e8f0",
                  borderRadius: 8, overflow: "hidden", background: "#f8fafc",
                }}>
                  <img
                    src={xemTruocAnh}
                    alt="Xem trước sticker"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
              )}
            </div>
            <div>
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
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={dongModalSticker}
                disabled={mutationThemSticker.isPending}
                style={{
                  height: 38, padding: "0 16px", background: "#ffffff",
                  border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13,
                  cursor: mutationThemSticker.isPending ? "not-allowed" : "pointer", color: "#475569",
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={mutationThemSticker.isPending}
                style={{
                  height: 38, padding: "0 16px", background: "#0ea5e9", border: "none",
                  borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#ffffff",
                  cursor: mutationThemSticker.isPending ? "not-allowed" : "pointer",
                }}
              >
                {mutationThemSticker.isPending ? "Đang tải lên..." : "Thêm sticker"}
              </button>
            </div>
          </form>
        </Modal>

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
            {[...danhSachSticker].reverse().map((sticker: Sticker) => (
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
