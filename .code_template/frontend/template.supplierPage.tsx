"use client";

import React, { useState } from "react";
// Import công cụ của React Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Import Service
// BƯỚC 1: Đừng quên import 2 hàm mới (updateSupplier, searchSuppliers)
import { Supplier, getSuppliers, searchSuppliers, createSupplier, deleteSupplier, updateSupplier } from "@/services/admin/template.supplierService";

export default function SupplierManagement() {
    const queryClient = useQueryClient(); // Công cụ dùng để ra lệnh "tải lại dữ liệu"

    // Chỉ còn 2 biến lưu ô input, KHÔNG cần biến suppliers = useState([]) nữa!
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    // BƯỚC 2: Thêm 2 biến trạng thái để phục vụ Sửa và Tìm kiếm
    const [editingId, setEditingId] = useState<number | null>(null); // Lưu ID của người đang được sửa
    const [searchKeyword, setSearchKeyword] = useState(""); // Lưu chữ gõ vào ô tìm kiếm

    // =================================================================
    // 1. ĐỌC DỮ LIỆU (Thay cho useEffect)
    // =================================================================
    const {
        data: suppliers,
        isLoading,
        isError
    } = useQuery({
        // Mảng queryKey này rất hay: khi searchKeyword thay đổi, nó tự biết dữ liệu cũ bị "hết hạn" và sẽ tự động gọi lại API ở dòng dưới.
        queryKey: ["suppliers", searchKeyword],  // Tên định danh dữ liệu (Cache key)
        queryFn: () => searchSuppliers(searchKeyword),   // Chỉ cái hàm service gọi API
        // Chỉ cái hàm service gọi API
    });

    // =================================================================
    // 2. THÊM MỚI DỮ LIỆU (useMutation)
    // =================================================================
    const createMutation = useMutation({
        mutationFn: createSupplier,
        onSuccess: () => {
            // Khi thêm thành công -> Xóa chữ ô input
            setName("");
            setPhone("");
            // Ra lệnh: "Bảng suppliers cũ rồi, tự động gọi API tải lại đi!"
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        }
    });

    // =================================================================
    // 3. XÓA DỮ LIỆU (useMutation)
    // =================================================================
    const deleteMutation = useMutation({
        mutationFn: deleteSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        }
    });

    // 3. SỬA DỮ LIỆU (MỚI)
    // =================================================================
    const updateMutation = useMutation({
        mutationFn: updateSupplier,
        onSuccess: () => {
            setName("");
            setPhone("");
            setEditingId(null); // Sửa xong thì xóa ID để quay về chế độ "Thêm mới"
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        }
    });

    // --- Các hàm xử lý nút bấm ---
    // const handleCreate = () => {
    //     if (!name) return alert("Vui lòng nhập tên!");
    //     // Gọi mutation thay vì gọi API trực tiếp
    //     createMutation.mutate({ name, phone });
    // };


    // --- Hàm xử lý khi bấm nút Thêm / Lưu ---
    const handleSubmit = () => {
        if (!name) return alert("Vui lòng nhập tên!");

        if (editingId) {
            // Nếu biến editingId có giá trị -> Đang ở chế độ Sửa
            updateMutation.mutate({ id: editingId, payload: { name, phone } });
        } else {
            // Ngược lại -> Chế độ Thêm mới
            createMutation.mutate({ name, phone });
        }
    };
    // --- Hàm xử lý khi bấm nút Sửa trên từng dòng ---
    const handleEditClick = (sup: Supplier) => {
        setEditingId(sup.id); // Lưu lại ID
        setName(sup.name);    // Bơm tên lên ô input
        setPhone(sup.phone);  // Bơm sđt lên ô input
    };

    const handleDelete = (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa?")) return;
        deleteMutation.mutate(id);
    };

    // --- Xử lý trạng thái tải ---
    //if (isLoading) return <div className="p-6">Đang tải dữ liệu...</div>;
    //if (isError) return <div className="p-6 text-red-500">Lỗi khi tải dữ liệu. Hãy kiểm tra Backend.</div>;

    // --- GIAO DIỆN KHÔNG THAY ĐỔI ---
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm border">
            <h2 className="mb-4 text-xl font-bold">Danh sách Nhà cung cấp</h2>

            {/* BƯỚC 3: KHU VỰC TÌM KIẾM */}
            <div className="mb-6">
                <input
                    className="border border-blue-300 p-2 rounded w-full bg-blue-50 focus:outline-none"
                    placeholder="🔍 Gõ Tên hoặc SĐT để tìm kiếm tự động..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
            </div>
            {/* BƯỚC 4: KHU VỰC THÊM/SỬA */}
            <div className="mb-5 flex gap-2 items-center bg-gray-50 p-3 rounded border">
                {/* Đổi chữ linh hoạt dựa trên việc có đang sửa hay không */}
                <span className="font-semibold text-gray-700">{editingId ? "Đang Sửa:" : "Thêm Mới:"}</span>
                <input
                    className="border p-2 rounded w-1/3"
                    placeholder="Tên..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />



                <input
                    className="border p-2 rounded w-1/3"
                    placeholder="SĐT..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <button
                    className="bg-blue-600 hover:bg-blue-700 rounded text-white px-4 py-2 flex items-center gap-2"
                    //onClick={handleCreate}
                    onClick={handleSubmit}
                    //disabled={createMutation.isPending} // Chặn bấm liên tục khi đang lưu
                    disabled={createMutation.isPending || updateMutation.isPending}
                >
                    {editingId ? "Lưu thay đổi" : "Thêm NCC"}
                </button>

                {/* Nút Hủy (Chỉ hiện ra khi đang ở chế độ Sửa) */}
                {editingId && (
                    <button
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
                        onClick={() => {
                            setEditingId(null);
                            setName("");
                            setPhone("");
                        }}
                    >
                        Hủy
                    </button>
                )}
            </div>

            <table className="w-full border text-center">
                <thead className="bg-gray-100">
                    <tr><th className="py-2">ID</th><th>Tên</th><th>SĐT</th><th>Thao tác</th></tr>
                </thead>
                <tbody>
                    {suppliers?.map((sup: Supplier) => (
                        <tr key={sup.id} className="border-b hover:bg-gray-50">
                            <td className="py-2">{sup.id}</td>
                            <td>{sup.name}</td>
                            <td>{sup.phone}</td>
                            <td>
                                {/* BƯỚC 5: NÚT SỬA */}
                                <button
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2 transition-colors"
                                    onClick={() => handleEditClick(sup)}
                                >
                                    Sửa
                                </button>
                                <button
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                    onClick={() => handleDelete(sup.id)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    {suppliers?.length === 0 && (
                        <tr><td colSpan={4} className="py-5 text-gray-500">Chưa có dữ liệu</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
