import { CircleCheck, Eye, Shield, Split } from "lucide-react";
import type { CSSProperties } from "react";
import {
  IOC_COLOR,
  PATTERN_CATEGORY_COLOR,
  REASONING_MODE_DEFINITIONS,
  REASONING_MODE_LABEL,
  type BackingStrength,
  type Pattern,
  type PatternCategory,
  type ReasoningMode,
} from "@/lib/patterns";

/**
 * The taxonomy's shared visual vocabulary, used by the gallery, the pattern
 * detail pages and the homepage so one pattern looks the same wherever it is
 * shown. Category reads as colour and icon; reasoning reads as a mark before
 * the label; evidence reads as four bars. Nothing here is decorative — each
 * carries a value that comes from lib/patterns.ts.
 */

/** Evidence steps, used for the bars and for ordering within a group. */
export const EVIDENCE_STEPS: Record<BackingStrength, number> = {
  Strong: 4,
  Moderate: 3,
  Thin: 2,
  None: 1,
};

export const CATEGORY_ICON: Record<PatternCategory, typeof Shield> = {
  Autonomy: Shield,
  Legibility: Split,
  Commitment: CircleCheck,
  Reporting: Eye,
};

export const REASONING_COLOR: Record<ReasoningMode, string> = {
  ioc: IOC_COLOR,
  "non-ioc": "var(--color-text-muted)",
};

export function evidenceSteps(pattern: Pattern): number {
  return EVIDENCE_STEPS[pattern.backingStrength ?? "None"];
}

/** Best-evidenced first, then alphabetical: a stable, explainable order. */
export function byEvidence(items: Pattern[]): Pattern[] {
  return [...items].sort(
    (a, b) => evidenceSteps(b) - evidenceSteps(a) || a.title.localeCompare(b.title),
  );
}

export function CategoryIcon({ category }: { category: PatternCategory }) {
  const Icon = CATEGORY_ICON[category];
  return <Icon aria-hidden strokeWidth={2} />;
}

export function CategoryLabel({
  category,
  withIcon = true,
  className = "",
}: {
  category: PatternCategory;
  withIcon?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`osh-face-cat ${className}`}
      style={{ "--c": PATTERN_CATEGORY_COLOR[category] } as CSSProperties}
    >
      {withIcon ? <CategoryIcon category={category} /> : null}
      {category}
    </span>
  );
}

/**
 * IoC and non-IoC are told apart by the mark before the label — a turning
 * gradient dot against a still grey one — not by colour alone, so the
 * distinction survives grayscale and colourblind readers.
 */
export function ReasoningTag({ reasoning }: { reasoning: ReasoningMode }) {
  const isIoc = reasoning === "ioc";
  return (
    <span
      className={`osh-tag-reason ${isIoc ? "osh-tag-reason--ioc" : "osh-tag-reason--non"}`}
      title={REASONING_MODE_DEFINITIONS[reasoning]}
    >
      {REASONING_MODE_LABEL[reasoning]}
    </span>
  );
}

export function EvidenceBars({ pattern }: { pattern: Pattern }) {
  const filled = evidenceSteps(pattern);
  return (
    <span className="osh-bars" aria-hidden>
      {[1, 2, 3, 4].map((step) => (
        <i key={step} data-on={step <= filled} />
      ))}
    </span>
  );
}

/** Backing strength with its bars. Readiness is a separate badge, on purpose. */
export function BackingSignal({ pattern }: { pattern: Pattern }) {
  return (
    <span className="osh-evidence">
      <EvidenceBars pattern={pattern} />
      {pattern.backingStrength ?? "None"}
    </span>
  );
}

/** The library's own fact chips, joined. Null when the library has none. */
export function factsLine(pattern: Pattern): string | null {
  if (!pattern.factChips?.length) return null;
  return pattern.factChips.join(" · ");
}

/** The animated gradient and drifting orbs every page header shares. */
export function HeroOrbs() {
  return (
    <>
      <div className="osh-orb osh-orb--a" aria-hidden />
      <div className="osh-orb osh-orb--b" aria-hidden />
      <div className="osh-orb osh-orb--c" aria-hidden />
    </>
  );
}
