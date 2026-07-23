import { PatternComponentCard } from "./PatternComponentCard";
import { PresenceBoundaryBody } from "./PresenceBoundaryBody";
import { StarIcon } from "./icons";

const HAX_GREEN = "#16a34a";

export function PresenceBoundary({
  compact = false,
  variant = "standalone",
}: {
  compact?: boolean;
  variant?: "standalone" | "inbox";
}) {
  const isInbox = variant === "inbox";

  return (
    <PatternComponentCard
      patternKey="PresenceBoundary"
      labelPrefix="HAX"
      dotColor={HAX_GREEN}
      showLabelBar={!isInbox}
      title={isInbox ? "Agent presence" : "Presence Boundary"}
      contextLabel={isInbox ? "edge-router-7 rollback" : "Rollback agent"}
      icon={<StarIcon size={compact ? 15 : 18} />}
      footerLeft={
        <>
          Boundary set by you · acting needs{" "}
          <span className="presence-boundary__footer-link">review</span>
        </>
      }
      footerRight="changed just now"
      compact={compact}
    >
      <PresenceBoundaryBody compact={compact} />
    </PatternComponentCard>
  );
}

export function PresenceBoundaryInbox() {
  return <PresenceInboxDemo />;
}

function PresenceInboxDemo() {
  return (
    <div className="presence-inbox">
      <header className="presence-inbox__titlebar">
        Agent Inbox · Network ops / edge-router-7 rollback
      </header>

      <div className="presence-inbox__layout">
        <aside className="presence-inbox__sidebar" aria-label="Agents">
          <p className="presence-inbox__sidebar-label">Agents</p>
          <PresenceInboxAgent
            name="Rollback agent"
            preview="Drafted a rollback plan…"
            time="now"
            active
            status="working"
          />
          <PresenceInboxAgent
            name="Triage agent"
            preview="Observing change-ticke…"
            time="2m"
            status="working"
          />
          <PresenceInboxAgent
            name="Telemetry agent"
            preview="Waiting on metrics wind…"
            time="8m"
            status="waiting"
          />
        </aside>

        <div className="presence-inbox__main">
          <div className="presence-inbox__bubble">
            <span className="presence-inbox__bubble-label">Rollback Agent</span>
            <p className="presence-inbox__bubble-text">
              I have drafted a rollback plan for edge-router-7. Here is my current
              presence and the boundary I am working within. You can steer me right
              from the card.
            </p>
          </div>

          <div className="presence-inbox__embedded">
            <PresenceBoundary compact variant="inbox" />
          </div>

          <div className="presence-inbox__bubble presence-inbox__bubble--user">
            <p className="presence-inbox__bubble-text">
              Good. Narrow your scope to just edge-router-7, then hold for my
              approval.
            </p>
          </div>

          <div className="presence-inbox__bubble">
            <span className="presence-inbox__bubble-label">Rollback Agent</span>
            <p className="presence-inbox__bubble-text">
              Scope narrowed to edge-router-7 only. I will hold before any acting
              step and wait for your approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PresenceInboxAgent({
  name,
  preview,
  time,
  active = false,
  status,
}: {
  name: string;
  preview: string;
  time: string;
  active?: boolean;
  status: "working" | "waiting";
}) {
  return (
    <div
      className={`presence-inbox__agent${active ? " presence-inbox__agent--active" : ""}`}
    >
      <div className="presence-inbox__agent-row">
        <StarIcon size={12} />
        <span
          className={`presence-inbox__agent-dot presence-inbox__agent-dot--${status}`}
          aria-hidden
        />
        <span className="presence-inbox__agent-name">{name}</span>
        <span className="presence-inbox__agent-time">{time}</span>
      </div>
      <p className="presence-inbox__agent-preview">{preview}</p>
    </div>
  );
}
