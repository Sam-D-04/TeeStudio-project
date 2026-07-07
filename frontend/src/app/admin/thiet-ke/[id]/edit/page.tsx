import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminEditDesignStudio from "@/components/admin/designs/AdminEditDesignStudio";

/**
 * EditThietKePage – Server Component cho trang Admin Sửa thiết kế.
 *
 * Route: /admin/thiet-ke/[id]/edit
 *
 * - Parse và validate designId từ URL params
 * - Render <AdminEditDesignStudio /> – toàn bộ logic Editor chạy ở client
 */
export const metadata: Metadata = {
  title: "Sửa thiết kế - TeeStudio Quản trị",
  description: "Admin chỉnh sửa thiết kế khách hàng trực tiếp trên canvas.",
};

type PageParams = Promise<{ id: string }>;

export default async function EditThietKePage({ params }: { params: PageParams }) {
  const { id } = await params;
  const designId = parseInt(id, 10);

  // Nếu id không hợp lệ → 404
  if (!Number.isInteger(designId) || designId <= 0) {
    notFound();
  }

  return <AdminEditDesignStudio designId={designId} />;
}
