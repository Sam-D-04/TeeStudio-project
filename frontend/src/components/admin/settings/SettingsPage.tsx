"use client";

/**
 * SettingsPage – Component trang Cài đặt chính.
 *
 * Đây là component orchestrator (điều phối):
 * nó lắp ghép tất cả các component con vào layout hoàn chỉnh.
 *
 * Cấu trúc layout:
 * ┌─────────────────────────────────────────────────────┐
 * │ Tiêu đề trang + Nút Lưu / Khôi phục mặc định        │
 * ├─────────────────────────────────────────────────────┤
 * │ [KPI 1] [KPI 2] [KPI 3] [KPI 4]  ← 4 thẻ thống kê │
 * ├──────────────┬──────────────────────────────────────┤
 * │ Menu bên trái│ Nội dung tab đang chọn (bên phải)   │
 * │ (3/12 cột)  │ (9/12 cột)                           │
 * └──────────────┴──────────────────────────────────────┘
 *
 * State quản lý:
 * - tabHienTai: tab menu nào đang được chọn
 *   (mặc định: "tai_khoan" – tab "Tài khoản & Phân quyền")
 */

import { useState } from "react";
import {
  TeamOutlined,          // icon "Tài khoản nội bộ"
  SafetyCertificateOutlined, // icon "Vai trò"
  ApartmentOutlined,     // icon "Trạng thái quy trình"
  CreditCardOutlined,    // icon "Phương thức thanh toán"
} from "@ant-design/icons";

import SettingStatCard from "./SettingStatCard";
import SettingNavMenu, { type SettingTabKey } from "./SettingNavMenu";
import SettingStaffTable from "./SettingStaffTable";

export default function SettingsPage() {
  // Trạng thái tab đang chọn – mặc định là tab đầu tiên
  const [tabHienTai, setTabHienTai] = useState<SettingTabKey>("tai_khoan");

  return (
    // Wrapper toàn trang với gap giữa các khối
    <div className="flex flex-col gap-6">

      {/* ============================================================
          PHẦN 1: TIÊU ĐỀ TRANG + NÚT HÀNH ĐỘNG
          ============================================================ */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        {/* Tiêu đề và mô tả */}
        <div>
          <h2 className="text-[28px] font-extrabold leading-9 text-on-surface">
            Cài đặt
          </h2>
          <p className="text-sm text-text-secondary">
            Quản lý tài khoản nội bộ, phân quyền và cấu hình vận hành hệ thống TeeStudio.
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="flex items-center gap-3">
          {/* Nút Khôi phục mặc định – màu phụ */}
          <button
            type="button"
            className="flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:border-[#76a1b6] hover:text-text-main"
          >
            Khôi phục mặc định
          </button>

          {/* Nút Lưu thay đổi – màu xanh chính */}
          <button
            type="button"
            className="flex h-10 items-center justify-center rounded-lg bg-[#0ea5e9] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* ============================================================
          PHẦN 2: 4 THẺ THỐNG KÊ KPI
          Hiển thị các chỉ số tổng quan về cấu hình hệ thống
          ============================================================ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Thẻ 1: Tổng số tài khoản nội bộ */}
        <SettingStatCard
          label="Tài khoản nội bộ"
          value={8}
          icon={<TeamOutlined />}
          iconWrapperClassName="bg-[#c9e6ff]/50 text-[#0ea5e9]"
        />

        {/* Thẻ 2: Số vai trò trong hệ thống */}
        <SettingStatCard
          label="Vai trò hệ thống"
          value={4}
          icon={<SafetyCertificateOutlined />}
          iconWrapperClassName="bg-[#cce5ff]/50 text-[#006398]"
        />

        {/* Thẻ 3: Số nhóm trạng thái quy trình */}
        <SettingStatCard
          label="Trạng thái quy trình"
          value={3}
          unit="nhóm"
          unitColor="#94a3b8"
          icon={<ApartmentOutlined />}
          iconWrapperClassName="bg-[#bee9ff]/50 text-[#396477]"
        />

        {/* Thẻ 4: Số phương thức thanh toán đang bật */}
        <SettingStatCard
          label="Phương thức thanh toán"
          value={1}
          unit="đang bật"
          unitColor="#10b981"
          icon={<CreditCardOutlined />}
          iconWrapperClassName="bg-[#dcfce7]/50 text-[#10b981]"
        />
      </div>

      {/* ============================================================
          PHẦN 3: LAYOUT 2 CỘT – MENU TRÁI + NỘI DUNG PHẢI
          ============================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* ---- Cột trái: Menu điều hướng (3/12 cột) ---- */}
        <div className="lg:col-span-3">
          <SettingNavMenu
            tabHienTai={tabHienTai}
            onDoiTab={setTabHienTai}
          />
        </div>

        {/* ---- Cột phải: Nội dung tab (9/12 cột) ---- */}
        <div className="flex flex-col gap-6 lg:col-span-9">

          {/* Tab "Tài khoản & Phân quyền" – Hiển thị bảng nhân viên */}
          {tabHienTai === "tai_khoan" && (
            <SettingStaffTable />
          )}

          {/* Tab "Thông tin cửa hàng" – Placeholder */}
          {tabHienTai === "thong_tin_cua_hang" && (
            <PlaceholderPanel
              tieuDe="Thông tin cửa hàng"
              moTa="Cấu hình tên thương hiệu, địa chỉ, thông tin liên hệ chính thức của cửa hàng."
            />
          )}

          {/* Tab "Trạng thái quy trình" – Placeholder */}
          {tabHienTai === "trang_thai_quy_trinh" && (
            <PlaceholderPanel
              tieuDe="Trạng thái quy trình"
              moTa="Quản lý các nhóm trạng thái trong quy trình sản xuất và xử lý đơn hàng."
            />
          )}

          {/* Tab "Phương thức thanh toán" – Placeholder */}
          {tabHienTai === "phuong_thuc_thanh_toan" && (
            <PlaceholderPanel
              tieuDe="Phương thức thanh toán"
              moTa="Bật/tắt và cấu hình các cổng thanh toán như VNPAY, COD."
            />
          )}

          {/* Tab "Bảo mật & Phiên đăng nhập" – Placeholder */}
          {tabHienTai === "bao_mat" && (
            <PlaceholderPanel
              tieuDe="Bảo mật & Phiên đăng nhập"
              moTa="Quản lý chính sách mật khẩu, phiên đăng nhập và nhật ký truy cập hệ thống."
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Component nội bộ: Placeholder cho các tab chưa phát triển
// Hiển thị tiêu đề + mô tả + thông báo "Đang phát triển"
// ----------------------------------------------------------------
function PlaceholderPanel({
  tieuDe,
  moTa,
}: {
  tieuDe: string;
  moTa: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-border bg-surface p-12 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      {/* Icon minh họa – vòng tròn xám */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f4f8]">
        <svg
          className="h-8 w-8 text-text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Tiêu đề */}
      <h3 className="mb-2 text-lg font-bold text-on-surface">{tieuDe}</h3>

      {/* Mô tả */}
      <p className="mb-4 max-w-md text-center text-sm text-text-secondary">
        {moTa}
      </p>

      {/* Thông báo đang phát triển */}
      <span className="rounded-full bg-[#fef9c3] px-3 py-1 text-xs font-semibold text-[#854d0e]">

      </span>
    </div>
  );
}
