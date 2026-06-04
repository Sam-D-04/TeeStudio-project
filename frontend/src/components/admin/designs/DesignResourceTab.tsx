"use client";

/**
 * DesignResourceTab – Tab "Tài nguyên thiết kế / Vị trí in"
 *
 * Dữ liệu lấy từ API thật:
 *  - GET /api/admin/designs/stickers
 *  - GET /api/admin/designs/vi-tri-in
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusOutlined,
  DeleteOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import * as designService from "@/services/admin/designService";
import type { Sticker, ViTriIn } from "@/services/admin/designService";

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

  // ── State form thêm vị trí in ──
  const [hienFormViTri, setHienFormViTri] = useState(false);
  const [formViTri, setFormViTri] = useState({ ten: "", moTa: "" });

  // ─── Fetch sticker ──────────────────────────────────────────────────────
  const {
    data: danhSachSticker = [],
    isLoading: dangTaiSticker,
    isError: loiSticker,
  } = useQuery({
    queryKey: ["stickers-admin"],
    queryFn: designService.layDanhSachSticker,
  });

  // ─── Fetch vị trí in ────────────────────────────────────────────────────
  const {
    data: danhSachViTriIn = [],
    isLoading: dangTaiViTri,
    isError: loiViTri,
  } = useQuery({
    queryKey: ["vi-tri-in-admin"],
    queryFn: designService.layDanhSachViTriIn,
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

  // ─── Mutation: Thêm vị trí in ───────────────────────────────────────────
  const mutationThemViTri = useMutation({
    mutationFn: designService.themViTriIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vi-tri-in-admin"] });
      setHienFormViTri(false);
      setFormViTri({ ten: "", moTa: "" });
    },
    onError: (err: Error) => alert(`Lỗi: ${err.message}`),
  });

  // ─── Mutation: Bật/tắt vị trí in ────────────────────────────────────────
  const mutationBatTat = useMutation({
    mutationFn: ({ id, dangHoatDong }: { id: number; dangHoatDong: boolean }) =>
      designService.batTatViTriIn(id, dangHoatDong),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vi-tri-in-admin"] }),
    onError: (err: Error) => alert(`Lỗi: ${err.message}`),
  });

  // ─── Mutation: Xóa vị trí in ────────────────────────────────────────────
  const mutationXoaViTri = useMutation({
    mutationFn: designService.xoaViTriIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vi-tri-in-admin"] }),
    onError: (err: Error) => alert(`Lỗi khi xóa vị trí in: ${err.message}`),
  });

  // ─── Handlers ───────────────────────────────────────────────────────────
  function xuLyXoaSticker(id: number) {
    if (window.confirm("Bạn có chắc muốn xóa sticker này?")) {
      mutationXoaSticker.mutate(id);
    }
  }

  function xuLyXoaViTriIn(id: number) {
    if (window.confirm("Bạn có chắc muốn xóa vị trí in này?\nChú ý: Không thể xóa nếu có thiết kế đang sử dụng.")) {
      mutationXoaViTri.mutate(id);
    }
  }

  function xuLyGuiFormSticker(e: React.FormEvent) {
    e.preventDefault();
    if (!formSticker.ten.trim()) return alert("Vui lòng nhập tên sticker");
    if (!formSticker.urlAnh.trim()) return alert("Vui lòng nhập URL ảnh sticker");
    mutationThemSticker.mutate(formSticker);
  }

  function xuLyGuiFormViTri(e: React.FormEvent) {
    e.preventDefault();
    if (!formViTri.ten.trim()) return alert("Vui lòng nhập tên vị trí in");
    mutationThemViTri.mutate({ ten: formViTri.ten, moTa: formViTri.moTa });
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

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* KHU VỰC 2: Vị trí in                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div>
        {/* Tiêu đề khu vực */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EnvironmentOutlined style={{ color: "#0ea5e9", fontSize: 18 }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Vị trí in
            </h3>
            <span style={{ padding: "1px 8px", borderRadius: 20, background: "#e0f2fe", color: "#0284c7", fontSize: 12, fontWeight: 600 }}>
              {danhSachViTriIn.length}
            </span>
          </div>

          <button
            onClick={() => setHienFormViTri(!hienFormViTri)}
            style={{
              height: 36, padding: "0 14px", display: "flex", alignItems: "center", gap: 6,
              background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer",
            }}
          >
            <PlusOutlined style={{ fontSize: 13 }} />
            Thêm vị trí in
          </button>
        </div>

        {/* Form thêm vị trí in */}
        {hienFormViTri && (
          <form
            onSubmit={xuLyGuiFormViTri}
            style={{
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12,
              padding: 16, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                Tên vị trí *
              </label>
              <input
                style={styleInput}
                placeholder="Ví dụ: Ngực trái"
                value={formViTri.ten}
                onChange={(e) => setFormViTri((f) => ({ ...f, ten: e.target.value }))}
              />
            </div>
            <div style={{ flex: "2 1 260px" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                Mô tả kích thước
              </label>
              <input
                style={styleInput}
                placeholder="Ví dụ: Tối đa 10x10 cm"
                value={formViTri.moTa}
                onChange={(e) => setFormViTri((f) => ({ ...f, moTa: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={mutationThemViTri.isPending}
                style={{
                  height: 38, padding: "0 16px", background: "#0ea5e9", border: "none",
                  borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#ffffff",
                  cursor: mutationThemViTri.isPending ? "not-allowed" : "pointer",
                }}
              >
                {mutationThemViTri.isPending ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => setHienFormViTri(false)}
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

        {/* Loading / Error vị trí in */}
        {dangTaiViTri && (
          <div style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            <LoadingOutlined style={{ fontSize: 20, marginBottom: 8, display: "block" }} />
            Đang tải vị trí in...
          </div>
        )}
        {loiViTri && !dangTaiViTri && (
          <div style={{ padding: "32px 0", textAlign: "center", color: "#ef4444", fontSize: 14 }}>
            <WarningOutlined style={{ fontSize: 20, marginBottom: 8, display: "block" }} />
            Không thể tải vị trí in.
          </div>
        )}

        {/* Bảng danh sách vị trí in */}
        {!dangTaiViTri && !loiViTri && (
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
            {danhSachViTriIn.length === 0 && (
              <div style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                Chưa có vị trí in nào. Hãy thêm vị trí in mới.
              </div>
            )}
            {danhSachViTriIn.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["VỊ TRÍ IN", "MÔ TẢ", "TRẠNG THÁI", "THAO TÁC"].map((tieuDe, viTri) => (
                      <th
                        key={tieuDe}
                        style={{
                          padding: "12px 16px", fontSize: 12, fontWeight: 700,
                          color: "#475569", letterSpacing: "0.05em",
                          textAlign: viTri === 3 ? "right" : "left",
                        }}
                      >
                        {tieuDe}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {danhSachViTriIn.map((viTri: ViTriIn) => (
                    <tr
                      key={viTri.id}
                      style={{ borderBottom: "1px solid #e2e8f0", transition: "background-color 0.15s ease" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f8fafc"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent"; }}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{viTri.ten}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 13, color: "#475569" }}>{viTri.moTa}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => mutationBatTat.mutate({ id: viTri.id, dangHoatDong: !viTri.dangHoatDong })}
                          disabled={mutationBatTat.isPending}
                          title={viTri.dangHoatDong ? "Nhấn để tắt" : "Nhấn để bật"}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "3px 12px", borderRadius: 20, border: "none",
                            fontSize: 12, fontWeight: 700, cursor: "pointer",
                            transition: "all 0.15s ease",
                            backgroundColor: viTri.dangHoatDong ? "#dcfce7" : "#e4e9ed",
                            color: viTri.dangHoatDong ? "#10b981" : "#6e7881",
                          }}
                        >
                          <span style={{
                            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                            backgroundColor: viTri.dangHoatDong ? "#10b981" : "#94a3b8",
                          }} />
                          {viTri.dangHoatDong ? "Đang bật" : "Đã tắt"}
                        </button>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                          title="Xóa vị trí in"
                          onClick={() => xuLyXoaViTriIn(viTri.id)}
                          style={{
                            width: 32, height: 32, display: "flex", alignItems: "center",
                            justifyContent: "center", borderRadius: 6, border: "1px solid transparent",
                            background: "#f8fafc", color: "#94a3b8", cursor: "pointer",
                            fontSize: 14, transition: "all 0.15s ease", marginLeft: "auto",
                          }}
                          onMouseEnter={(e) => {
                            const btn = e.currentTarget as HTMLButtonElement;
                            btn.style.color = "#ea580c"; btn.style.borderColor = "#ffedd5"; btn.style.background = "#fff7ed";
                          }}
                          onMouseLeave={(e) => {
                            const btn = e.currentTarget as HTMLButtonElement;
                            btn.style.color = "#94a3b8"; btn.style.borderColor = "transparent"; btn.style.background = "#f8fafc";
                          }}
                        >
                          <DeleteOutlined />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
