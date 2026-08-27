import { PatternComponentCard } from "./PatternComponentCard";
import { PatternInboxShell } from "./PatternInboxShell";
import { EyeIcon } from "./icons";
import {
  asBackgroundWork,
  hasUserScenario,
  type PatternLivePreviewInput,
} from "@/lib/pattern-live-preview";

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

function formatPreviewDate(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function LedgerBody({
  compact = false,
  live,
}: {
  compact?: boolean;
  live?: PatternLivePreviewInput;
}) {
  const workspace = live ? asBackgroundWork(live.workspace) : null;
  const useLive = live ? hasUserScenario("background-work-ledger", live.workspace) : false;
  const summaryText = useLive
    ? workspace?.workDescription?.trim() || "Your background work scenario"
    : null;
  const openQuestion = useLive ? workspace?.blockers?.trim() : null;
  const startedLabel = formatPreviewDate(workspace?.startedAt);
  const targetLabel = formatPreviewDate(workspace?.targetCompletion);
  const scheduleMeta =
    startedLabel || targetLabel
      ? [startedLabel ? `Started ${startedLabel}` : null, targetLabel ? `Target ${targetLabel}` : null]
          .filter(Boolean)
          .join(" · ")
      : null;
  const statusEntries =
    workspace?.statusUpdates?.filter((entry) => entry.text?.trim()) ?? [];
  const contextNote =
    live?.context?.notes?.trim() ||
    live?.context?.affectedServices?.trim() ||
    live?.context?.risks?.trim() ||
    null;

  return (
    <div className={`work-ledger${compact ? " work-ledger--compact" : ""}`}>
      <div className="work-ledger__summary">
        {useLive ? (
          <>
            <span className="work-ledger__summary-strong">{summaryText}</span>
            {scheduleMeta ? (
              <span className="mt-1 block text-sm font-normal text-muted">{scheduleMeta}</span>
            ) : null}
          </>
        ) : (
          <>
            <span className="work-ledger__summary-strong">4 steps</span> while you
            were away · 7 min · 1 open question
          </>
        )}
      </div>

      {useLive && statusEntries.length > 0 ? (
        <ol className="work-ledger__timeline">
          {statusEntries.map((entry, index) => (
            <li key={`${entry.timestamp}-${index}`} className="work-ledger__entry">
              <span className="work-ledger__time">
                {formatPreviewDate(entry.timestamp) ?? entry.timestamp ?? "—"}
              </span>
              <span className="work-ledger__kind work-ledger__kind--acted">Update</span>
              <div className="work-ledger__entry-body">
                <p className="work-ledger__text">{entry.text}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      {!useLive ? (
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
      ) : null}

      <div className="work-ledger__open">
        <span className="work-ledger__open-label">Open question</span>
        <p className="work-ledger__open-text">
          {openQuestion ||
            (useLive
              ? "Add blockers or open questions in the edit panel."
              : "Confirm the owning team for edge-router-7 before this rollback merges to prod?")}
        </p>
      </div>

      {useLive && contextNote ? (
        <p className="mt-3 text-xs text-muted">{contextNote}</p>
      ) : null}

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

export function BackgroundWorkLedger({
  compact = false,
  live,
}: {
  compact?: boolean;
  live?: PatternLivePreviewInput;
}) {
  const workspace = live ? asBackgroundWork(live.workspace) : null;
  const useLive = live ? hasUserScenario("background-work-ledger", live.workspace) : false;
  const contextLabel =
    live?.context?.affectedServices?.trim() ||
    live?.title?.trim() ||
    (workspace?.workDescription?.trim()
      ? workspace.workDescription.trim().slice(0, 48)
      : "Rollback agent");

  const footerLeft = useLive
    ? [
        workspace?.blockers?.trim() ? "Blockers noted" : "Nothing merged to prod yet",
        "your review needed",
      ].join(" · ")
    : "Nothing merged to prod yet · your review needed";

  return (
    <PatternComponentCard
      patternKey="BackgroundWorkLedger"
      dotColor="#3b5ec6"
      title="What happened while you were away"
      contextLabel={contextLabel}
      icon={<EyeIcon size={compact ? 15 : 18} />}
      footerLeft={footerLeft}
      footerRight="synced 1m ago"
      compact={compact}
    >
      <LedgerBody compact={compact} live={live} />
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

export function BackgroundWorkLedgerInbox({
  live,
}: {
  live?: PatternLivePreviewInput;
}) {
  const workspace = live ? asBackgroundWork(live.workspace) : null;
  const message =
    (live &&
      hasUserScenario("background-work-ledger", live.workspace) &&
      workspace?.workDescription?.trim()) ||
    LEDGER_INBOX_MESSAGE;

  return (
    <PatternInboxShell
      agents={LEDGER_INBOX_AGENTS}
      activeAgentName="Rollback agent"
      message={message}
    >
      <BackgroundWorkLedger compact live={live} />
    </PatternInboxShell>
  );
}
