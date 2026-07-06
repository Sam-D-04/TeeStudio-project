import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

export default function ExplorePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <AppHeader />
      <div style={{ paddingTop: 64 }}>
        <div className="container-main" style={{ padding: "40px 0" }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Khám phá cộng đồng</h1>
          <p style={{ color: "#475569", marginBottom: 32 }}>Khám phá các thiết kế sáng tạo nhất từ cộng đồng TeeStudio.</p>
          
          <div style={{ padding: "60px 0", textAlign: "center", background: "#fff", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
            <p style={{ color: "#94a3b8" }}>Tính năng đang được phát triển...</p>
          </div>
        </div>
        <AppFooter />
      </div>
    </main>
  );
}
