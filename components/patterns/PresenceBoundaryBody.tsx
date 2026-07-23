import {
  PRESENCE_DEMO,
  PRESENCE_TRACK,
  type PresenceTrackState,
} from "@/lib/presence-boundary";
import {
  ActivityOrb,
  EyeIcon,
  FilterIcon,
  LightningIcon,
  PauseIcon,
  WidenIcon,
} from "./icons";

export type PresenceBoundaryBodyProps = {
  state?: PresenceTrackState;
  duration?: string;
  description?: string;
  scopeBadge?: string;
  watching?: string;
  canActOn?: string;
  compact?: boolean;
};

export function PresenceBoundaryBody({
  state = PRESENCE_DEMO.state,
  duration = PRESENCE_DEMO.duration,
  description = PRESENCE_DEMO.description,
  scopeBadge = PRESENCE_DEMO.scopeBadge,
  watching = PRESENCE_DEMO.watching,
  canActOn = PRESENCE_DEMO.canActOn,
  compact = false,
}: PresenceBoundaryBodyProps) {
  const activeIndex = PRESENCE_TRACK.indexOf(state);
  const orbSize = compact ? 32 : 40;

  return (
    <div
      className={
        compact ? "presence-boundary presence-boundary--compact" : "presence-boundary"
      }
    >
      <div className="presence-boundary__status">
        <ActivityOrb size={orbSize} pulse={state === "Working" || state === "Acting"} />
        <div className="presence-boundary__status-copy">
          <p className="presence-boundary__status-line">
            <strong className="presence-boundary__state">{state}</strong>
            <span className="presence-boundary__duration"> for {duration}</span>
          </p>
          <p className="presence-boundary__description">{description}</p>
        </div>
      </div>

      <section className="presence-boundary__section" aria-label="Presence states">
        <p className="presence-boundary__label">Presence</p>
        <div className="presence-track" role="tablist" aria-label="Agent presence">
          {PRESENCE_TRACK.map((trackState, index) => {
            const active = index === activeIndex;
            return (
              <div
                key={trackState}
                className={`presence-track__item${active ? " presence-track__item--active" : ""}`}
                role="tab"
                aria-selected={active}
              >
                <span className="presence-track__bar" aria-hidden />
                <span className="presence-track__label">{trackState}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="presence-boundary__section" aria-label="Agent scope">
        <div className="presence-boundary__scope-header">
          <p className="presence-boundary__label">Scope</p>
          <span className="presence-boundary__scope-badge">{scopeBadge}</span>
        </div>
        <div className="presence-boundary__scope-panel">
          <div className="presence-boundary__scope-row">
            <span className="presence-boundary__scope-row-label">
              <EyeIcon size={compact ? 12 : 14} />
              Watching
            </span>
            <span className="presence-boundary__scope-row-value">{watching}</span>
          </div>
          <div className="presence-boundary__scope-row">
            <span className="presence-boundary__scope-row-label">
              <LightningIcon size={compact ? 12 : 14} />
              Can act on
            </span>
            <span className="presence-boundary__scope-row-value">{canActOn}</span>
          </div>
        </div>
      </section>

      <div className="presence-boundary__actions">
        <button type="button" className="presence-boundary__btn presence-boundary__btn--pause">
          <PauseIcon />
          Pause
        </button>
        <button
          type="button"
          className="presence-boundary__btn presence-boundary__btn--narrow"
        >
          <FilterIcon />
          Narrow scope
        </button>
        <button
          type="button"
          className="presence-boundary__btn presence-boundary__btn--widen"
          disabled
        >
          <WidenIcon />
          Widen
        </button>
      </div>
    </div>
  );
}
