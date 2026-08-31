"use client";

import { useCallback, useState, type ReactNode } from "react";
import type {
  Belief,
  BeliefDecision,
  BeliefKeep,
  BeliefScope,
} from "@/lib/memory-commitment-data";

const SCOPES: BeliefScope[] = ["Personal", "Project", "Team"];
const KEEP_OPTIONS: BeliefKeep[] = ["Permanent", "Expires 30d", "Session"];

export type BeliefCardProps = {
  belief: Belief;
  onBeliefChange: (patch: Partial<Belief>) => void;
};

function confidenceBarCount(confidence: Belief["confidence"]): number {
  switch (confidence) {
    case "High":
      return 3;
    case "Medium":
      return 2;
    default:
      return 1;
  }
}

function confidenceLabel(confidence: Belief["confidence"]): string {
  return `${confidence} confidence`;
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 7.25l3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M8.75 2.75l2.5 2.5-6.5 6.5H2.25v-2.5l6.5-6.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M7 4.5V7l2 1.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PrivateLockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect
        x="3.25"
        y="6.25"
        width="7.5"
        height="5.5"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M5 6.25V4.75a2 2 0 0 1 4 0v1.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RejectIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3.5 3.5l7 7M10.5 3.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ConflictIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 2.5v3.25M6 8.75h.01"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M6 1.25l5 9.5H1L6 1.25z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BeliefCard({ belief, onBeliefChange }: BeliefCardProps) {
  const decision = belief.decision ?? "pending";
  const scope = belief.scope ?? "Team";
  const keep = belief.keep ?? "Permanent";
  const [touchedAction, setTouchedAction] = useState<
    "edit" | "expiry" | "private" | null
  >(null);

  const handleCommit = useCallback(() => {
    const next: BeliefDecision = decision === "committed" ? "pending" : "committed";
    onBeliefChange({ decision: next });
  }, [decision, onBeliefChange]);

  const handleReject = useCallback(() => {
    const next: BeliefDecision = decision === "rejected" ? "pending" : "rejected";
    onBeliefChange({ decision: next });
  }, [decision, onBeliefChange]);

  const barCount = confidenceBarCount(belief.confidence);
  const confidenceTone =
    belief.confidence === "High" ? "success" : "warning";

  const metaParts: ReactNode[] = [
    <span key="source">
      Observed in <strong>{belief.source}</strong>
    </span>,
  ];
  if (belief.context) {
    metaParts.push(<span key="context">{belief.context}</span>);
  }
  if (belief.timestamp) {
    metaParts.push(<span key="time">{belief.timestamp}</span>);
  }
  if (belief.sourceNote) {
    metaParts.push(<span key="note">{belief.sourceNote}</span>);
  }

  return (
    <article
      className={`belief-card${
        decision === "committed"
          ? " belief-card--committed"
          : decision === "rejected"
            ? " belief-card--rejected"
            : ""
      }`}
    >
      <div className="belief-card__title-row">
        <span className="belief-card__status-dot" aria-hidden />
        <p className="belief-card__statement">{belief.statement}</p>
        <div
          className="belief-card__confidence"
          aria-label={confidenceLabel(belief.confidence)}
        >
          <span className="belief-card__confidence-bars" aria-hidden>
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={`belief-card__confidence-bar belief-card__confidence-bar--${confidenceTone}${
                  index < barCount ? " belief-card__confidence-bar--filled" : ""
                }`}
              />
            ))}
          </span>
          <span className="belief-card__confidence-text">
            {confidenceLabel(belief.confidence)}
          </span>
        </div>
      </div>

      {belief.quote ? (
        <blockquote className="belief-card__quote">{belief.quote}</blockquote>
      ) : null}

      <p className="belief-card__meta">
        {metaParts.map((part, index) => (
          <span key={index}>
            {index > 0 ? " · " : null}
            {part}
          </span>
        ))}
      </p>

      <div className="belief-card__config">
        <div className="belief-card__config-row">
          <span className="belief-card__config-label">Scope</span>
          <div className="belief-card__segmented" role="group" aria-label="Scope">
            {SCOPES.map((option) => (
              <button
                key={option}
                type="button"
                className={`belief-card__segment${
                  scope === option ? " belief-card__segment--active" : ""
                }`}
                aria-pressed={scope === option}
                onClick={() => onBeliefChange({ scope: option })}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="belief-card__config-row">
          <span className="belief-card__config-label">Keep</span>
          <div className="belief-card__config-keep">
            <div className="belief-card__segmented" role="group" aria-label="Keep">
              {KEEP_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`belief-card__segment${
                    keep === option ? " belief-card__segment--active" : ""
                  }`}
                  aria-pressed={keep === option}
                  onClick={() => onBeliefChange({ keep: option })}
                >
                  {option}
                </button>
              ))}
            </div>
            {belief.flag ? (
              <span
                className={`belief-card__flag belief-card__flag--${
                  belief.flag === "Sensitive" ? "sensitive" : "conflict"
                }`}
              >
                {belief.flag === "Possible conflict" ? <ConflictIcon /> : null}
                {belief.flag === "Sensitive" ? <PrivateLockIcon /> : null}
                {belief.flag}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="belief-card__actions">
        <div className="belief-card__actions-row">
          <button
            type="button"
            className={`belief-card__btn belief-card__btn--commit${
              decision === "committed" ? " belief-card__btn--active" : ""
            }`}
            onClick={handleCommit}
          >
            <CheckIcon />
            Commit to memory
          </button>
          <button
            type="button"
            className={`belief-card__btn belief-card__btn--outline${
              touchedAction === "edit" ? " belief-card__btn--touched" : ""
            }`}
            onClick={() =>
              setTouchedAction((prev) => (prev === "edit" ? null : "edit"))
            }
          >
            <EditIcon />
            Edit
          </button>
        </div>
        <div className="belief-card__actions-row">
          <button
            type="button"
            className={`belief-card__btn belief-card__btn--outline${
              touchedAction === "expiry" ? " belief-card__btn--touched" : ""
            }`}
            onClick={() =>
              setTouchedAction((prev) => (prev === "expiry" ? null : "expiry"))
            }
          >
            <ClockIcon />
            Set expiry
          </button>
          <button
            type="button"
            className={`belief-card__btn belief-card__btn--outline${
              touchedAction === "private" ? " belief-card__btn--touched" : ""
            }`}
            onClick={() =>
              setTouchedAction((prev) => (prev === "private" ? null : "private"))
            }
          >
            <PrivateLockIcon />
            Keep private
          </button>
        </div>
        <button
          type="button"
          className={`belief-card__btn belief-card__btn--reject${
            decision === "rejected" ? " belief-card__btn--active" : ""
          }`}
          onClick={handleReject}
        >
          <RejectIcon />
          Reject
        </button>
      </div>
    </article>
  );
}
