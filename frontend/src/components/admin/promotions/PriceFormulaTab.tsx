"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InfoCircleOutlined, LoadingOutlined, SaveOutlined } from "@ant-design/icons";
import { message } from "antd";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import * as promotionService from "@/services/admin/promotionService";

type FormState = {
  defaultShippingFee: string;
  freeShippingThreshold: string;
  vatPercent: string;
};

const EMPTY_FORM: FormState = {
  defaultShippingFee: "",
  freeShippingThreshold: "",
  vatPercent: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

export default function PriceFormulaTab() {
  const queryClient = useQueryClient();
  const [formChanges, setFormChanges] = useState<Partial<FormState>>({});
  const query = useQuery({
    queryKey: ["admin-promotions", "pricing-formula"],
    queryFn: promotionService.layCongThucBaoGia,
  });

  const value = query.data?.cauHinh;
  const form: FormState = {
    ...(value
      ? {
          defaultShippingFee: String(value.defaultShippingFee),
          freeShippingThreshold: String(value.freeShippingThreshold),
          vatPercent: String(value.vatPercent),
        }
      : EMPTY_FORM),
    ...formChanges,
  };

  const mutation = useMutation({
    mutationFn: () =>
      promotionService.capNhatCongThucBaoGia({
        defaultShippingFee: Number(form.defaultShippingFee),
        freeShippingThreshold: Number(form.freeShippingThreshold),
        vatPercent: Number(form.vatPercent),
      }),
    onSuccess: (data) => {
      message.success("Đã lưu công thức báo giá");
      queryClient.setQueryData(["admin-promotions", "pricing-formula"], data);
      setFormChanges({});
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const field = (
    key: keyof FormState,
    label: string,
    note: string,
    suffix: string,
    options?: { min?: number; max?: number; step?: number },
  ) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{label}</span>
      <div style={{ position: "relative" }}>
        <input
          type="number"
          min={options?.min ?? 0}
          max={options?.max}
          step={options?.step}
          value={form[key]}
          onChange={(event) =>
            setFormChanges((old) => ({ ...old, [key]: event.target.value }))
          }
          style={{ ...inputStyle, paddingRight: 55 }}
        />
        <span
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 11,
            color: "#64748b",
          }}
        >
          {suffix}
        </span>
      </div>
      <span style={{ fontSize: 11, color: "#64748b" }}>{note}</span>
    </label>
  );

  if (query.isLoading) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "#475569" }}>
        <LoadingOutlined /> Đang tải công thức báo giá...
      </div>
    );
  }
  if (query.isError) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "#b91c1c" }}>
        {getApiErrorMessage(query.error, "Không thể tải công thức báo giá")}
      </div>
    );
  }

  const preview = query.data?.xemTruoc;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <h3 style={{ margin: 0, fontSize: 15, color: "#0f172a" }}>Cấu hình công thức báo giá</h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
            <InfoCircleOutlined /> Tổng báo giá = tạm tính sau giảm + VAT + phí vận chuyển, sau đó làm tròn đến hàng nghìn gần nhất.
          </p>
        </div>
        <div
          style={{
            padding: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {field(
            "defaultShippingFee",
            "Phí vận chuyển mặc định",
            "Áp dụng khi báo giá chưa đạt ngưỡng miễn phí.",
            "VNĐ",
          )}
          {field(
            "freeShippingThreshold",
            "Ngưỡng miễn phí vận chuyển",
            "Nhập 0 nếu không tự động miễn phí vận chuyển.",
            "VNĐ",
          )}
          {field("vatPercent", "Thuế VAT", "Nhập 0 nếu báo giá chưa bao gồm VAT.", "%", {
            min: 0,
            max: 30,
            step: 0.01,
          })}
        </div>
        <div style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", textAlign: "right", background: "#f8fafc" }}>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            style={{
              height: 40,
              padding: "0 18px",
              border: "none",
              borderRadius: 8,
              background: "#0ea5e9",
              color: "#fff",
              fontWeight: 600,
              cursor: mutation.isPending ? "wait" : "pointer",
            }}
          >
            <SaveOutlined /> {mutation.isPending ? "Đang lưu..." : "Lưu công thức"}
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <h3 style={{ margin: 0, fontSize: 15, color: "#0f172a" }}>Xem trước do hệ thống tính</h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
            Ví dụ một áo giá 80.000đ và phụ phí in 30.000đ.
          </p>
        </div>
        <div style={{ padding: 20, fontSize: 13, lineHeight: 2, color: "#334155" }}>
          <div>Giá phôi mẫu: {preview?.giaPhoiMau.toLocaleString("vi-VN")}đ</div>
          <div>Phụ phí in mẫu: {preview?.phuPhiInMau.toLocaleString("vi-VN")}đ</div>
          <div>Tạm tính: {preview?.tamTinh.toLocaleString("vi-VN")}đ</div>
          <div>Thuế VAT: {preview?.thueVat.toLocaleString("vi-VN")}đ</div>
          <div>Phí vận chuyển: {preview?.phiVanChuyen.toLocaleString("vi-VN")}đ</div>
          <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 8, paddingTop: 8 }}>
            Tổng sau làm tròn:{" "}
            <strong style={{ color: "#0284c7", fontSize: 17 }}>
              {preview?.tongCong.toLocaleString("vi-VN")}đ
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
