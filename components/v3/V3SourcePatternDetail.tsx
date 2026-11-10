import Link from "next/link";
import type { SourcePattern } from "@/lib/v3/source-patterns";
import { getSourcePatternForV3Id, getV3IdForSourcePattern } from "@/lib/v3/source-patterns";
import { V3SourcePatternPreview } from "./V3SourcePatternPreview";
import { V3SourceCode } from "./V3SourceCode";

const VALUE_LABEL = { crit: "Critical", high: "High", med: "Medium", low: "Low" };

export function V3SourcePatternDetail({ pattern }: { pattern: SourcePattern }) {
  return (
    <main className="v3-source-detail">
      <header className="v3-source-detail__hero">
        <div className="v3-container">
          <nav className="v3-source-detail__crumb" aria-label="Breadcrumb">
            <Link href="/v3/patterns">Pattern library</Link>
            <span aria-hidden="true">/</span>
            <span>{pattern.name}</span>
          </nav>
          <p className="v3-eyebrow">{pattern.stage} · {pattern.cluster}</p>
          <h1>{pattern.name}</h1>
          <p className="v3-source-detail__summary">{pattern.oneline}</p>
          {pattern.value && <span className="v3-source-detail__value">{VALUE_LABEL[pattern.value]} user value</span>}
        </div>
      </header>

      <div className="v3-container v3-source-detail__body">
        <V3SourcePatternSections pattern={pattern} />
      </div>
    </main>
  );
}

export function V3SourcePatternSections({ pattern }: { pattern: SourcePattern }) {
  const questions = [
    { label: "What it is", value: pattern.what },
    { label: "Why it matters", value: pattern.why },
    { label: "When to use it", value: pattern.when },
    { label: "How to use it", value: pattern.how },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));
  const related = pattern.related.flatMap((sourceId) => {
    const v3Id = getV3IdForSourcePattern(sourceId);
    const source = v3Id ? getSourcePatternForV3Id(v3Id) : undefined;
    return v3Id && source ? [{ id: v3Id, name: source.name }] : [];
  });

  return (
    <>
        <section className="v3-source-detail__section" aria-labelledby="source-live-title">
          <h2 id="source-live-title">Live preview</h2>
          <p className="v3-source-detail__lede">See the pattern on its own before exploring where it appears in a product.</p>
          <V3SourcePatternPreview sourceId={pattern.id} name={pattern.name} view="live" />
        </section>

        {pattern.placements.length > 0 && (
          <section className="v3-source-detail__section" aria-labelledby="source-context-title">
            <h2 id="source-context-title">In context <span>{pattern.placements.length}</span></h2>
            <p className="v3-source-detail__lede">Explore the pattern inside different product surfaces. Use the arrows to move between examples.</p>
            <p className="v3-source-detail__mobile-hint">Swipe inside an example to see the full interface.</p>
            <V3SourcePatternPreview sourceId={pattern.id} name={pattern.name} view="context" />
          </section>
        )}

        {pattern.composed.length > 0 && (
          <section className="v3-source-detail__section" aria-labelledby="source-parts-title">
            <h2 id="source-parts-title">Interface parts</h2>
            <p className="v3-source-detail__lede">The pattern describes the interaction; these are the UI parts used to build it.</p>
            <ul className="v3-source-detail__parts">
              {pattern.composed.map((part) => <li key={part}>{part}</li>)}
            </ul>
          </section>
        )}

        {pattern.code && (
          <section className="v3-source-detail__section" aria-labelledby="source-code-title">
            <h2 id="source-code-title">Code shape</h2>
            <p className="v3-source-detail__lede">A starting structure to adapt to your product and framework.</p>
            <V3SourceCode code={pattern.code} />
          </section>
        )}

        {questions.length > 0 && (
          <section className="v3-source-detail__section" aria-labelledby="source-questions-title">
            <h2 id="source-questions-title">The four questions</h2>
            <div className="v3-source-detail__questions">
              {questions.map(({ label, value }) => (
                <div key={label}>
                  <h3>{label}</h3>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="v3-source-detail__section" aria-labelledby="source-related-title">
            <h2 id="source-related-title">Related patterns</h2>
            <div className="v3-source-detail__related">
              {related.map(({ id, name }) => <Link href={`/v3/patterns/${id}`} key={id}>{name} <span aria-hidden="true">↗</span></Link>)}
            </div>
          </section>
        )}
    </>
  );
}
