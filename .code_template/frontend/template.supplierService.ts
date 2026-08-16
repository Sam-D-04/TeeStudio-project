// Import apiClient (thư viện axios đã cấu hình sẵn token và url gốc của dự án bạn)
import apiClient from "@/lib/apiClient";

// Định nghĩa kiểu dữ liệu chuẩn (TypeScript)
export type Supplier = {
    id: number;
    name: string;
    phone: string;
};

// 1. API: Lấy danh sách
export async function getSuppliers(): Promise<Supplier[]> {
    // apiClient tự động thêm /api vào đầu, nên chỉ cần ghi /suppliers
    const res = await apiClient.get("/admin/suppliers");

    // Ở Backend ta trả về res.json({ data: rows }) nên ta return res.data.data
    return res.data?.data || [];
}

// 2. API: Thêm mới
export async function createSupplier(payload: { name: string; phone: string }) {
    const res = await apiClient.post("/admin/suppliers", payload);
    return res.data;
}

// 3. API: Xóa
export async function deleteSupplier(id: number) {
    const res = await apiClient.delete(`/admin/suppliers/${id}`);
    return res.data;
}
// =====================================================================
// 4. API: Sửa (Cập nhật)
// =====================================================================
// Cần truyền id của nhà cung cấp muốn sửa và dữ liệu mới (payload)
export async function updateSupplier({ id, payload }: { id: number; payload: { name: string; phone: string } }) {
    // Gọi phương thức PUT kèm id trên URL
    const res = await apiClient.put(`/admin/suppliers/${id}`, payload);
    return res.data;
}

// =====================================================================
// 5. API: Tìm kiếm
// =====================================================================
export async function searchSuppliers(keyword: string): Promise<Supplier[]> {
    // Dùng params của axios để tự động ghép chữ vào URL
    // Nó sẽ tự động biến thành: /admin/suppliers/search?keyword=chữ_được_gõ
    const res = await apiClient.get("/admin/suppliers/search", {
        params: { keyword }
    });

    // Trả về danh sách kết quả y hệt như hàm lấy danh sách (getSuppliers)
    return res.data?.data || [];
}
