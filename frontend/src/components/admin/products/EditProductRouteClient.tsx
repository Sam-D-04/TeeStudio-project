"use client";

import { useParams } from "next/navigation";
import EditProductPage from "@/components/admin/products/EditProductPage";

/**
 * Ranh giới phía máy khách cho trang xem và chỉnh sửa phôi áo.
 */
export default function EditProductRouteClient() {
  const params = useParams<{ id: string }>();
  return <EditProductPage productId={Number(params.id)} />;
}
