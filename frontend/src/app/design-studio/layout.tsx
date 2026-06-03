import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Công cụ Thiết kế – TeeStudio",
  description:
    "Tự tay thiết kế áo thun, áo polo, hoodie trực tuyến với công cụ thiết kế kéo thả của TeeStudio.",
};

export default function DesignStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
