import AppHeader         from "@/components/layout/AppHeader";
import AppFooter         from "@/components/layout/AppFooter";
import ProductCategories from "@/components/home/ProductCategories";
import SimpleWorkflow    from "@/components/home/SimpleWorkflow";
import ProductShowcase   from "@/components/home/ProductShowcase";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <AppHeader />

      {/* Main content offset for fixed header */}
      <div style={{ paddingTop: 64 }}>
        <ProductCategories />
        <SimpleWorkflow />
        <ProductShowcase />
        <AppFooter />
      </div>
    </main>
  );
}
