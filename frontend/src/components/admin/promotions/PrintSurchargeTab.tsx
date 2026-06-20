"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CloseOutlined, EditOutlined, LoadingOutlined, SaveOutlined } from "@ant-design/icons";
import { App } from "antd";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import * as promotionService from "@/services/admin/promotionService";

function PrintSurchargeContent() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [dangSua, setDangSua] = useState<{ loai: promotionService.LoaiPhuPhi; id: number } | null>(
    null,
  );
  const [giaTri, setGiaTri] = useState("");

  const query = useQuery({
    queryKey: ["admin-promotions", "surcharges"],
    queryFn: promotionService.layDanhSachPhuPhi,
  });
  const mutation = useMutation({
    mutationFn: ({
      item,
      extraCost,
      isActive,
    }: {
      item: promotionService.PhuPhiBaoGia;
      extraCost: number;
      isActive: boolean;
    }) =>
      promotionService.capNhatPhuPhi(item.id, {
        loai: item.loai,
        extraCost,
        isActive,
      }),
    onSuccess: () => {
      message.success("Đã cập nhật phụ phí");
      setDangSua(null);
      queryClient.invalidateQueries({ queryKey: ["admin-promotions", "surcharges"] });
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const renderGroup = (title: string, items: promotionService.PhuPhiBaoGia[]) => (
    <section>
      <h4 style={{ margin: "0 0 10px", fontSize: 13, color: "#475569" }}>{title}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => {
          const isEditing = dangSua?.id === item.id && dangSua.loai === item.loai;
          return (
            <div
              key={`${item.loai}-${item.id}`}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                opacity: item.dangBat ? 1 : 0.65,
                background: item.dangBat ? "#fff" : "#f8fafc",
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <strong style={{ fontSize: 14, color: "#0f172a" }}>{item.ten}</strong>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: item.dangBat ? "#dcfce7" : "#e2e8f0",
                      color: item.dangBat ? "#059669" : "#64748b",
                    }}
                  >
                    {item.dangBat ? "ĐANG ÁP DỤNG" : "ĐÃ TẮT"}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                  {item.moTa}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      min={0}
                      value={giaTri}
                      onChange={(event) => setGiaTri(event.target.value)}
                      style={{
                        width: 120,
                        height: 34,
                        padding: "0 8px",
                        border: "1px solid #0ea5e9",
                        borderRadius: 6,
                        textAlign: "right",
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#64748b" }}>VNĐ/áo</span>
                    <button
                      title="Lưu"
                      onClick={() =>
                        mutation.mutate({
                          item,
                          extraCost: Number(giaTri),
                          isActive: item.dangBat,
                        })
                      }
                    >
                      <SaveOutlined />
                    </button>
                    <button title="Hủy" onClick={() => setDangSua(null)}>
                      <CloseOutlined />
                    </button>
                  </>
                ) : (
                  <>
                    <strong style={{ color: "#0284c7" }}>
                      +{item.giaTri.toLocaleString("vi-VN")}đ/áo
                    </strong>
                    <button
                      title="Chỉnh sửa phụ phí"
                      onClick={() => {
                        setDangSua({ id: item.id, loai: item.loai });
                        setGiaTri(String(item.giaTri));
                      }}
                    >
                      <EditOutlined />
                    </button>
                  </>
                )}
                <button
                  title={item.dangBat ? "Tắt phụ phí" : "Bật phụ phí"}
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      item,
                      extraCost: item.giaTri,
                      isActive: !item.dangBat,
                    })
                  }
                  style={{
                    width: 44,
                    height: 24,
                    border: "none",
                    borderRadius: 12,
                    background: item.dangBat ? "#0ea5e9" : "#cbd5e1",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 10,
                  }}
                >
                  {item.dangBat ? "Tắt" : "Bật"}
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
            Chưa có dữ liệu cấu hình.
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
        <h3 style={{ margin: 0, fontSize: 15, color: "#0f172a" }}>Phụ phí in & thiết kế</h3>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
          Quản lý trực tiếp phụ phí của vị trí in và phương pháp in đang dùng trong Design Studio.
        </p>
      </div>
      {query.isLoading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#475569" }}>
          <LoadingOutlined /> Đang tải phụ phí...
        </div>
      ) : query.isError ? (
        <div style={{ padding: 48, textAlign: "center", color: "#b91c1c" }}>
          {getApiErrorMessage(query.error, "Không thể tải danh sách phụ phí")}
        </div>
      ) : (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 24 }}>
          {renderGroup("Vị trí in", query.data?.viTriIn ?? [])}
          {renderGroup("Phương pháp in", query.data?.phuongPhapIn ?? [])}
        </div>
      )}
    </div>
  );
}

export default function PrintSurchargeTab() {
  return (
    <App>
      <PrintSurchargeContent />
    </App>
  );
}
