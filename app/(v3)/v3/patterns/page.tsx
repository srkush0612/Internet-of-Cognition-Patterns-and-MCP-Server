import type { Metadata } from "next";
import { V3Header } from "@/components/v3/V3Header";
import { V3Footer } from "@/components/v3/V3Footer";
import { V3PatternBrowser } from "@/components/v3/V3PatternBrowser";
import { getV3Patterns } from "@/lib/v3/catalog";

export const metadata: Metadata = {
  title: "The pattern library — HAX",
  description:
    "Browse HAX's agent-coordination patterns and the broader AI-UX pattern map together.",
};

export default function V3PatternsPage() {
  const patterns = getV3Patterns();
  return (
    <div className="v3">
      <V3Header />
      <main>
        <section className="v3-section v3-section--patterns-head">
          <div className="v3-container">
            <p className="v3-eyebrow">The pattern library</p>
            <h1 className="v3-patterns-title">
              Patterns for agentic systems, and the AI-UX map around them.
            </h1>
            <p className="v3-patterns-lede">
              HAX authors the patterns for how agents ask, coordinate, and
              involve people. The broader map carries the rest of the AI-UX
              surface, so a team working in both can find each one in the
              same place.
            </p>
          </div>
        </section>
        <V3PatternBrowser patterns={patterns} />
      </main>
      <V3Footer />
    </div>
  );
}
