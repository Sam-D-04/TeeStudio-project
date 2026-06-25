"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusOutlined, TagOutlined, ClockCircleOutlined, DollarOutlined, LoadingOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { App } from "antd";
import { useRouter } from "next/navigation";

import PromotionStatCard from "./PromotionStatCard";
import PromotionFilterBar, { type BoDucMaKhuyenMai } from "./PromotionFilterBar";
import PromotionTable from "./PromotionTable";
import PromotionDrawer, { type FormMaKhuyenMai } from "./PromotionDrawer";
import BulkPricingTab from "./BulkPricingTab";
import PrintSurchargeTab from "./PrintSurchargeTab";
import PriceFormulaTab from "./PriceFormulaTab";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import * as promotionService from "@/services/admin/promotionService";

const SO_MOI_TRANG = 10;
const DANH_SACH_TAB = [
  { key: "ma_khuyen_mai", nhan: "Mã khuyến mãi" },
  { key: "gia_so_luong_lon", nhan: "Giá số lượng lớn" },
  { key: "phu_phi_in", nhan: "Phụ phí in & thiết kế" },
  { key: "cong_thuc_bao_gia", nhan: "Công thức báo giá" },
] as const;
type TenTab = (typeof DANH_SACH_TAB)[number]["key"];

export type PromotionInitialFilters = {
  trangThai?: BoDucMaKhuyenMai["trangThai"];
  hetHanTrongNgay?: number;
  kySuDung?: "THIS_MONTH";
  kyGiamGia?: "THIS_MONTH";
};

type PromotionPageProps = {
  initialFilters?: PromotionInitialFilters;
};

const doiFormSangPayload = (
  form: FormMaKhuyenMai,
): promotionService.LuuKhuyenMaiInput => ({
  code: form.ma.trim().toUpperCase(),
  discountType:
    form.loaiGiam === "phan_tram"
      ? "PERCENT"
      : form.loaiGiam === "so_tien"
        ? "FIXED"
        : "FREE_SHIPPING",
  discountValue:
    form.loaiGiam === "mien_phi_van_chuyen" ? 0 : Number(form.giaTriGiam),
  minOrderAmount: Number(form.donToiThieu || 0),
  startDate: form.ngayBatDau,
  endDate: form.ngayKetThuc || undefined,
  usageLimit: form.gioiHanLuot ? Number(form.gioiHanLuot) : undefined,
  isNewCustomerOnly: form.chiDanhChoKhachMoi,
  status: form.dangHoatDong ? "ACTIVE" : "INACTIVE",
});

function PromotionContent({ initialFilters }: PromotionPageProps) {
  const { message } = App.useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [resetKey, setResetKey] = useState(0);
  const [tabDangChon, setTabDangChon] = useState<TenTab>("ma_khuyen_mai");
  const [trang, setTrang] = useState(1);
  const [dsIDDaChon, setDsIDDaChon] = useState<number[]>([]);
  const [boDuc, setBoDuc] = useState<BoDucMaKhuyenMai>({
    tuKhoa: "",
    trangThai: initialFilters?.trangThai ?? "",
    loaiGiam: "",
    tuNgay: "",
    denNgay: "",
  });
  const [boLocNhanh, setBoLocNhanh] = useState<
    Pick<
      promotionService.BoLocKhuyenMai,
      "hetHanTrongNgay" | "kySuDung" | "kyGiamGia"
    >
  >({
    hetHanTrongNgay: initialFilters?.hetHanTrongNgay,
    kySuDung: initialFilters?.kySuDung,
    kyGiamGia: initialFilters?.kyGiamGia,
  });
  const [moDrawer, setMoDrawer] = useState(false);
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  const [phienMoDrawer, setPhienMoDrawer] = useState(0);

  const statsQuery = useQuery({
    queryKey: ["admin-promotions", "stats"],
    queryFn: promotionService.layThongKeKhuyenMai,
  });
  const listQuery = useQuery({
    queryKey: ["admin-promotions", "list", trang, boDuc, boLocNhanh],
    queryFn: () =>
      promotionService.layDanhSachKhuyenMai({
        ...boDuc,
        ...boLocNhanh,
        trang,
        soMoiTrang: SO_MOI_TRANG,
      }),
    placeholderData: (previous) => previous,
  });

  const lamMoiDuLieu = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
    queryClient.invalidateQueries({ queryKey: ["admin-orders", "promotions"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (form: FormMaKhuyenMai) => {
      if (!form.ma.trim() || !form.ngayBatDau) {
        throw new Error("Vui lòng nhập mã khuyến mãi và ngày bắt đầu");
      }
      if (form.loaiGiam !== "mien_phi_van_chuyen" && !form.giaTriGiam) {
        throw new Error("Vui lòng nhập giá trị giảm");
      }
      const payload = doiFormSangPayload(form);
      return dangSuaId
        ? promotionService.capNhatKhuyenMai(dangSuaId, payload)
        : promotionService.taoKhuyenMai(payload);
    },
    onSuccess: () => {
      message.success(dangSuaId ? "Đã cập nhật mã khuyến mãi" : "Đã tạo mã khuyến mãi");
      setMoDrawer(false);
      setDangSuaId(null);
      lamMoiDuLieu();
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: promotionService.xoaKhuyenMai,
    onSuccess: () => {
      message.success("Đã xóa mã khuyến mãi");
      setDsIDDaChon([]);
      lamMoiDuLieu();
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const danhSach = listQuery.data?.danhSach ?? [];
  const maDangSua = danhSach.find((item) => item.id === dangSuaId) ?? null;
  const thongKe = statsQuery.data;

  function moTaoMoi() {
    setDangSuaId(null);
    setPhienMoDrawer((value) => value + 1);
    setMoDrawer(true);
  }

  function moChinhSua(id: number) {
    setDangSuaId(id);
    setPhienMoDrawer((value) => value + 1);
    setMoDrawer(true);
  }

  function doiBoLoc(value: BoDucMaKhuyenMai) {
    setBoDuc(value);
    setBoLocNhanh({});
    setTrang(1);
    setDsIDDaChon([]);
  }

  const handleResetFilter = () => {
    router.push('/admin/khuyen-mai-bao-gia');
    setBoDuc({
      tuKhoa: "",
      trangThai: "",
      loaiGiam: "",
      tuNgay: "",
      denNgay: "",
    });
    setBoLocNhanh({});
    setTrang(1);
    setDsIDDaChon([]);
    setResetKey(prev => prev + 1);
  };

  const khongCoBoLocChiTiet =
    boDuc.tuKhoa.trim() === "" &&
    boDuc.loaiGiam === "" &&
    boDuc.tuNgay === "" &&
    boDuc.denNgay === "";

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Khuyến mãi &amp; Báo giá
            </h2>
            <p style={{ fontSize: 14, color: "#475569", margin: "4px 0 0" }}>
              Quản lý mã giảm giá, giá theo số lượng, phụ phí in và công thức báo giá.
            </p>
          </div>
          <button
            onClick={moTaoMoi}
            style={{
              height: 40,
              padding: "0 16px",
              background: "#0ea5e9",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <PlusOutlined />
            Tạo mã khuyến mãi
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <PromotionStatCard
            nhan="Mã đang hoạt động"
            giaTri={statsQuery.isLoading ? "..." : thongKe?.dangHoatDong ?? 0}
            icon={<TagOutlined />}
            mauNenIcon="#dcfce7"
            mauIcon="#10b981"
            href="/admin/khuyen-mai-bao-gia?status=ACTIVE"
            isActive={
              boDuc.trangThai === "dang_hoat_dong" &&
              !boLocNhanh.hetHanTrongNgay &&
              !boLocNhanh.kySuDung &&
              !boLocNhanh.kyGiamGia &&
              khongCoBoLocChiTiet
            }
          />
          <PromotionStatCard
            nhan="Sắp hết hạn trong 7 ngày"
            giaTri={statsQuery.isLoading ? "..." : thongKe?.sapHetHan ?? 0}
            icon={<ClockCircleOutlined />}
            mauNenIcon="#ffdad6"
            mauIcon="#ea580c"
            href="/admin/khuyen-mai-bao-gia?status=ACTIVE&expiresWithinDays=7"
            isActive={
              boDuc.trangThai === "dang_hoat_dong" &&
              boLocNhanh.hetHanTrongNgay === 7 &&
              !boLocNhanh.kySuDung &&
              !boLocNhanh.kyGiamGia &&
              khongCoBoLocChiTiet
            }
          />
          <PromotionStatCard
            nhan="Lượt dùng tháng này"
            giaTri={statsQuery.isLoading ? "..." : thongKe?.luotDungThangNay ?? 0}
            icon={<CheckCircleOutlined />}
            mauNenIcon="#c9e6ff"
            mauIcon="#006591"
            href="/admin/khuyen-mai-bao-gia?usagePeriod=THIS_MONTH"
            isActive={
              boDuc.trangThai === "" &&
              boLocNhanh.kySuDung === "THIS_MONTH" &&
              !boLocNhanh.hetHanTrongNgay &&
              !boLocNhanh.kyGiamGia &&
              khongCoBoLocChiTiet
            }
          />
          <PromotionStatCard
            nhan="Giảm giá tháng này"
            giaTri={
              statsQuery.isLoading
                ? "..."
                : `${(thongKe?.tongTienDaGiamThangNay ?? 0).toLocaleString("vi-VN")}đ`
            }
            icon={<DollarOutlined />}
            mauNenIcon="#cce5ff"
            mauIcon="#006398"
            href="/admin/khuyen-mai-bao-gia?discountPeriod=THIS_MONTH"
            isActive={
              boDuc.trangThai === "" &&
              boLocNhanh.kyGiamGia === "THIS_MONTH" &&
              !boLocNhanh.hetHanTrongNgay &&
              !boLocNhanh.kySuDung &&
              khongCoBoLocChiTiet
            }
          />
        </div>

        <div style={{ borderBottom: "1px solid #e2e8f0", display: "flex", gap: 24 }}>
          {DANH_SACH_TAB.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTabDangChon(tab.key)}
              style={{
                padding: "0 0 12px",
                border: "none",
                borderBottom:
                  tabDangChon === tab.key ? "2px solid #0ea5e9" : "2px solid transparent",
                background: "transparent",
                color: tabDangChon === tab.key ? "#0ea5e9" : "#475569",
                fontSize: 14,
                fontWeight: tabDangChon === tab.key ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {tab.nhan}
            </button>
          ))}
        </div>

        {tabDangChon === "ma_khuyen_mai" && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <PromotionFilterBar key={resetKey} boDuc={boDuc} onThayDoi={doiBoLoc} onReset={handleResetFilter} />
            {listQuery.isLoading && !listQuery.data ? (
              <div style={{ padding: 48, textAlign: "center", color: "#475569" }}>
                <LoadingOutlined style={{ marginRight: 8 }} />
                Đang tải danh sách khuyến mãi...
              </div>
            ) : listQuery.isError ? (
              <div style={{ padding: 48, textAlign: "center", color: "#b91c1c" }}>
                {getApiErrorMessage(listQuery.error, "Không thể tải danh sách khuyến mãi")}
              </div>
            ) : (
              <PromotionTable
                danhSach={danhSach}
                dsIDDaChon={dsIDDaChon}
                onChonTatCa={(checked) =>
                  setDsIDDaChon(checked ? danhSach.map((item) => item.id) : [])
                }
                onChonMot={(id) =>
                  setDsIDDaChon((current) =>
                    current.includes(id)
                      ? current.filter((item) => item !== id)
                      : [...current, id],
                  )
                }
                onXem={moChinhSua}
                onSua={moChinhSua}
                onXoa={(id) => {
                  if (window.confirm("Bạn có chắc muốn xóa mã khuyến mãi này?")) {
                    deleteMutation.mutate(id);
                  }
                }}
              />
            )}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 12, color: "#475569" }}>
                Tổng cộng {listQuery.data?.tongSo ?? 0} mã khuyến mãi
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  disabled={trang <= 1}
                  onClick={() => setTrang((value) => value - 1)}
                  style={{ padding: "5px 10px", cursor: trang <= 1 ? "not-allowed" : "pointer" }}
                >
                  Trước
                </button>
                <span style={{ fontSize: 12 }}>
                  Trang {trang}/{listQuery.data?.tongSoTrang ?? 1}
                </span>
                <button
                  disabled={trang >= (listQuery.data?.tongSoTrang ?? 1)}
                  onClick={() => setTrang((value) => value + 1)}
                  style={{
                    padding: "5px 10px",
                    cursor:
                      trang >= (listQuery.data?.tongSoTrang ?? 1) ? "not-allowed" : "pointer",
                  }}
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}

        {tabDangChon === "gia_so_luong_lon" && <BulkPricingTab />}
        {tabDangChon === "phu_phi_in" && <PrintSurchargeTab />}
        {tabDangChon === "cong_thuc_bao_gia" && <PriceFormulaTab />}
      </div>

      <PromotionDrawer
        key={phienMoDrawer}
        moDrawer={moDrawer}
        dangSua={dangSuaId !== null}
        duLieuDangSua={maDangSua}
        onDong={() => {
          setMoDrawer(false);
          setDangSuaId(null);
        }}
        onLuu={(form) => saveMutation.mutate(form)}
        dangLuu={saveMutation.isPending}
      />
    </>
  );
}

export default function PromotionPage({ initialFilters }: PromotionPageProps) {
  return (
    <App>
      <PromotionContent initialFilters={initialFilters} />
    </App>
  );
}
