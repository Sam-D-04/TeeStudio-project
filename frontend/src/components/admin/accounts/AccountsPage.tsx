"use client";

/**
 * AccountsPage – Component trang Quản lý Tài khoản Khách hàng.
 *
 * Đây là component orchestrator (điều phối):
 * nó lắp ghép tất cả component con vào layout hoàn chỉnh và
 * quản lý toàn bộ trạng thái + gọi API qua React Query.
 *
 * Cấu trúc:
 * ┌──────────────────────────────────────────────────────────┐
 * │ Tiêu đề trang + Nút "Thêm tài khoản"                    │
 * ├──────────────────────────────────────────────────────────┤
 * │ [KPI: Tổng] [KPI: Hoạt động] [KPI: Vô hiệu]            │
 * ├──────────────────────────────────────────────────────────┤
 * │ Bảng dữ liệu tài khoản (lọc, phân trang, hành động)    │
 * └──────────────────────────────────────────────────────────┘
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, App } from "antd";
import { UserAddOutlined } from "@ant-design/icons";

import AccountStatCards from "./AccountStatCards";
import AccountsTable from "./AccountsTable";
import AccountFormDrawer from "./AccountFormDrawer";

import {
  layDanhSachTaiKhoan,
  taoTaiKhoan,
  capNhatTaiKhoan,
  voHieuHoaTaiKhoan,
  type TaiKhoanKhachHang,
  type ThamSoLocTaiKhoan,
  type TaoTaiKhoanInput,
  type CapNhatTaiKhoanInput,
} from "@/services/admin/accountService";

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const { notification: api } = App.useApp();

  // ── Trạng thái bộ lọc & phân trang ────────────────────────────────
  const [thamSoLoc, setThamSoLoc] = useState<ThamSoLocTaiKhoan>({
    page: 1,
    limit: 20,
    search: "",
    status: "",
  });

  // ── Trạng thái Drawer form thêm/sửa ───────────────────────────────
  const [drawer, setDrawer] = useState<{
    open: boolean;
    mode: "them" | "sua";
    taiKhoan: TaiKhoanKhachHang | null;
  }>({ open: false, mode: "them", taiKhoan: null });

  // ── Query: Lấy danh sách tài khoản ───────────────────────────────
  const queryKey = ["admin", "accounts", thamSoLoc];
  const {
    data,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: () => layDanhSachTaiKhoan(thamSoLoc),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const danhSach = data?.items ?? [];
  const tongSo = data?.total ?? 0;
  const trang = data?.page ?? 1;
  const soMoiTrang = data?.limit ?? 20;

  // ── Tính KPI thống kê ──────────────────────────────────────────────
  const { soHoatDong, soVoHieuHoa } = useMemo(() => {
    return {
      soHoatDong: danhSach.filter((t) => t.status === "ACTIVE").length,
      soVoHieuHoa: danhSach.filter((t) => t.status !== "ACTIVE").length,
    };
  }, [danhSach]);

  // ── Mutation: Tạo tài khoản ────────────────────────────────────────
  const mutationThem = useMutation({
    mutationFn: (payload: TaoTaiKhoanInput) => taoTaiKhoan(payload),
    onSuccess: (data) => {
      api.success({
        title: "Tạo tài khoản thành công",
        description: `Tài khoản cho ${data.fullName} đã được tạo.`,
        placement: "topRight",
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
      setDrawer({ open: false, mode: "them", taiKhoan: null });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      api.error({
        title: "Tạo tài khoản thất bại",
        description:
          err?.response?.data?.message ?? "Đã xảy ra lỗi, vui lòng thử lại.",
        placement: "topRight",
      });
    },
  });

  // ── Mutation: Cập nhật tài khoản ───────────────────────────────────
  const mutationSua = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CapNhatTaiKhoanInput;
    }) => capNhatTaiKhoan(id, payload),
    onSuccess: (data) => {
      api.success({
        title: "Cập nhật thành công",
        description: `Thông tin tài khoản ${data.fullName} đã được cập nhật.`,
        placement: "topRight",
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
      setDrawer({ open: false, mode: "them", taiKhoan: null });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      api.error({
        title: "Cập nhật thất bại",
        description:
          err?.response?.data?.message ?? "Đã xảy ra lỗi, vui lòng thử lại.",
        placement: "topRight",
      });
    },
  });

  // ── Mutation: Vô hiệu hóa (soft-delete) ───────────────────────────
  const mutationVoHieu = useMutation({
    mutationFn: (id: number) => voHieuHoaTaiKhoan(id, "INACTIVE"),
    onSuccess: (data) => {
      api.success({
        title: "Đã vô hiệu hóa tài khoản",
        description: `Tài khoản ${data.fullName} đã bị vô hiệu hóa. Khách hàng không thể đăng nhập.`,
        placement: "topRight",
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      api.error({
        title: "Vô hiệu hóa thất bại",
        description:
          err?.response?.data?.message ?? "Đã xảy ra lỗi, vui lòng thử lại.",
        placement: "topRight",
      });
    },
  });

  // ── Mutation: Khôi phục tài khoản ─────────────────────────────────
  const mutationKhoiPhuc = useMutation({
    mutationFn: (id: number) => capNhatTaiKhoan(id, { status: "ACTIVE" }),
    onSuccess: (data) => {
      api.success({
        title: "Đã khôi phục tài khoản",
        description: `Tài khoản ${data.fullName} đã được kích hoạt trở lại.`,
        placement: "topRight",
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      api.error({
        title: "Khôi phục thất bại",
        description:
          err?.response?.data?.message ?? "Đã xảy ra lỗi, vui lòng thử lại.",
        placement: "topRight",
      });
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────
  const handleMoDrawerThem = () => {
    setDrawer({ open: true, mode: "them", taiKhoan: null });
  };

  const handleMoDrawerSua = (taiKhoan: TaiKhoanKhachHang) => {
    setDrawer({ open: true, mode: "sua", taiKhoan });
  };

  const handleDongDrawer = () => {
    setDrawer({ open: false, mode: "them", taiKhoan: null });
  };

  const handleSubmitForm = (values: TaoTaiKhoanInput | CapNhatTaiKhoanInput) => {
    if (drawer.mode === "them") {
      mutationThem.mutate(values as TaoTaiKhoanInput);
    } else if (drawer.taiKhoan) {
      mutationSua.mutate({
        id: drawer.taiKhoan.id,
        payload: values as CapNhatTaiKhoanInput,
      });
    }
  };

  const handleDoiLoc = (thamSoMoi: Partial<ThamSoLocTaiKhoan>) => {
    setThamSoLoc((prev) => ({
      ...prev,
      ...thamSoMoi,
      ...(thamSoMoi.status !== undefined ? { status: thamSoMoi.status === "tat_ca" ? "" : thamSoMoi.status } : {}),
    }));
  };

  const dangLuuForm =
    mutationThem.isPending || mutationSua.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* ============================================================
          PHẦN 1: TIÊU ĐỀ TRANG + NÚT HÀNH ĐỘNG
          ============================================================ */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        {/* Tiêu đề và mô tả */}
        <div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Tài khoản
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
              margin: "6px 0 0",
            }}
          >
            Quản lý tài khoản khách hàng – xem, thêm mới, cập nhật và vô hiệu hóa.
          </p>
        </div>

        {/* Nút thêm tài khoản */}
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleMoDrawerThem}
          style={{
            height: 40,
            borderRadius: 8,
            background: "#0ea5e9",
            border: "none",
            fontWeight: 600,
            fontSize: 14,
            paddingInline: 20,
            boxShadow: "0 2px 8px rgba(14,165,233,0.25)",
          }}
        >
          Thêm tài khoản
        </Button>
      </div>

      {/* ============================================================
          PHẦN 2: THẺ THỐNG KÊ KPI
          ============================================================ */}
      <AccountStatCards
        tongSo={tongSo}
        soHoatDong={soHoatDong}
        soVoHieuHoa={soVoHieuHoa}
      />

      {/* ============================================================
          PHẦN 3: BẢNG DỮ LIỆU
          ============================================================ */}
      <AccountsTable
        danhSach={danhSach}
        tongSo={tongSo}
        trang={trang}
        soMoiTrang={soMoiTrang}
        dangTai={isFetching}
        thamSoLoc={thamSoLoc}
        onDoiTrang={(page, limit) =>
          setThamSoLoc((prev) => ({ ...prev, page, limit }))
        }
        onDoiLoc={handleDoiLoc}
        onSua={handleMoDrawerSua}
        onVoHieuHoa={(taiKhoan) => mutationVoHieu.mutate(taiKhoan.id)}
        onKhoiPhuc={(taiKhoan) => mutationKhoiPhuc.mutate(taiKhoan.id)}
      />

      {/* ============================================================
          PHẦN 4: DRAWER FORM THÊM / SỬA
          ============================================================ */}
      <AccountFormDrawer
        open={drawer.open}
        mode={drawer.mode}
        taiKhoan={drawer.taiKhoan}
        dangTai={dangLuuForm}
        onClose={handleDongDrawer}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}
