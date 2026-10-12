import { Suspense } from "react";
import { HeroOrbs } from "@/components/PatternTaxonomy";
import { CatalogBrowser } from "@/components/v2/CatalogBrowser";

export const metadata = {
  title: "Catalog, HAX 2.0 v2",
  description:
    "23 interaction patterns, deduplicated from 17 research patterns and 16 SDK components.",
};

export default function CatalogPage() {
  return (
    <main>
      {/* The same gradient hero the v1 gallery landing uses. */}
      <header className="osh-hero">
        <HeroOrbs />
        <div className="osh-container py-10 sm:py-12">
          <p className="v2-eyebrow">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            23 interaction patterns
          </h1>
          <p className="v2-lede mt-3">
            How agents signal, explain, ask and agree, with people, and with
            each other.
          </p>
        </div>
      </header>

      <div className="osh-container pb-16">
        {/* The browser reads the mode/level query string the homepage links
            carry, which a statically rendered page has to suspend on. */}
        <Suspense fallback={<p className="pt-8 text-sm text-muted">Loading…</p>}>
          <CatalogBrowser />
        </Suspense>
      </div>
    </main>
  );
}
