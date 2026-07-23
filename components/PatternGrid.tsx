import { PatternCard } from "@/components/PatternCard";
import { patternsSortedByEvidence } from "@/lib/patterns";

export function PatternGrid({ themed = false }: { themed?: boolean }) {
  const sorted = patternsSortedByEvidence();

  return (
    <div className={themed ? "pattern-grid pattern-grid--themed" : "pattern-grid"}>
      {sorted.map((pattern) => (
        <PatternCard key={pattern.slug} pattern={pattern} themed={themed} />
      ))}
    </div>
  );
}
