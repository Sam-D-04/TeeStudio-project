import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminEditDesignStudio from "@/components/admin/designs/AdminEditDesignStudio";

/**
 * Trang sửa thiết kế dùng layout admin-studio toàn màn hình.
 * Route group `(admin-studio)` không xuất hiện trong URL, vì vậy đường dẫn
 * vẫn là /admin/thiet-ke/[id]/edit nhưng không kế thừa AdminShell/menu.
 */
export const metadata: Metadata = {
  title: "Sửa thiết kế - TeeStudio Quản trị",
  description: "Admin chỉnh sửa thiết kế khách hàng trực tiếp trên canvas.",
};

type PageParams = Promise<{ id: string }>;

export default async function EditThietKePage({ params }: { params: PageParams }) {
  const { id } = await params;
  const designId = Number.parseInt(id, 10);

  if (!Number.isInteger(designId) || designId <= 0) {
    notFound();
  }

  return <AdminEditDesignStudio designId={designId} />;
}
