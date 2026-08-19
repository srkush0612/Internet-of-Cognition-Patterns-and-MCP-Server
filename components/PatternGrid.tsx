import { PatternCard } from "@/components/PatternCard";
import { PATTERN_READY_SLUGS } from "@/components/patterns/pattern-registry";
import { getPattern, patternsSortedByEvidence, type Pattern } from "@/lib/patterns";

function byTitle(a: Pattern, b: Pattern) {
  return a.title.localeCompare(b.title);
}

export function PatternGrid({ themed = false }: { themed?: boolean }) {
  const readySet = new Set<string>(PATTERN_READY_SLUGS);
  const ready = PATTERN_READY_SLUGS.map((slug) => getPattern(slug))
    .filter((pattern) => pattern !== undefined)
    .sort(byTitle);
  const pending = patternsSortedByEvidence()
    .filter((pattern) => !readySet.has(pattern.slug))
    .sort(byTitle);

  const gridClass = themed
    ? "pattern-grid pattern-grid--themed"
    : "pattern-grid";

  return (
    <div className="pattern-grid-layout">
      <section
        className="pattern-grid-section"
        aria-labelledby="pattern-grid-ready-heading"
      >
        <h2 className="pattern-grid-section__title" id="pattern-grid-ready-heading">
          Ready
        </h2>
        <div className={gridClass}>
          {ready.map((pattern) => (
            <PatternCard key={pattern.slug} pattern={pattern} themed={themed} />
          ))}
        </div>
      </section>

      <div className="pattern-grid-divider" role="separator" aria-hidden />

      <section
        className="pattern-grid-section"
        aria-labelledby="pattern-grid-pending-heading"
      >
        <h2
          className="pattern-grid-section__title pattern-grid-section__title--pending"
          id="pattern-grid-pending-heading"
        >
          Coming soon
        </h2>
        <div className={gridClass}>
          {pending.map((pattern) => (
            <PatternCard key={pattern.slug} pattern={pattern} themed={themed} />
          ))}
        </div>
      </section>
    </div>
  );
}
