import AppHeader         from "@/components/layout/AppHeader";
import AppFooter         from "@/components/layout/AppFooter";
import HeroParallax      from "@/components/home/HeroParallax";
import ProductCategories from "@/components/home/ProductCategories";
import SimpleWorkflow    from "@/components/home/SimpleWorkflow";
import ProductShowcase   from "@/components/home/ProductShowcase";

export default function HomePage() {
  return (
    <main className="mesh-gradient-bg" style={{ minHeight: "100vh" }}>
      <AppHeader />

      {/* Main content offset for fixed header */}
      <div style={{ paddingTop: 64 }}>
        <HeroParallax />
        <ProductCategories />
        <SimpleWorkflow />
        <ProductShowcase />
        <AppFooter />
      </div>
    </main>
  );
}
