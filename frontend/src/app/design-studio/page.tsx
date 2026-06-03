"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Konva requires `window`, so we must disable SSR
const DesignStudioApp = dynamic(
  () => import("@/components/design-studio/DesignStudioApp"),
  { ssr: false }
);

export default function DesignStudioPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0f172a", height: "100vh" }} />}>
      <DesignStudioApp />
    </Suspense>
  );
}
