"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TaiKhoanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tai-khoan/ho-so");
  }, [router]);

  return null;
}
