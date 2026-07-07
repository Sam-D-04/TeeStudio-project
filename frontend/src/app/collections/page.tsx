"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import useAuthStore from "@/store/useAuthStore";
import { useDesignStore } from "@/store/useDesignStore";
import { userDesignService, SavedDesign } from "@/services/userDesignService";
import AddToCartModal from "@/components/design-studio/AddToCartModal";

export default function CollectionsPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartDesign, setCartDesign] = useState<SavedDesign | null>(null);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchDesigns();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userDesignService.getMyDesigns(accessToken!);
      setDesigns(data);
    } catch (err: any) {
      setError("Lỗi tải danh sách thiết kế.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDesign = (d: SavedDesign) => {
    useDesignStore.getState().clearDesign();
    useDesignStore.setState({
      elements: d.canvasData?.elements || [],
      shirtView: d.canvasData?.shirtView || "front",
      shirtType: d.productId === 1 ? "tshirt" : (d.productId === 2 ? "polo" : "hoodie"),
      shirtColor: d.baseColor,
      currentDesignId: d.id,
      designName: d.name,
    });
    router.push("/design-studio");
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!accessToken) return;
    if (!confirm("Bạn có chắc muốn xoá thiết kế này?")) return;
    
    try {
      await userDesignService.deleteDesign(accessToken, id);
      setDesigns(designs.filter(d => d.id !== id));
      if (useDesignStore.getState().currentDesignId === id) {
        useDesignStore.getState().setCurrentDesignId(null);
      }
    } catch (err) {
      alert("Xoá thất bại!");
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <AppHeader />
      <div style={{ paddingTop: 64, paddingBottom: 60, minHeight: "calc(100vh - 200px)" }}>
        <div className="container-main" style={{ padding: "40px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Bộ sưu tập của tôi</h1>
              <p style={{ color: "#64748b" }}>Quản lý và chỉnh sửa các mẫu thiết kế áo thun, polo, hoodie của bạn.</p>
            </div>
            <button
              onClick={() => {
                useDesignStore.getState().clearDesign();
                router.push("/design-studio");
              }}
              style={{
                background: "#0f172a",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
              }}
            >
              + Tạo thiết kế mới
            </button>
          </div>
          
          {!isAuthenticated ? (
            <div style={{ padding: "60px 0", textAlign: "center", background: "#fff", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#64748b", marginBottom: 16 }}>Vui lòng đăng nhập để lưu trữ và xem lại các thiết kế của bạn.</p>
              <button 
                onClick={() => router.push("/dang-nhap")}
                style={{ background: "#38bdf8", color: "#fff", padding: "8px 24px", borderRadius: 6, fontWeight: 600, border: "none", cursor: "pointer" }}
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>Đang tải danh sách thiết kế...</div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#ef4444" }}>{error}</div>
          ) : designs.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", background: "#fff", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#64748b", marginBottom: 16 }}>Bạn chưa lưu bản thiết kế nào.</p>
              <button 
                onClick={() => {
                  useDesignStore.getState().clearDesign();
                  router.push("/design-studio");
                }}
                style={{ background: "#38bdf8", color: "#fff", padding: "8px 24px", borderRadius: 6, fontWeight: 600, border: "none", cursor: "pointer" }}
              >
                Trải nghiệm Design Studio
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
              {designs.map(d => (
                <div 
                  key={d.id} 
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.05)";
                  }}
                  onClick={() => handleEditDesign(d)}
                >
                  <div style={{ width: "100%", height: 240, background: "#f1f5f9", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {d.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.previewUrl} alt={d.name} style={{ width: "80%", height: "80%", objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }} />
                    ) : (
                      <span style={{ color: "#94a3b8" }}>Không có ảnh</span>
                    )}
                    <button 
                      onClick={(e) => handleDelete(e, d.id)}
                      style={{
                        position: "absolute", top: 12, right: 12,
                        background: "rgba(255,255,255,0.9)", border: "1px solid #e2e8f0", color: "#ef4444",
                        width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                      }}
                      title="Xoá thiết kế"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                      {d.name || "Thiết kế chưa đặt tên"}
                    </h3>
                    <span style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
                      Cập nhật: {new Date(d.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                      <span style={{
                        flex: 1, textAlign: "center",
                        fontSize: 12, fontWeight: 600, color: "#38bdf8",
                        background: "#e0f2fe", padding: "7px 10px", borderRadius: 8,
                        cursor: "pointer",
                      }}>
                        Tiếp tục sửa ➔
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCartDesign(d); }}
                        style={{
                          flex: 1,
                          fontSize: 12, fontWeight: 700, color: "#fff",
                          background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                          border: "none", padding: "7px 10px", borderRadius: 8,
                          cursor: "pointer", transition: "opacity 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                      >
                        🛒 Đặt hàng
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <AppFooter />

      {cartDesign && (
        <AddToCartModal
          open={!!cartDesign}
          onClose={() => setCartDesign(null)}
          productId={cartDesign.productId}
          shirtColor={cartDesign.baseColor}
          designId={cartDesign.id}
        />
      )}
    </main>
  );
}
