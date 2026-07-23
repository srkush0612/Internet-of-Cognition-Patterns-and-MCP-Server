import { StatusBadge } from "@/components/StatusBadge";
import { CredentialBoundary } from "@/components/patterns/CredentialBoundary";
import { CredentialBoundaryInbox } from "@/components/patterns/CredentialBoundary";
import { PresenceBoundary } from "@/components/patterns/PresenceBoundary";
import { PATTERN_TOKEN_GAPS } from "@/lib/design-tokens/pattern-token-gaps";
import { getPattern } from "@/lib/patterns";
import { GalleryCard } from "./GalleryCard";
import { GalleryPatternTabs } from "./GalleryPatternTabs";

const credentialPattern = getPattern("credential-boundary")!;

function GalleryTokenGaps() {
  return (
    <div className="gallery-token-gaps">
      {PATTERN_TOKEN_GAPS.map((gap) => (
        <div key={gap.id} className="gallery-token-gap">
          <div className="gallery-token-gap__row">
            <span className="gallery-token-gap__label">{gap.label}</span>
            <span
              className={`gallery-token-gap__badge gallery-token-gap__badge--${gap.severity}`}
            >
              {gap.severity}
            </span>
          </div>
          <p className="gallery-token-gap__detail">{gap.detail}</p>
          {gap.workaround ? (
            <p className="gallery-token-gap__workaround">{gap.workaround}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function GalleryPatternPages() {
  return (
    <>
      <h2 className="gallery-section-title">Pattern pages</h2>

      <div className="gallery-component-grid">
        <GalleryCard
          title="Token gaps"
          className="gallery-card--wide"
          note="Pattern UI needs not yet in theme-schema.json."
        >
          <GalleryTokenGaps />
        </GalleryCard>

        <GalleryCard
          title="Page header &amp; tabs"
          className="gallery-card--wide"
          note="Tabs use composed tokens only; no dedicated tab primitives in the library."
        >
          <div className="gallery-pattern-preview">
            <div className="gallery-pattern-preview__header detail-page-header">
              <div className="detail-page-header__badge">
                <StatusBadge pattern={credentialPattern} />
              </div>
              <h3 className="detail-page-header__title">
                {credentialPattern.title}
              </h3>
              <p className="detail-page-header__lead">
                {credentialPattern.oneliner}
              </p>
              <GalleryPatternTabs />
            </div>
          </div>
        </GalleryCard>

        <GalleryCard title="Credential Boundary" note="Standalone reference component.">
          <CredentialBoundary />
        </GalleryCard>

        <GalleryCard title="Presence Boundary" note="Standalone reference component.">
          <PresenceBoundary />
        </GalleryCard>

        <GalleryCard
          title="Credential Boundary · inbox embed"
          className="gallery-card--wide"
          note="Inbox shell + embedded compact card."
        >
          <CredentialBoundaryInbox />
        </GalleryCard>
      </div>
    </>
  );
}
