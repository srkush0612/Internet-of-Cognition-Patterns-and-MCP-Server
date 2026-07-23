import Link from "next/link";
import { EvidenceSignal } from "./EvidenceSignal";
import { ReferenceDesignChip } from "./ReferenceDesignChip";
import { StatusBadge } from "./StatusBadge";
import { hasDesignReady } from "@/components/patterns/pattern-registry";
import type { Pattern } from "@/lib/patterns";

export function PatternCard({
  pattern,
  themed = false,
}: {
  pattern: Pattern;
  themed?: boolean;
}) {
  const designReady = hasDesignReady(pattern.slug);
  const href = themed
    ? `/gallery/patterns/${pattern.slug}`
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
        ) : null}
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
