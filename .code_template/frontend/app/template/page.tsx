import React from "react";
// Nhúng cái component đã xây dựng ở trên vào
import SupplierManagement from "@/components/admin/template/template.supplierPage";

export const metadata = {
    title: "Quản lý nhà cung cấp (Mẫu)",
};

export default function TemplatePage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Module Template</h1>
                <p className="text-sm text-gray-500">Ví dụ cấu trúc chuẩn MVC / 3 lớp của dự án</p>
            </div>

            {/* Gọi Component hiển thị ra màn hình */}
            <SupplierManagement />
        </div>
    );
}
