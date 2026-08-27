import { Breadcrumb } from "@/components/Breadcrumb";
import { GalleryShowcase } from "@/components/gallery/GalleryShowcase";
import { GalleryPatternPages } from "@/components/gallery/GalleryPatternPages";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { PatternGrid } from "@/components/PatternGrid";
import { SiteNav } from "@/components/SiteNav";
import "./gallery.css";

export const metadata = {
  title: "Design System · Pattern Library",
  description: "Token-driven components and themes for the pattern library",
};

export default function GalleryPage() {
  return (
    <div className="app-shell gallery-page">
      <header className="app-header gallery-page__header">
        <div className="app-header__inner">
          <div className="app-header__row">
            <Breadcrumb
              items={[
                { label: "Pattern Library", href: "/" },
                { label: "Design system" },
              ]}
            />
            <div className="gallery-toolbar">
              <ThemeSwitcher />
              <SiteNav />
            </div>
          </div>
          <h1 className="app-title">Token design system</h1>
          <p className="app-lead">
            Switch themes to preview pattern cards, pattern pages, and reference
            components across midnight, slate, signal, glass, and mono.
          </p>
        </div>
      </header>

      <main className="app-main">
        <section className="gallery-patterns" aria-labelledby="gallery-patterns-heading">
          <h2 className="gallery-section-title" id="gallery-patterns-heading">
            Pattern cards
          </h2>
          <PatternGrid themed />
        </section>

        <GalleryPatternPages />

        <GalleryShowcase />
      </main>
    </div>
  );
}
