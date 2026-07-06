import React, { useState, useEffect } from "react";
import { Modal, Input, Typography } from "antd";

const { Text } = Typography;

interface SaveDesignModalProps {
  open: boolean;
  initialName: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
  isSaving: boolean;
}

export default function SaveDesignModal({
  open,
  initialName,
  onCancel,
  onConfirm,
  isSaving,
}: SaveDesignModalProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) {
      setName(initialName);
    }
  }, [open, initialName]);

  const handleOk = () => {
    if (!name.trim()) return;
    onConfirm(name.trim());
  };

  return (
    <Modal
      title="Lưu thiết kế"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={isSaving}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ disabled: !name.trim() }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text>Vui lòng đặt tên cho thiết kế của bạn để dễ dàng quản lý sau này:</Text>
      </div>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="VD: Áo lớp 12A1, Áo team building..."
        autoFocus
        onPressEnter={handleOk}
        disabled={isSaving}
        maxLength={100}
        showCount
      />
    </Modal>
  );
}
