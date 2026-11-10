import type { Metadata } from "next";
import Link from "next/link";
import { V3Header } from "@/components/v3/V3Header";
import { V3Footer } from "@/components/v3/V3Footer";

export const metadata: Metadata = {
  title: "How we built this — HAX",
  description: "How HAX connects observed interactions, authored patterns, guiding principles, and interface previews.",
};

export default function V3MethodologyPage() {
  return (
    <div className="v3">
      <V3Header />
      <main className="v3-info">
        <div className="v3-container">
          <nav className="v3-info__crumb" aria-label="Breadcrumb"><Link href="/v3">Home</Link><span>/</span>How we built this</nav>
          <p className="v3-eyebrow">Method</p>
          <h1>How we built this.</h1>
          <p className="v3-info__lede">HAX starts with recurring interaction needs, names the behavior as a pattern, then shows how that pattern appears where people and agents work.</p>

          <section className="v3-info__section">
            <h2>Observe, name, specify</h2>
            <p>The catalog brings together research-grounded interaction patterns and their interface components. Related entries are combined into one pattern when they describe the same behavior. Each HAX pattern has an authored behavior spec that names its trigger, mode, audience, participant dimension, channel, and expected response.</p>
          </section>

          <section className="v3-info__section">
            <h2>Preserve the verified patterns</h2>
            <p>The 23 verified HAX pattern pages keep their original copy, participant details, behavior facts, and interactive examples in this version. The guiding principles explain why each pattern matters; the preview theme changes its visual treatment without changing its behavior.</p>
          </section>

          <section className="v3-info__section">
            <h2>Show the wider map</h2>
            <p>The library also places the HAX patterns alongside the broader AI-UX catalog. Those entries help locate an interaction in the journey; they do not replace the authored HAX pattern pages.</p>
          </section>

          <Link href="/v3/patterns" className="v3-action v3-action-primary">Explore patterns</Link>
        </div>
      </main>
      <V3Footer />
    </div>
  );
}
