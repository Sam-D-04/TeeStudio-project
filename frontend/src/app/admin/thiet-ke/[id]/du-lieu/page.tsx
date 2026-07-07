import type { Metadata } from "next";
import DesignDataWorkspace from "@/components/admin/designs/DesignDataWorkspace";

export const metadata: Metadata = {
  title: "Dữ liệu thiết kế - TeeStudio Quản trị",
  description: "Workspace chỉ đọc để kiểm tra dữ liệu nguồn của thiết kế.",
};

export default function AdminDesignDataRoute() {
  return <DesignDataWorkspace />;
}
