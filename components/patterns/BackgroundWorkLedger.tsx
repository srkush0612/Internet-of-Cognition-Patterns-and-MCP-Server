import { PatternComponentCard } from "./PatternComponentCard";
import { PatternInboxShell } from "./PatternInboxShell";
import { EyeIcon } from "./icons";

type LedgerKind = "queried" | "assumed" | "acted" | "result";

type LedgerEntry = {
  time: string;
  kind: LedgerKind;
  text: string;
  meta?: string;
};

const LEDGER_ENTRIES: LedgerEntry[] = [
  {
    time: "09:14",
    kind: "queried",
    text: "Pulled 5xx logs for edge-router-7",
    meta: "tool · Loki",
  },
  {
    time: "09:16",
    kind: "assumed",
    text: "Treated the error spike as a cache miss, not a config regression",
  },
  {
    time: "09:18",
    kind: "acted",
    text: "Opened a rollback PR draft to firmware 4.11",
    meta: "PR #4821 · draft",
  },
  {
    time: "09:21",
    kind: "result",
    text: "Staging health checks passed on the rollback build",
  },
];

const KIND_LABEL: Record<LedgerKind, string> = {
  queried: "Queried",
  assumed: "Assumed",
  acted: "Acted",
  result: "Result",
};

function LedgerBody({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`work-ledger${compact ? " work-ledger--compact" : ""}`}>
      <div className="work-ledger__summary">
        <span className="work-ledger__summary-strong">4 steps</span> while you
        were away · 7 min · 1 open question
      </div>

      <ol className="work-ledger__timeline">
        {LEDGER_ENTRIES.map((entry) => (
          <li key={entry.time} className="work-ledger__entry">
            <span className="work-ledger__time">{entry.time}</span>
            <span
              className={`work-ledger__kind work-ledger__kind--${entry.kind}`}
            >
              {KIND_LABEL[entry.kind]}
            </span>
            <div className="work-ledger__entry-body">
              <p className="work-ledger__text">{entry.text}</p>
              {entry.meta ? (
                <span className="work-ledger__meta">{entry.meta}</span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <div className="work-ledger__open">
        <span className="work-ledger__open-label">Open question</span>
        <p className="work-ledger__open-text">
          Confirm the owning team for edge-router-7 before this rollback merges
          to prod?
        </p>
      </div>

      <div className="work-ledger__actions">
        <button type="button" className="work-ledger__btn work-ledger__btn--primary">
          Approve all
        </button>
        <button type="button" className="work-ledger__btn">
          Undo a step
        </button>
        <button type="button" className="work-ledger__btn work-ledger__btn--ghost">
          Answer question
        </button>
      </div>
    </div>
  );
}

export function BackgroundWorkLedger({ compact = false }: { compact?: boolean }) {
  return (
    <PatternComponentCard
      patternKey="BackgroundWorkLedger"
      dotColor="#3b5ec6"
      title="What happened while you were away"
      contextLabel="Rollback agent"
      icon={<EyeIcon size={compact ? 15 : 18} />}
      footerLeft="Nothing merged to prod yet · your review needed"
      footerRight="synced 1m ago"
      compact={compact}
    >
      <LedgerBody compact={compact} />
    </PatternComponentCard>
  );
}

const LEDGER_INBOX_AGENTS = [
  {
    name: "Rollback agent",
    preview: "4 steps done while you were away…",
    timestamp: "1m ago",
    status: "active" as const,
  },
  {
    name: "Triage agent",
    preview: "Correlated the alert to firmware 4.12",
    timestamp: "9m ago",
    status: "waiting" as const,
  },
  {
    name: "Telemetry agent",
    preview: "Watching error rate on edge-router-7",
    timestamp: "12m ago",
    status: "waiting" as const,
  },
];

const LEDGER_INBOX_MESSAGE =
  "You were away for 7 minutes. Here is everything I did on the edge-router-7 incident, including one assumption I made and the one question I still need you to answer. Nothing has merged to prod.";

export function BackgroundWorkLedgerInbox() {
  return (
    <PatternInboxShell
      agents={LEDGER_INBOX_AGENTS}
      activeAgentName="Rollback agent"
      message={LEDGER_INBOX_MESSAGE}
    >
      <BackgroundWorkLedger compact />
    </PatternInboxShell>
  );
}
