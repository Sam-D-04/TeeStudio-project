"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Tabs } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import AccountFormModal from "./AccountFormDrawer";
import AccountStaffTable from "./AccountStaffTable";
import AccountStatCards from "./AccountStatCards";
import AccountsTable from "./AccountsTable";
import {
  capNhatTaiKhoan,
  layDanhSachTaiKhoan,
  taoTaiKhoan,
  voHieuHoaTaiKhoan,
  type CapNhatTaiKhoanInput,
  type TaiKhoanKhachHang,
  type TaoTaiKhoanInput,
  type ThamSoLocTaiKhoan,
} from "@/services/admin/accountService";

type AccountsTabKey = "customers" | "staff";

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const { notification: api } = App.useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<AccountsTabKey>("customers");
  const [thamSoLoc, setThamSoLoc] = useState<ThamSoLocTaiKhoan>({
    page: 1,
    limit: 10,
    search: "",
    status: searchParams?.get("status") || "",
  });
  const [accountModal, setAccountModal] = useState<{
    open: boolean;
    mode: "them" | "sua";
    taiKhoan: TaiKhoanKhachHang | null;
  }>({ open: false, mode: "them", taiKhoan: null });

  const queryKey = ["admin", "accounts", "customers", thamSoLoc];
  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: () => layDanhSachTaiKhoan(thamSoLoc),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const danhSach = useMemo(() => data?.items ?? [], [data?.items]);
  const tongSoList = data?.total ?? 0; // Dùng cho phân trang
  const trang = data?.page ?? 1;
  const soMoiTrang = data?.limit ?? 10;

  const tongSo = data?.statTotal ?? tongSoList;
  const soHoatDong = data?.statActive ?? 0;
  const soVoHieuHoa = data?.statInactive ?? 0;

  const mutationThem = useMutation({
    mutationFn: (payload: TaoTaiKhoanInput) => taoTaiKhoan(payload),
    onSuccess: (data) => {
      api.success({
        title: "Tạo tài khoản thành công",
        description: `Tài khoản cho ${data.fullName} đã được tạo và mật khẩu đã được gửi đến ${data.email}.`,
        placement: "topRight",
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
      setAccountModal({ open: false, mode: "them", taiKhoan: null });
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
      setAccountModal({ open: false, mode: "them", taiKhoan: null });
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

  const handleMoModalThem = () => {
    setAccountModal({ open: true, mode: "them", taiKhoan: null });
  };

  const handleMoModalSua = (taiKhoan: TaiKhoanKhachHang) => {
    setAccountModal({ open: true, mode: "sua", taiKhoan });
  };

  const handleDongModal = () => {
    setAccountModal({ open: false, mode: "them", taiKhoan: null });
  };

  const handleSubmitForm = (values: TaoTaiKhoanInput | CapNhatTaiKhoanInput) => {
    if (accountModal.mode === "them") {
      mutationThem.mutate(values as TaoTaiKhoanInput);
    } else if (accountModal.taiKhoan) {
      mutationSua.mutate({
        id: accountModal.taiKhoan.id,
        payload: values as CapNhatTaiKhoanInput,
      });
    }
  };

  const handleDoiLoc = (thamSoMoi: Partial<ThamSoLocTaiKhoan>) => {
    const newStatus = thamSoMoi.status !== undefined
      ? (thamSoMoi.status === "tat_ca" ? "" : thamSoMoi.status)
      : thamSoLoc.status;

    setThamSoLoc((prev) => ({
      ...prev,
      ...thamSoMoi,
      status: newStatus,
    }));

    // Cập nhật URL query param
    const currentParams = new URLSearchParams(Array.from(searchParams?.entries() || []));
    if (newStatus) {
      currentParams.set("status", newStatus);
    } else {
      currentParams.delete("status");
    }
    
    const newUrl = currentParams.toString() ? `${pathname}?${currentParams.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  const dangLuuForm = mutationThem.isPending || mutationSua.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
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
            Quản lý tài khoản khách hàng và nhân sự nội bộ.
          </p>
        </div>

        {activeTab === "customers" ? (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleMoModalThem}
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
        ) : null}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as AccountsTabKey)}
        items={[
          { key: "customers", label: "Khách hàng" },
          { key: "staff", label: "Nhân sự nội bộ" },
        ]}
      />

      {activeTab === "customers" ? (
        <>
          <AccountStatCards
            tongSo={tongSo}
            soHoatDong={soHoatDong}
            soVoHieuHoa={soVoHieuHoa}
            currentStatus={thamSoLoc.status}
            onFilterChange={(status) => handleDoiLoc({ status, page: 1 })}
          />

          <AccountsTable
            danhSach={danhSach}
            tongSo={tongSoList}
            trang={trang}
            soMoiTrang={soMoiTrang}
            dangTai={isFetching}
            thamSoLoc={thamSoLoc}
            onDoiTrang={(page, limit) =>
              setThamSoLoc((prev) => ({ ...prev, page, limit }))
            }
            onDoiLoc={handleDoiLoc}
            onSua={handleMoModalSua}
            onVoHieuHoa={(taiKhoan) => mutationVoHieu.mutate(taiKhoan.id)}
            onKhoiPhuc={(taiKhoan) => mutationKhoiPhuc.mutate(taiKhoan.id)}
          />
        </>
      ) : (
        <AccountStaffTable />
      )}

      <AccountFormModal
        open={accountModal.open}
        mode={accountModal.mode}
        taiKhoan={accountModal.taiKhoan}
        dangTai={dangLuuForm}
        onClose={handleDongModal}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}
