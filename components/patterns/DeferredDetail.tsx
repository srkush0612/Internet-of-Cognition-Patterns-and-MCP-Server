"use client";

import { useEffect, useState } from "react";
import { PatternComponentCard } from "./PatternComponentCard";
import { PatternIncidentShell } from "./PatternIncidentShell";
import { EyeIcon } from "./icons";
import {
  asDeferredDetail,
  hasUserScenario,
  type PatternLivePreviewInput,
} from "@/lib/pattern-live-preview";

export type LiveCounts = {
  steps: number;
  toolCalls: number;
};

export type LiveStatus = "live" | "waiting" | "needs-you";

export type LiveCountScheduleEvent =
  | { atMs: number; counts: LiveCounts }
  | { atMs: number; stall: { reason: string; untilMs: number } }
  | { atMs: number; needsYou: boolean };

export const DEFAULT_LIVE_COUNT_SCHEDULE: LiveCountScheduleEvent[] = [
  { atMs: 0, counts: { steps: 10, toolCalls: 3 } },
  { atMs: 1000, counts: { steps: 11, toolCalls: 3 } },
  { atMs: 2000, counts: { steps: 12, toolCalls: 3 } },
  {
    atMs: 3000,
    stall: { reason: "waiting on the subscriptions agent", untilMs: 6000 },
  },
  { atMs: 6000, counts: { steps: 13, toolCalls: 3 } },
  { atMs: 7000, counts: { steps: 14, toolCalls: 3 } },
  { atMs: 8000, counts: { steps: 15, toolCalls: 4 } },
  { atMs: 9000, counts: { steps: 16, toolCalls: 4 } },
  { atMs: 10000, counts: { steps: 17, toolCalls: 4 } },
];

const NEEDS_YOU_COUNTS: LiveCounts = { steps: 17, toolCalls: 4 };

type SpecimenTab = "live" | "needs-you" | "record";

const SPECIMEN_TABS: { id: SpecimenTab; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "needs-you", label: "Needs you" },
  { id: "record", label: "Retrospective record" },
];

type RecordStep = {
  time: string;
  text: string;
  agent: string;
  tool?: boolean;
  consequence?: string;
};

type RecordChapter = {
  id: string;
  time: string;
  reading: string;
  holder: string;
  steps: number;
  toolCalls: number;
  wrongFor?: string;
  stepsDetail: RecordStep[];
  conflict?: {
    governed: { agent: string; detail: string };
    unweighed: { agent: string; detail: string };
    note: string;
    adoption: string;
  };
};

const RECORD_CHAPTERS: RecordChapter[] = [
  {
    id: "ch1",
    time: "09:12",
    reading: "no reading yet",
    holder: "billing agent",
    steps: 5,
    toolCalls: 2,
    stepsDetail: [
      { time: "09:12", text: "Opened ticket from customer report", agent: "billing agent" },
      { time: "09:13", text: "Pulled charge history for account", agent: "billing agent", tool: true },
      { time: "09:14", text: "Matched customer to subscription profile", agent: "billing agent", tool: true },
      { time: "09:16", text: "Asked payments agent for recent charges", agent: "billing agent" },
      { time: "09:18", text: "Held thread open, no reading formed", agent: "billing agent" },
    ],
  },
  {
    id: "ch2",
    time: "09:20",
    reading: "duplicate charge",
    holder: "billing agent",
    steps: 7,
    toolCalls: 2,
    wrongFor: "21 min",
    stepsDetail: [
      { time: "09:20", text: "Formed reading: duplicate charge", agent: "billing agent" },
      { time: "09:21", text: "Queried payments agent for charge pairs", agent: "billing agent", tool: true },
      { time: "09:22", text: "Recorded two charges of $49, four minutes apart", agent: "payments agent" },
      {
        time: "09:24",
        text: "Refund agent adopted duplicate-charge reading",
        agent: "refund agent",
        consequence: "Refund draft opened on wrong basis",
      },
      { time: "09:25", text: "Opened refund draft for second charge", agent: "billing agent", tool: true },
      {
        time: "09:29",
        text: "Comms agent sent draft without rechecking reading",
        agent: "comms agent",
        consequence: "Apology referenced a charge that was not a duplicate",
      },
      { time: "09:35", text: "Subscriptions finding posted, not weighed", agent: "billing agent" },
    ],
    conflict: {
      governed: {
        agent: "payments agent",
        detail: "two charges of $49, 4 min apart",
      },
      unweighed: {
        agent: "subscriptions agent",
        detail: "plan upgraded 09:04, posted 09:19",
      },
      note: "The payments agent is authoritative for what was charged, not for what the customer agreed to. The subscriptions agent posted the plan change one minute before this reading was formed.",
      adoption:
        "The reading was adopted by the refund agent at 09:24 and the comms agent at 09:29. Neither rechecked it.",
    },
  },
  {
    id: "ch3",
    time: "09:41",
    reading: "plan change, not a duplicate",
    holder: "billing agent",
    steps: 5,
    toolCalls: 0,
    stepsDetail: [
      { time: "09:41", text: "Corrected reading to plan change overlap", agent: "billing agent" },
      { time: "09:44", text: "Pulled subscriptions agent plan-change post", agent: "billing agent" },
      { time: "09:48", text: "Confirmed upgrade posted before second charge", agent: "subscriptions agent" },
      { time: "09:55", text: "Withdrew refund draft", agent: "billing agent" },
      { time: "10:02", text: "Prepared close summary for BIL-2231", agent: "billing agent" },
    ],
  },
];

const TOTAL_RECORD = { steps: 17, toolCalls: 4, agents: 5 };

function useLiveCounts(
  schedule: LiveCountScheduleEvent[],
  enabled: boolean,
) {
  const [counts, setCounts] = useState<LiveCounts>({ steps: 10, toolCalls: 3 });
  const [status, setStatus] = useState<LiveStatus>("live");
  const [stallReason, setStallReason] = useState<string | null>(null);
  const [stallSeconds, setStallSeconds] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setCounts({ steps: 10, toolCalls: 3 });
      setStatus("live");
      setStallReason(null);
      setStallSeconds(0);
      setPulse(false);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];
    let pulseTimer: ReturnType<typeof setTimeout> | undefined;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    schedule.forEach((event) => {
      timers.push(
        setTimeout(() => {
          if ("counts" in event && event.counts) {
            setCounts((prev) => {
              const changed =
                prev.steps !== event.counts!.steps ||
                prev.toolCalls !== event.counts!.toolCalls;
              if (changed && !reducedMotion) {
                setPulse(true);
                pulseTimer = setTimeout(() => setPulse(false), 320);
              }
              return event.counts!;
            });
            setStatus((current) => (current === "needs-you" ? current : "live"));
            setStallReason(null);
            setStallSeconds(0);
          }

          if ("stall" in event && event.stall) {
            const waitMs = event.stall.untilMs - event.atMs;
            setStatus("waiting");
            setStallReason(event.stall.reason);
            setStallSeconds(Math.ceil(waitMs / 1000));

            const tick = setInterval(() => {
              setStallSeconds((seconds) => Math.max(0, seconds - 1));
            }, 1000);
            intervals.push(tick);

            timers.push(
              setTimeout(() => {
                clearInterval(tick);
                setStatus((current) => (current === "needs-you" ? current : "live"));
                setStallReason(null);
                setStallSeconds(0);
              }, waitMs),
            );
          }

          if ("needsYou" in event && event.needsYou) {
            setStatus("needs-you");
            setStallReason(null);
            setStallSeconds(0);
          }
        }, event.atMs),
      );
    });

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      if (pulseTimer) clearTimeout(pulseTimer);
    };
  }, [enabled, schedule]);

  return { counts, status, stallReason, stallSeconds, pulse };
}

function LiveBlock({
  animate,
  schedule,
  forceStatus,
  fixedCounts,
  live,
}: {
  animate: boolean;
  schedule: LiveCountScheduleEvent[];
  forceStatus?: LiveStatus;
  fixedCounts?: LiveCounts;
  live?: PatternLivePreviewInput;
}) {
  const workspace = live ? asDeferredDetail(live.workspace) : null;
  const useLive = live ? hasUserScenario("deferred-detail", live.workspace) : false;
  const situation =
    (useLive && workspace?.overall_goal?.trim()) ||
    "Investigating a double charge reported by a customer";
  const reading =
    (useLive &&
      Array.isArray(workspace?.deferred_details) &&
      workspace.deferred_details.filter((field) => field.trim()).join(", ")) ||
    "duplicate charge";
  const revealWhen = useLive ? workspace?.handoff_points?.trim() : undefined;
  const detailLevel = useLive ? workspace?.phase_learnings?.trim() : undefined;
  const agentRole =
    (useLive &&
      Array.isArray(workspace?.phases) &&
      String(workspace.phases[0] ?? "").trim()) ||
    "Billing agent";
  const liveCounts = useLiveCounts(schedule, animate && !forceStatus);
  const counts = fixedCounts ?? liveCounts.counts;
  const status = forceStatus ?? liveCounts.status;
  const stallReason = forceStatus ? null : liveCounts.stallReason;
  const stallSeconds = forceStatus ? 0 : liveCounts.stallSeconds;
  const pulse = forceStatus ? false : liveCounts.pulse;
  const isWaiting = status === "waiting";
  const needsYou = status === "needs-you";
  const tag = needsYou ? "NEEDS YOU" : "LIVE";
  const dotHollow = isWaiting || needsYou;

  return (
    <section className="deferred__live" aria-label="Live agent record">
      <div className="deferred__live-head">
        <div className="deferred__live-tags">
          <span
            className={`deferred__status-dot${
              dotHollow ? " deferred__status-dot--hollow" : ""
            }`}
            aria-hidden
          />
          <span
            className={`deferred__status-tag${
              needsYou ? " deferred__status-tag--needs" : ""
            }`}
          >
            {tag}
          </span>
          <span className="deferred__elapsed">23m</span>
        </div>
        <p className="deferred__agent-role">{agentRole}</p>
        <p className="deferred__situation">{situation}</p>
        <p className="deferred__reading">Reading: {reading}</p>
        {revealWhen ? (
          <p className="deferred__contributors">Reveal when: {revealWhen}</p>
        ) : (
          <p className="deferred__contributors">
            held by the billing agent, 4 other agents contributing
          </p>
        )}
        {detailLevel ? (
          <p className="deferred__strip-sub">Detail level: {detailLevel}</p>
        ) : null}
      </div>

      <div className="deferred__strip deferred__strip--recording">
        <span className="deferred__strip-label">recording</span>
        <div className="deferred__strip-body">
          <p className={`deferred__count-line${pulse ? " deferred__count-line--pulse" : ""}`}>
            <span
              className={`deferred__strip-dot${
                dotHollow ? " deferred__strip-dot--hollow" : ""
              }`}
              aria-hidden
            />
            <span className="deferred__tabular">
              {counts.steps} steps, {counts.toolCalls} tool calls, {TOTAL_RECORD.agents}{" "}
              agents
            </span>
          </p>
          <p className="deferred__strip-sub deferred__tabular">
            {isWaiting && stallReason
              ? `${stallReason}, ${stallSeconds}s`
              : needsYou
                ? "count frozen, decision open"
                : "last step 6s ago, held until BIL-2231 closes"}
          </p>
        </div>
      </div>

      {needsYou ? (
        <div className="deferred__request">
          <p className="deferred__request-line">
            <span className="deferred__request-label">Wants to</span> issue a refund for
            the duplicate charge
          </p>
          <p className="deferred__request-line">
            <span className="deferred__request-label">Asked by</span> refund agent
          </p>
          <p className="deferred__request-line">
            <span className="deferred__request-label">Rests on</span> duplicate charge
            reading, billing agent, 09:20
          </p>
          <p className="deferred__request-line">
            <span className="deferred__request-label">Affects</span> customer account,
            comms draft BIL-2231-C1
          </p>
          <button type="button" className="deferred__handoff-btn">
            Take this decision
          </button>
          <p className="deferred__request-held">
            Everything else stays held until you return.
          </p>
        </div>
      ) : (
        <>
          <p className="deferred__next">
            Next: recheck the subscriptions agent&apos;s finding
          </p>
          <p className="deferred__person">Nothing needs you right now.</p>
        </>
      )}
    </section>
  );
}

function RecordChapterRow({
  chapter,
  defaultOpen,
  forceCollapsed,
}: {
  chapter: RecordChapter;
  defaultOpen: boolean;
  forceCollapsed: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen && !forceCollapsed);

  useEffect(() => {
    if (forceCollapsed) setOpen(false);
  }, [forceCollapsed]);

  const headerId = `deferred-ch-${chapter.id}-header`;
  const panelId = `deferred-ch-${chapter.id}-panel`;

  return (
    <div
      className={`deferred__chapter${
        chapter.wrongFor ? " deferred__chapter--wrong" : ""
      }`}
    >
      <button
        type="button"
        className="deferred__chapter-header"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="deferred__chapter-chevron" aria-hidden>
          {open ? "▾" : "›"}
        </span>
        <span className="deferred__chapter-time deferred__tabular">{chapter.time}</span>
        <span className="deferred__chapter-reading">
          {chapter.reading === "no reading yet"
            ? chapter.reading
            : `reading: ${chapter.reading}, ${chapter.holder}`}
        </span>
        <span className="deferred__chapter-meta deferred__tabular">
          {chapter.steps} steps
          {chapter.toolCalls > 0 ? `, ${chapter.toolCalls} tool calls` : ""}
          {chapter.wrongFor ? ` · wrong for ${chapter.wrongFor}` : ""}
        </span>
      </button>

      {open ? (
        <div className="deferred__chapter-panel" id={panelId} role="region" aria-labelledby={headerId}>
          <ol className="deferred__step-list">
            {chapter.stepsDetail.map((step) => (
              <li key={step.time + step.text} className="deferred__step">
                <span className="deferred__step-time deferred__tabular">{step.time}</span>
                <div className="deferred__step-body">
                  <p className="deferred__step-text">
                    {step.text}
                    {step.tool ? (
                      <span className="deferred__step-tool"> tool</span>
                    ) : null}
                  </p>
                  <span className="deferred__step-agent">{step.agent}</span>
                  {step.consequence ? (
                    <p className="deferred__step-consequence">{step.consequence}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          {chapter.conflict ? (
            <div className="deferred__conflict">
              <p className="deferred__conflict-label">What governed this reading</p>
              <div className="deferred__conflict-grid">
                <div className="deferred__conflict-panel deferred__conflict-panel--governed">
                  <span className="deferred__conflict-agent">
                    {chapter.conflict.governed.agent}
                  </span>
                  <p className="deferred__conflict-detail">
                    {chapter.conflict.governed.detail}
                  </p>
                  <span className="deferred__conflict-weight">GOVERNED</span>
                </div>
                <div className="deferred__conflict-panel deferred__conflict-panel--unweighed">
                  <span className="deferred__conflict-agent">
                    {chapter.conflict.unweighed.agent}
                  </span>
                  <p className="deferred__conflict-detail">
                    {chapter.conflict.unweighed.detail}
                  </p>
                  <span className="deferred__conflict-weight">AVAILABLE, NOT WEIGHED</span>
                </div>
              </div>
              <p className="deferred__conflict-note">{chapter.conflict.note}</p>
              <p className="deferred__conflict-adoption">{chapter.conflict.adoption}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function RecordBlock({ chaptersCollapsed }: { chaptersCollapsed: boolean }) {
  return (
    <section className="deferred__record" aria-label="Closed ticket record">
      <header className="deferred__record-head">
        <h4 className="deferred__record-title">
          Double charge reported by a customer
        </h4>
        <span className="deferred__record-closed deferred__tabular">Closed 10:04</span>
      </header>

      <div className="deferred__strip deferred__strip--record">
        <span className="deferred__strip-label">record</span>
        <div className="deferred__strip-body">
          <p className="deferred__count-line">
            <span className="deferred__strip-dot" aria-hidden />
            <span className="deferred__tabular">
              {TOTAL_RECORD.steps} steps, {TOTAL_RECORD.toolCalls} tool calls,{" "}
              {TOTAL_RECORD.agents} agents
            </span>
          </p>
          <p className="deferred__strip-sub deferred__tabular">09:12 to 10:04</p>

          <div className="deferred__chapters">
            {RECORD_CHAPTERS.map((chapter, index) => (
              <RecordChapterRow
                key={chapter.id}
                chapter={chapter}
                defaultOpen={index === 1}
                forceCollapsed={chaptersCollapsed}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="deferred__insight">
        Across the last 5 double charge reports, 3 were plan changes.
      </p>

      <div className="deferred__rule-footer">
        <p className="deferred__rule-text">
          <span className="deferred__rule-label">Suggested rule:</span> weigh the
          subscriptions agent before reading two charges as a duplicate.
        </p>
        <button type="button" className="deferred__rule-btn">
          Add rule
        </button>
      </div>
    </section>
  );
}

function SpecimenTabs({
  active,
  onChange,
}: {
  active: SpecimenTab;
  onChange: (tab: SpecimenTab) => void;
}) {
  return (
    <div
      className="deferred__specimen-tabs"
      role="tablist"
      aria-label="Specimen phases"
    >
      {SPECIMEN_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          aria-controls={`deferred-specimen-${tab.id}`}
          id={`deferred-specimen-tab-${tab.id}`}
          className={`deferred__specimen-tab${
            active === tab.id ? " deferred__specimen-tab--active" : ""
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function DeferredDetailSeam() {
  return (
    <p className="deferred__seam-note">
      BIL-2231 closed 10:04, the record opens
    </p>
  );
}

function StandaloneSpecimenPanel({
  activeTab,
  live,
}: {
  activeTab: SpecimenTab;
  live?: PatternLivePreviewInput;
}) {
  if (activeTab === "live") {
    return (
      <div
        id="deferred-specimen-live"
        role="tabpanel"
        aria-labelledby="deferred-specimen-tab-live"
        className="deferred deferred--standalone"
      >
        <LiveBlock animate schedule={DEFAULT_LIVE_COUNT_SCHEDULE} live={live} />
      </div>
    );
  }

  if (activeTab === "needs-you") {
    return (
      <div
        id="deferred-specimen-needs-you"
        role="tabpanel"
        aria-labelledby="deferred-specimen-tab-needs-you"
        className="deferred deferred--standalone"
      >
        <LiveBlock
          animate={false}
          schedule={[]}
          forceStatus="needs-you"
          fixedCounts={NEEDS_YOU_COUNTS}
          live={live}
        />
      </div>
    );
  }

  return (
    <div
      id="deferred-specimen-record"
      role="tabpanel"
      aria-labelledby="deferred-specimen-tab-record"
      className="deferred deferred--standalone"
    >
      <DeferredDetailSeam />
      <RecordBlock chaptersCollapsed={false} />
    </div>
  );
}

function DeferredDetailContent({
  schedule = DEFAULT_LIVE_COUNT_SCHEDULE,
  live,
}: {
  schedule?: LiveCountScheduleEvent[];
  live?: PatternLivePreviewInput;
}) {
  return (
    <div className="deferred deferred--in-context">
      <LiveBlock animate={false} schedule={schedule} live={live} />
    </div>
  );
}

/** Standalone specimen: no compact variant by design (see pattern brief). */
export function DeferredDetail({
  compact: _compact,
  live,
}: {
  compact?: boolean;
  live?: PatternLivePreviewInput;
}) {
  const workspace = live ? asDeferredDetail(live.workspace) : null;
  const incidentId =
    (typeof workspace?.incidentId === "string" && workspace.incidentId.trim()) ||
    "BIL-2231";
  const domain =
    (typeof workspace?.domain === "string" && workspace.domain.trim()) || "Billing";
  const [activeTab, setActiveTab] = useState<SpecimenTab>("live");

  return (
    <div className="deferred-specimen">
      <SpecimenTabs active={activeTab} onChange={setActiveTab} />
      <PatternComponentCard
        patternKey="DeferredDetail"
        dotColor="#3b5ec6"
        title="Agent activity record"
        contextLabel={`${domain} · ${incidentId}`}
        icon={<EyeIcon size={18} />}
        compact={false}
      >
        <StandaloneSpecimenPanel activeTab={activeTab} live={live} />
      </PatternComponentCard>
    </div>
  );
}

const INCIDENT_PARTICIPANTS = [
  { name: "You · owner", role: "human" as const },
  { name: "billing agent", role: "agent" as const },
  { name: "payments agent", role: "agent" as const },
  { name: "subscriptions agent", role: "agent" as const },
  { name: "refund agent", role: "agent" as const },
  { name: "comms agent", role: "agent" as const },
];

const INCIDENT_TIMELINE = [
  { time: "09:12", label: "Customer reported double charge" },
  { time: "09:20", label: "Duplicate-charge reading formed" },
  { time: "09:41", label: "Reading corrected to plan change" },
];

export function DeferredDetailInContext({
  live,
}: {
  live?: PatternLivePreviewInput;
}) {
  const workspace = live ? asDeferredDetail(live.workspace) : null;
  const ticketId =
    (typeof workspace?.incidentId === "string" && workspace.incidentId.trim()) ||
    "BIL-2231";
  const queueLabel =
    (typeof workspace?.domain === "string" && workspace.domain.trim()) || "Billing";
  const ticketTitle =
    workspace?.overall_goal?.trim() || "Double charge reported by a customer";

  return (
    <PatternIncidentShell
      queueLabel={queueLabel}
      ticketId={ticketId}
      ticketTitle={ticketTitle}
      elapsed="23m open"
      cardEnds="card ends when you close the ticket"
      participants={INCIDENT_PARTICIPANTS}
      timeline={INCIDENT_TIMELINE}
    >
      <DeferredDetailContent schedule={[]} live={live} />
    </PatternIncidentShell>
  );
}

/** Registry alias: PATTERN_INBOX keys expect an *Inbox export name. */
export const DeferredDetailInbox = DeferredDetailInContext;
