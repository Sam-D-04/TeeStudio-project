import apiClient from "@/lib/apiClient";

export type TrangThaiKhuyenMai =
  | "dang_hoat_dong"
  | "tam_dung"
  | "het_han"
  | "sap_dien_ra";

export type LoaiGiamKhuyenMai =
  | "phan_tram"
  | "so_tien"
  | "mien_phi_van_chuyen";

export type MaKhuyenMai = {
  id: number;
  ma: string;
  loaiGiam: LoaiGiamKhuyenMai;
  giaTriGiam: number;
  donToiThieu: number;
  ngayBatDau: string;
  ngayKetThuc: string | null;
  daSuDung: number;
  gioiHanLuot: number | null;
  chiDanhChoKhachMoi: boolean;
  trangThai: TrangThaiKhuyenMai;
};

export type ThongKeKhuyenMai = {
  dangHoatDong: number;
  sapHetHan: number;
  luotDungThangNay: number;
  tongTienDaGiamThangNay: number;
};

export type BoLocKhuyenMai = {
  trang?: number;
  soMoiTrang?: number;
  tuKhoa?: string;
  trangThai?: TrangThaiKhuyenMai | "";
  loaiGiam?: LoaiGiamKhuyenMai | "";
  tuNgay?: string;
  denNgay?: string;
  hetHanTrongNgay?: number;
  kySuDung?: "THIS_MONTH";
  kyGiamGia?: "THIS_MONTH";
};

export type KetQuaDanhSachKhuyenMai = {
  danhSach: MaKhuyenMai[];
  tongSo: number;
  trang: number;
  soMoiTrang: number;
  tongSoTrang: number;
};

export type LuuKhuyenMaiInput = {
  code: string;
  discountType: "PERCENT" | "FIXED" | "FREE_SHIPPING";
  discountValue: number;
  minOrderAmount: number;
  startDate: string;
  endDate?: string;
  usageLimit?: number;
  isNewCustomerOnly: boolean;
  status: "ACTIVE" | "INACTIVE";
};

export type SanPhamGiaSoLuong = {
  id: number;
  ten: string;
  giaCoBan: number;
  dangHoatDong: boolean;
  soMucGia: number;
};

export type MucGiaSoLuong = {
  id: number;
  productId: number;
  tuSoLuong: number;
  denSoLuong: number | null;
  phanTramGiam: number;
  donGiaSauGiam: number;
};

export type KetQuaGiaSoLuong = {
  sanPham: { id: number; ten: string; giaCoBan: number };
  danhSach: MucGiaSoLuong[];
};

export type LuuGiaSoLuongInput = {
  productId: number;
  minQty: number;
  discountPercent: number;
};

export type LoaiPhuPhi = "VI_TRI_IN" | "PHUONG_PHAP_IN";

export type PhuPhiBaoGia = {
  id: number;
  loai: LoaiPhuPhi;
  ma: string;
  ten: string;
  moTa: string;
  giaTri: number;
  dangBat: boolean;
};

export type DanhSachPhuPhi = {
  viTriIn: PhuPhiBaoGia[];
  phuongPhapIn: PhuPhiBaoGia[];
};

export type CauHinhBaoGia = {
  defaultShippingFee: number;
  freeShippingThreshold: number;
  vatPercent: number;
};

export type XemTruocBaoGia = {
  giaPhoiMau: number;
  phuPhiInMau: number;
  tamTinh: number;
  thueVat: number;
  phiVanChuyen: number;
  truocLamTron: number;
  tongCong: number;
};

export type KetQuaCongThucBaoGia = {
  cauHinh: CauHinhBaoGia;
  xemTruoc: XemTruocBaoGia;
};

const loaiGiamSangBackend = (loai?: LoaiGiamKhuyenMai | "") => {
  if (loai === "phan_tram") return "PERCENT";
  if (loai === "so_tien") return "FIXED";
  if (loai === "mien_phi_van_chuyen") return "FREE_SHIPPING";
  return undefined;
};

export async function layThongKeKhuyenMai(): Promise<ThongKeKhuyenMai> {
  const response = await apiClient.get<{ success: boolean; data: ThongKeKhuyenMai }>(
    "/admin/promotions/stats",
  );
  return response.data.data;
}

export async function layDanhSachKhuyenMai(
  boLoc: BoLocKhuyenMai,
): Promise<KetQuaDanhSachKhuyenMai> {
  const params = {
    ...boLoc,
    loaiGiam: loaiGiamSangBackend(boLoc.loaiGiam),
  };
  const response = await apiClient.get<{
    success: boolean;
    data: KetQuaDanhSachKhuyenMai;
  }>("/admin/promotions", { params });
  return response.data.data;
}

export async function taoKhuyenMai(payload: LuuKhuyenMaiInput) {
  const response = await apiClient.post("/admin/promotions", payload);
  return response.data.data;
}

export async function capNhatKhuyenMai(id: number, payload: LuuKhuyenMaiInput) {
  const response = await apiClient.put(`/admin/promotions/${id}`, payload);
  return response.data.data;
}

export async function xoaKhuyenMai(id: number) {
  const response = await apiClient.delete(`/admin/promotions/${id}`);
  return response.data.data;
}

export async function laySanPhamGiaSoLuong(): Promise<SanPhamGiaSoLuong[]> {
  const response = await apiClient.get<{ success: boolean; data: SanPhamGiaSoLuong[] }>(
    "/admin/promotions/bulk-pricing/products",
  );
  return response.data.data;
}

export async function layGiaSoLuong(productId: number): Promise<KetQuaGiaSoLuong> {
  const response = await apiClient.get<{ success: boolean; data: KetQuaGiaSoLuong }>(
    "/admin/promotions/bulk-pricing",
    { params: { productId } },
  );
  return response.data.data;
}

export async function taoGiaSoLuong(payload: LuuGiaSoLuongInput) {
  const response = await apiClient.post("/admin/promotions/bulk-pricing", payload);
  return response.data.data;
}

export async function capNhatGiaSoLuong(id: number, payload: LuuGiaSoLuongInput) {
  const response = await apiClient.put(`/admin/promotions/bulk-pricing/${id}`, payload);
  return response.data.data;
}

export async function xoaGiaSoLuong(id: number) {
  const response = await apiClient.delete(`/admin/promotions/bulk-pricing/${id}`);
  return response.data.data;
}

export async function layDanhSachPhuPhi(): Promise<DanhSachPhuPhi> {
  const response = await apiClient.get<{ success: boolean; data: DanhSachPhuPhi }>(
    "/admin/promotions/surcharges",
  );
  return response.data.data;
}

export async function capNhatPhuPhi(
  id: number,
  payload: { loai: LoaiPhuPhi; extraCost: number; isActive: boolean },
) {
  const response = await apiClient.put(`/admin/promotions/surcharges/${id}`, payload);
  return response.data.data;
}

export async function layCongThucBaoGia(): Promise<KetQuaCongThucBaoGia> {
  const response = await apiClient.get<{
    success: boolean;
    data: KetQuaCongThucBaoGia;
  }>("/admin/promotions/pricing-formula");
  return response.data.data;
}

export async function capNhatCongThucBaoGia(
  payload: CauHinhBaoGia,
): Promise<KetQuaCongThucBaoGia> {
  const response = await apiClient.put<{
    success: boolean;
    data: KetQuaCongThucBaoGia;
  }>("/admin/promotions/pricing-formula", payload);
  return response.data.data;
}
