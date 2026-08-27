import Link from "next/link";
import { EvidenceSignal } from "./EvidenceSignal";
import { ReferenceDesignChip } from "./ReferenceDesignChip";
import { StatusBadge } from "./StatusBadge";
import { hasDesignReady } from "@/components/patterns/pattern-registry";
import type { Pattern } from "@/lib/patterns";
import { getPatternReadyCompanionTags } from "@/lib/pattern-ready";

export function PatternCard({
  pattern,
  themed = false,
}: {
  pattern: Pattern;
  themed?: boolean;
}) {
  const designReady = hasDesignReady(pattern.slug);
  const companionTags = designReady
    ? getPatternReadyCompanionTags(pattern.slug)
    : [];
  const href = themed
    ? `/design-system/patterns/${pattern.slug}`
    : `/patterns/${pattern.slug}`;

  return (
    <Link
      href={href}
      className={themed ? "token-card token-card--themed" : "token-card"}
    >
      <div className="token-card__meta">
        {designReady ? (
          <span className="token-card__ready-tag" aria-label="Design ready">
            <span className="token-card__ready-dot" aria-hidden />
            Ready
          </span>
        ) : (
          <span className="token-card__pending-tag" aria-label="Coming soon">
            Coming soon
          </span>
        )}
        {companionTags.map((tag) => (
          <span key={tag} className="token-card__companion-tag">
            {tag}
          </span>
        ))}
        <StatusBadge pattern={pattern} />
        {pattern.hasReferenceDesign ? <ReferenceDesignChip /> : null}
      </div>
      <h3 className="token-card__title">{pattern.title}</h3>
      <p className="token-card__body">{pattern.oneliner}</p>
      <div className="token-card__footer">
        <EvidenceSignal pattern={pattern} />
      </div>
    </Link>
  );
}
