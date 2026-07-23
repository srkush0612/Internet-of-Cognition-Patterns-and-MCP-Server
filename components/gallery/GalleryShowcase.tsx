import { GalleryAlerts } from "./GalleryAlert";
import { GalleryBadge } from "./GalleryBadge";
import { GalleryButton } from "./GalleryButton";
import { GalleryCard } from "./GalleryCard";
import { GalleryFields } from "./GalleryFields";
import { GalleryProgress } from "./GalleryProgress";
import { GalleryTableRow } from "./GalleryTableRow";
import { GalleryTag } from "./GalleryTag";

export function GalleryShowcase() {
  return (
    <>
      <h2 className="gallery-section-title">Primitives</h2>
      <div className="gallery-component-grid">
        <GalleryCard
          title="Fields & inputs"
          className="gallery-card--wide"
          note="All standard HTML field types; custom select is included alongside native select."
        >
          <GalleryFields />
        </GalleryCard>

        <GalleryCard title="Buttons">
          <div className="gallery-component-row">
            <GalleryButton variant="primary">Primary action</GalleryButton>
            <GalleryButton variant="secondary">Secondary</GalleryButton>
          </div>
        </GalleryCard>

        <GalleryCard title="Badges">
          <div className="gallery-component-row">
            <GalleryBadge variant="accent">Accent</GalleryBadge>
            <GalleryBadge variant="success">Success</GalleryBadge>
            <GalleryBadge variant="danger">Danger</GalleryBadge>
          </div>
        </GalleryCard>

        <GalleryCard
          title="Alerts"
          note="Warning variant uses --color-warning token."
        >
          <GalleryAlerts />
        </GalleryCard>

        <GalleryCard title="Progress">
          <GalleryProgress target={68} />
        </GalleryCard>

        <GalleryCard title="Table row">
          <GalleryTableRow />
        </GalleryCard>

        <GalleryCard title="Tags">
          <GalleryTag />
        </GalleryCard>
      </div>
    </>
  );
}
