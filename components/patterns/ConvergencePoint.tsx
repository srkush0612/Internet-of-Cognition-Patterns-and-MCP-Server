import { PatternComponentCard } from "./PatternComponentCard";
import { ConvergenceTimeline } from "./ConvergenceTimeline";
import { PatternInboxShell } from "./PatternInboxShell";
import { PresenceIcon } from "./icons";

export function ConvergencePoint({ compact = false }: { compact?: boolean }) {
  return (
    <div className="convergence-point-wide">
      <PatternComponentCard
        patternKey="ConvergencePoint"
        dotColor="#23A06B"
        title="Agent convergence timeline"
        contextLabel="Mission room · Mythos Corp routing"
        icon={<PresenceIcon size={compact ? 15 : 18} />}
        footerLeft="Four streams · merge and pinch points"
        footerRight="live"
        compact={compact}
      >
        <ConvergenceTimeline compact={compact} />
      </PatternComponentCard>
    </div>
  );
}

const CONVERGENCE_INBOX_AGENTS = [
  {
    name: "Prometheus",
    preview: "Hybrid topology agreed at 13:45",
    timestamp: "2m ago",
    status: "active" as const,
  },
  {
    name: "Themis",
    preview: "Failover path still diverged",
    timestamp: "just now",
    status: "alert" as const,
  },
  {
    name: "Athena",
    preview: "Vendor scope pending your call",
    timestamp: "1m ago",
    status: "waiting" as const,
  },
];

const CONVERGENCE_INBOX_MESSAGE =
  "Two decisions are still open on the timeline. Prometheus and Hermes lean Osaka for failover; Themis and Athena want in-region redundancy. Vendor scope is split the other way. The view shows where agents converged and where they are still negotiating.";

export function ConvergencePointInContext() {
  return (
    <PatternInboxShell
      agents={CONVERGENCE_INBOX_AGENTS}
      activeAgentName="Themis"
      message={CONVERGENCE_INBOX_MESSAGE}
    >
      <ConvergencePoint />
    </PatternInboxShell>
  );
}
