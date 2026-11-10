import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { V3Header } from "@/components/v3/V3Header";
import { V3Footer } from "@/components/v3/V3Footer";
import { HAX_PRINCIPLES } from "@/lib/v2/principles";
import { getPatternsForPrinciple } from "@/lib/v3/principle-catalog";

export function generateStaticParams() {
  return HAX_PRINCIPLES.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const principle = HAX_PRINCIPLES.find((entry) => entry.id === id);
  if (!principle) return { title: "Principle not found — HAX" };
  return { title: `${principle.name} — HAX principles`, description: principle.description };
}

export default async function PrinciplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principle = HAX_PRINCIPLES.find((entry) => entry.id === id);
  if (!principle) notFound();

  const related = getPatternsForPrinciple(principle.id);
  const number = HAX_PRINCIPLES.findIndex((entry) => entry.id === id) + 1;

  return (
    <div className="v3">
      <V3Header />
      <main className="v3-principle-page">
        <header className="v3-principle-page-hero">
          <div className="v3-container">
            <nav className="v3-principle-breadcrumb" aria-label="Breadcrumb">
              <Link href="/v3#principles">Guiding principles</Link>
              <span aria-hidden="true">/</span>
              <span>{principle.name}</span>
            </nav>
            <p className="v3-eyebrow">Principle {String(number).padStart(2, "0")} / 05</p>
            <h1>{principle.name}</h1>
            <p className="v3-principle-page-lede">{principle.description}</p>
          </div>
        </header>

        <section className="v3-principle-page-context" aria-label={`About ${principle.name}`}>
          <div className="v3-container v3-principle-page-context-grid">
            <div>
              <h2>What it means</h2>
              <p>{principle.meaning}</p>
            </div>
            <div>
              <h2>Why it matters</h2>
              <p>{principle.whyItMatters}</p>
            </div>
          </div>
        </section>

        <section className="v3-principle-page-patterns" aria-labelledby="principle-patterns-title">
          <div className="v3-container">
            <div className="v3-section-heading">
              <h2 id="principle-patterns-title">Patterns that put {principle.name.toLowerCase()} into practice</h2>
              <p>{related.length} catalog patterns connect to this principle. Some make it their main focus; others support it alongside another principle.</p>
            </div>
            <div className="v3-principle-pattern-list">
              {related.map(({ pattern, relation, why }) => (
                <article className="v3-principle-pattern" key={pattern.id}>
                  <div className="v3-principle-pattern-main">
                    <div className="v3-principle-pattern-meta">
                      <span>{relation}</span>
                      {!pattern.contentReady && <span>Coming soon</span>}
                    </div>
                    <h3><Link href={`/v3/patterns/${pattern.id}`}>{pattern.name} <span aria-hidden="true">↗</span></Link></h3>
                    <p>{pattern.summary}</p>
                  </div>
                  <div className="v3-principle-pattern-connection">
                    <span>How it supports {principle.name.toLowerCase()}</span>
                    <p>{why}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <nav className="v3-principle-page-other" aria-label="Other HAX principles">
          <div className="v3-container">
            <h2>Explore the other principles</h2>
            <div>
              {HAX_PRINCIPLES.filter((entry) => entry.id !== id).map((entry) => (
                <Link href={`/v3/principles/${entry.id}`} key={entry.id}>{entry.name} <span aria-hidden="true">↗</span></Link>
              ))}
            </div>
          </div>
        </nav>
      </main>
      <V3Footer />
    </div>
  );
}
