"use client";

import { useId, useState, type CSSProperties } from "react";
import {
  ATTRIBUTION_CHIP_HINT,
  ATTRIBUTION_LABEL,
  SEEDED_SEALED_RECORDS,
  SERVICE_NAME,
  type LedgerAttribution,
  type SealedLedgerRecord,
} from "@/lib/decision-ledger-data";
import {
  asDecisionLedger,
  decisionLedgerLiveRecord,
  hasUserScenario,
  type PatternLivePreviewInput,
} from "@/lib/pattern-live-preview";
import { PatternChangeShell } from "./PatternChangeShell";
import { PatternComponentCard } from "./PatternComponentCard";
import { LockIcon } from "./icons";

function ReasoningPanel({
  alternatives,
  inputs,
  panelId,
  labelledBy,
}: {
  alternatives: { text: string }[];
  inputs: string[];
  panelId: string;
  labelledBy: string;
}) {
  return (
    <div
      className="decision-ledger__reasoning"
      id={panelId}
      role="region"
      aria-labelledby={labelledBy}
    >
      <p className="decision-ledger__reasoning-label">Alternatives weighed</p>
      <ul className="decision-ledger__alt-list">
        {alternatives.map((alt) => (
          <li key={alt.text}>{alt.text}</li>
        ))}
      </ul>
      <p className="decision-ledger__reasoning-label">Inputs behind the choice</p>
      <ul className="decision-ledger__input-list">
        {inputs.map((input) => (
          <li key={input}>{input}</li>
        ))}
      </ul>
    </div>
  );
}

function AttributionChip({ attribution }: { attribution: LedgerAttribution }) {
  return (
    <span
      className={`decision-ledger__chip decision-ledger__chip--${attribution}`}
      title={ATTRIBUTION_CHIP_HINT[attribution]}
    >
      <span className="decision-ledger__chip-dot" aria-hidden />
      {ATTRIBUTION_LABEL[attribution]}
    </span>
  );
}

function ReasonBlock({
  kind,
  label,
  text,
}: {
  kind: "agent" | "operator" | "decline";
  label: string;
  text: string;
}) {
  return (
    <div className={`decision-ledger__reason-block decision-ledger__reason-block--${kind}`}>
      <div className="decision-ledger__reason-head">
        <span className={`decision-ledger__reason-marker decision-ledger__reason-marker--${kind}`} aria-hidden />
        <span className="decision-ledger__reason-label">{label}</span>
      </div>
      <p className="decision-ledger__reason-text">{text}</p>
    </div>
  );
}

function SealedRecordCard({
  record,
  recedeIndex,
  totalSealed,
}: {
  record: SealedLedgerRecord;
  recedeIndex: number;
  totalSealed: number;
}) {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const toggleId = useId();
  const panelId = useId();

  const recede =
    totalSealed <= 1
      ? 1
      : Math.max(0.62, 1 - recedeIndex * (0.38 / (totalSealed - 1)));

  const declined = record.attribution === "operator-declined";

  return (
    <article
      className={`decision-ledger__sealed${
        declined ? " decision-ledger__sealed--declined" : ""
      }`}
      style={{ "--ledger-recede": recede } as CSSProperties}
    >
      <header className="decision-ledger__sealed-head">
        <div className="decision-ledger__sealed-title">
          <h4
            className={`decision-ledger__action${
              declined ? " decision-ledger__action--declined" : ""
            }`}
          >
            {record.action}
          </h4>
          <span className="decision-ledger__ref">{record.changeRef}</span>
        </div>
        <AttributionChip attribution={record.attribution} />
      </header>

      <div className="decision-ledger__reasons">
        <ReasonBlock kind="agent" label="Agent reason" text={record.agentReason} />
        {record.operatorContext ? (
          <ReasonBlock
            kind="operator"
            label="Operator context"
            text={record.operatorContext}
          />
        ) : null}
        {record.declineReason ? (
          <ReasonBlock
            kind="decline"
            label="Reason for declining"
            text={record.declineReason}
          />
        ) : null}
      </div>

      <button
        type="button"
        className="decision-ledger__reasoning-toggle"
        id={toggleId}
        aria-expanded={reasoningOpen}
        aria-controls={panelId}
        onClick={() => setReasoningOpen((open) => !open)}
      >
        <span
          className={`decision-ledger__caret${
            reasoningOpen ? " decision-ledger__caret--open" : ""
          }`}
          aria-hidden
        />
        Why the agent chose this
        <span className="decision-ledger__reasoning-count">
          {record.alternatives.length} alternatives
        </span>
      </button>
      {reasoningOpen ? (
        <ReasoningPanel
          alternatives={record.alternatives}
          inputs={record.inputs}
          panelId={panelId}
          labelledBy={toggleId}
        />
      ) : null}

      <footer className="decision-ledger__sealed-footer">
        <span className="decision-ledger__policy-chip">{record.policyVersion}</span>
        <span className="decision-ledger__sealed-ago">Sealed {record.sealedAgo}</span>
      </footer>
    </article>
  );
}

function SealThreshold() {
  return (
    <div className="decision-ledger__threshold" role="separator">
      <span className="decision-ledger__threshold-label">Sealed. Read only.</span>
    </div>
  );
}

function ExportFooter() {
  return (
    <div className="decision-ledger__export">
      <button type="button" className="decision-ledger__export-btn">
        Export audit packet
      </button>
      <p className="decision-ledger__export-note">
        Export reads these records and never asks for a reason after the fact.
      </p>
    </div>
  );
}

function DecisionLedgerSpine({
  showExport = true,
  live,
}: {
  showExport?: boolean;
  live?: PatternLivePreviewInput;
}) {
  const workspace = live ? asDecisionLedger(live.workspace) : null;
  const liveRecord = workspace ? decisionLedgerLiveRecord(workspace) : null;
  const useLive = live ? hasUserScenario("decision-ledger", live.workspace) : false;
  const sealedRecords = useLive && liveRecord ? [liveRecord] : SEEDED_SEALED_RECORDS;

  return (
    <div className="decision-ledger">
      <div className="decision-ledger__spine" aria-hidden />
      <div className="decision-ledger__stack">
        {useLive && liveRecord ? (
          <div className="decision-ledger__threshold" role="separator">
            <span className="decision-ledger__threshold-label">Your scenario</span>
          </div>
        ) : (
          <SealThreshold />
        )}
        {sealedRecords.map((record, index) => (
          <SealedRecordCard
            key={record.id}
            record={record}
            recedeIndex={index}
            totalSealed={sealedRecords.length}
          />
        ))}
        {showExport ? <ExportFooter /> : null}
      </div>
    </div>
  );
}

export function DecisionLedger({
  compact: _compact,
  live,
}: {
  compact?: boolean;
  live?: PatternLivePreviewInput;
}) {
  const contextLabel =
    live?.title?.trim() ||
    live?.context?.affectedServices?.trim() ||
    "Network ops · svc-payments";

  return (
    <div className="decision-ledger-wide">
      <PatternComponentCard
        patternKey="DecisionLedger"
        dotColor="#3b5ec6"
        title="Sealed decision records"
        contextLabel={contextLabel}
        icon={<LockIcon size={18} />}
        showLabelBar
        footerLeft={
          live && hasUserScenario("decision-ledger", live.workspace)
            ? "Your parameters · reference layout"
            : "Read only · commits done"
        }
        footerRight={`${live && hasUserScenario("decision-ledger", live.workspace) ? 1 : SEEDED_SEALED_RECORDS.length} sealed`}
      >
        <DecisionLedgerSpine showExport live={live} />
      </PatternComponentCard>
    </div>
  );
}

export function DecisionLedgerInContext({
  live,
}: {
  live?: PatternLivePreviewInput;
}) {
  const workspace = live ? asDecisionLedger(live.workspace) : null;
  const title = workspace?.decision?.trim() || "Restart svc-payments";

  return (
    <PatternChangeShell
      changeRef="YOUR-CASE"
      service={SERVICE_NAME}
      title={title}
      status="Awaiting approval"
      stepLabel="Decision history"
    >
      <DecisionLedgerSpine showExport={false} live={live} />
    </PatternChangeShell>
  );
}

/** Registry alias: PATTERN_INBOX keys expect an *Inbox export name. */
export const DecisionLedgerInbox = DecisionLedgerInContext;
