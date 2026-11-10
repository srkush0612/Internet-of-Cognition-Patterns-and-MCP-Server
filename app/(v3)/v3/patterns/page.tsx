import type { Metadata } from "next";
import { V3Header } from "@/components/v3/V3Header";
import { V3Footer } from "@/components/v3/V3Footer";
import { V3PatternBrowser } from "@/components/v3/V3PatternBrowser";
import { getV3Patterns } from "@/lib/v3/catalog";
import { getSourcePatternForV3Id } from "@/lib/v3/source-patterns";

export const metadata: Metadata = {
  title: "The pattern library — HAX",
  description: "Explore agentic patterns by participant dimension, or browse the full HAX pattern library.",
};

export default function V3PatternsPage() {
  const patterns = getV3Patterns().map((pattern) => {
    if (pattern.category !== "general") return pattern;
    const source = getSourcePatternForV3Id(pattern.id);
    if (!source) throw new Error(`Missing authored source for ${pattern.id}`);
    return { ...pattern, name: source.name, summary: source.oneline };
  });
  return (
    <div className="v3">
      <V3Header />
      <main>
        <section className="v3-section v3-section--patterns-head">
          <div className="v3-container">
            <p className="v3-eyebrow">The pattern library</p>
            <h1 className="v3-patterns-title">Find the right pattern.</h1>
            <p className="v3-patterns-intro">Explore patterns for what agents do and how people experience it. Browse agentic patterns by who is involved, or search the full library.</p>
          </div>
        </section>
        <V3PatternBrowser patterns={patterns} />
      </main>
      <V3Footer />
    </div>
  );
}
