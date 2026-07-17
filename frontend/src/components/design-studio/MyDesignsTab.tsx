import React, { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import { useDesignStore } from "@/store/useDesignStore";
import { userDesignService, SavedDesign } from "@/services/userDesignService";
import CustomerDesignStatusBadge from "./CustomerDesignStatusBadge";

const CloudIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

export default function MyDesignsTab() {
  const { isAuthenticated, accessToken } = useAuthStore();
  const { currentDesignId, setCurrentDesignId } = useDesignStore();

  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDesigns = async () => {
    if (!isAuthenticated || !accessToken) return;
    try {
      setLoading(true);
      setError("");
      const data = await userDesignService.getMyDesigns(accessToken);
      setDesigns(data);
    } catch (err: any) {
      setError("Lỗi tải danh sách thiết kế.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [isAuthenticated, accessToken]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!accessToken) return;
    if (!confirm("Bạn có chắc muốn xoá thiết kế này?")) return;

    try {
      await userDesignService.deleteDesign(accessToken, id);
      setDesigns(designs.filter(d => d.id !== id));
      if (currentDesignId === id) {
        setCurrentDesignId(null);
      }
    } catch (err) {
      alert("Xoá thất bại!");
    }
  };

  const handleLoadDesign = (d: SavedDesign) => {
    useDesignStore.setState({
      elements: d.canvasData.elements || [],
      shirtView: d.canvasData.shirtView || "front",
      shirtColor: d.baseColor,
      currentDesignId: d.id,
      currentDesignStatus: d.status,
      selectedId: null,
      undoStack: [],
      redoStack: []
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="ds-sidebar-pane" style={{ textAlign: "center", padding: "40px 20px" }}>
        <CloudIcon />
        <h3 style={{ margin: "16px 0 8px" }}>Thiết kế trên mây</h3>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          Vui lòng đăng nhập để lưu trữ và xem lại các thiết kế của bạn ở mọi nơi.
        </p>
      </div>
    );
  }

  return (
    <div className="ds-sidebar-pane" style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#cbd5e1" }}>Thiết kế của tôi</h3>
        <button
          onClick={fetchDesigns}
          style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: 12 }}
        >
          Làm mới
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 20, color: "#64748b" }}>Đang tải...</div>
      ) : error ? (
        <div style={{ color: "#ef4444", fontSize: 12, textAlign: "center" }}>{error}</div>
      ) : designs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 10px", color: "#64748b", fontSize: 13 }}>
          Bạn chưa lưu thiết kế nào.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {designs.map(d => {
            // Sửa canvas chỉ khả dụng khi DRAFT (đang soạn) hoặc NEEDS_REVISION (admin yêu cầu sửa)
            const canEdit = d.status === "DRAFT" || d.status === "NEEDS_REVISION";
            // Xóa chỉ khả dụng khi còn là bản nháp riêng tư, chưa gửi admin
            const canDelete = d.status === "DRAFT";

            return (
              <div
                key={d.id}
                style={{
                  background: "#1e293b",
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: canEdit ? "pointer" : "default",
                  border: currentDesignId === d.id ? "2px solid #38bdf8" : "2px solid transparent",
                  position: "relative"
                }}
                onClick={() => canEdit && handleLoadDesign(d)}
                title={canEdit ? "Nhấn để sửa" : undefined}
              >
                <div style={{ width: "100%", height: 100, background: "#0f172a", position: "relative" }}>
                  {d.printFileUrlFront || d.printFileUrlBack ? (
                    // Thiết kế đã từng đặt hàng nên có ảnh in thật (Cloudinary) - ưu
                    // tiên hiển thị thay vì bản xem trước canvas, tách 2 nửa nếu có
                    // cả 2 mặt.
                    <div style={{ display: "flex", width: "100%", height: "100%" }}>
                      {d.printFileUrlFront && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.printFileUrlFront}
                          alt="Mặt trước"
                          title="Mặt trước"
                          style={{
                            flex: 1, minWidth: 0, height: "100%", objectFit: "cover",
                            borderRight: d.printFileUrlBack ? "1px solid #334155" : "none",
                          }}
                        />
                      )}
                      {d.printFileUrlBack && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.printFileUrlBack}
                          alt="Mặt sau"
                          title="Mặt sau"
                          style={{ flex: 1, minWidth: 0, height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                  ) : d.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155" }}>
                      <CloudIcon />
                    </div>
                  )}
                  {canDelete && (
                    <button
                      onClick={(e) => handleDelete(e, d.id)}
                      style={{
                        position: "absolute", top: 4, right: 4,
                        background: "rgba(0,0,0,0.5)", border: "none", color: "#fff",
                        padding: 4, borderRadius: 4, cursor: "pointer"
                      }}
                      title="Xoá"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
                <div style={{ padding: 8 }}>
                  <div style={{ marginBottom: 4 }}>
                    <CustomerDesignStatusBadge status={d.status} />
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {new Date(d.updatedAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {d.status === "NEEDS_REVISION" && d.adminNote && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "#fdba74", lineHeight: 1.4 }}>
                      <strong>Admin yêu cầu sửa:</strong> {d.adminNote}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
