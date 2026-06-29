"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Modal, Select } from "antd";
import { useState } from "react";
import {
  FALLBACK_PRODUCT_COLOR,
  mergeProductColors,
  type ProductColor,
} from "@/lib/productColors";

type Props = {
  value?: ProductColor | null;
  options: ProductColor[];
  onChange: (color: ProductColor | null) => void;
  disabled?: boolean;
  hasError?: boolean;
  compact?: boolean;
  placeholder?: string;
};

export default function CreatableColorSelect({
  value,
  options,
  onChange,
  disabled = false,
  hasError = false,
  compact = false,
  placeholder = "Chọn màu",
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#7dd3fc");
  const colors = mergeProductColors(value ? [value] : [], options);
  const isValid = name.trim() !== "";

  function closeModal() {
    setOpen(false);
    setName("");
    setHex("#7dd3fc");
  }

  function createColor() {
    if (!isValid) return;

    const existingColor = colors.find(
      (color) => color.name.toLowerCase() === name.trim().toLowerCase()
    );
    onChange(existingColor ?? { name: name.trim(), hex: hex.toLowerCase() });
    closeModal();
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <span
          className="h-5 w-5 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: value?.hex ?? FALLBACK_PRODUCT_COLOR }}
        />
        <Select
          value={value?.name || undefined}
          options={colors.map((color) => ({
            value: color.name,
            label: color.name,
          }))}
          onChange={(selectedName) =>
            onChange(colors.find((color) => color.name === selectedName) ?? null)
          }
          onClear={() => onChange(null)}
          placeholder={placeholder}
          optionFilterProp="label"
          showSearch
          allowClear
          disabled={disabled}
          status={hasError ? "error" : undefined}
          className="min-w-0 flex-1"
          style={{ height: compact ? 32 : 36 }}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          title="Tạo màu mới"
          aria-label="Tạo màu mới"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-border bg-surface text-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PlusOutlined />
        </button>
      </div>

      <Modal
        title="Tạo màu mới"
        open={open}
        onCancel={closeModal}
        onOk={createColor}
        okText="Thêm màu"
        cancelText="Hủy"
        okButtonProps={{ disabled: !isValid }}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-text-secondary">
              Tên màu
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ví dụ: Xanh Mint"
              maxLength={100}
              className="h-10 w-full rounded-[7px] border border-border px-3 outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-text-secondary">
              Màu hiển thị
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hex}
                onChange={(event) => setHex(event.target.value)}
                className="h-10 w-16 cursor-pointer rounded border border-border"
              />
              <span className="font-mono text-[13px] uppercase text-text-secondary">
                {hex}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
