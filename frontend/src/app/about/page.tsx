import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <AppHeader />
      <div style={{ paddingTop: 64 }}>
        <div className="container-main" style={{ padding: "40px 0" }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Về chúng tôi</h1>
          <p style={{ color: "#475569", marginBottom: 32 }}>Câu chuyện của TeeStudio - Tự do sáng tạo trên từng sợi vải.</p>
          
          <div style={{ padding: "60px 0", textAlign: "center", background: "#fff", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
            <p style={{ color: "#94a3b8" }}>Tính năng đang được phát triển...</p>
          </div>
        </div>
        <AppFooter />
      </div>
    </main>
  );
}
