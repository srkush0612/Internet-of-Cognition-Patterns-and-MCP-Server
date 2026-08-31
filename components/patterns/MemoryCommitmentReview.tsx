"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COMMIT_BELIEFS,
  COMMIT_CHOICE_LABEL,
  COMMIT_CHOICE_LOG,
  MOCK_BELIEFS,
  type Belief,
  type BeliefDecision,
  type CommitAgent,
  type CommitChoice,
} from "@/lib/memory-commitment-data";
import { PlatformRunbookDemo } from "@/components/demos/platform-runbook/PlatformRunbookDemo";
import { BeliefCard } from "./BeliefCard";
import { StarIcon } from "./icons";

export type { Belief, BeliefDecision } from "@/lib/memory-commitment-data";

const CHOICES: CommitChoice[] = ["acknowledge", "restore", "revoke"];

const PROGRESSION = [
  { key: "saw", label: "Agent saw it", tone: "muted" as const },
  { key: "proposed", label: "Proposed to you", tone: "active" as const },
  { key: "believes", label: "System believes it", tone: "success" as const },
];

type MemoryCommitmentContextValue = {
  choices: Partial<Record<string, CommitChoice>>;
  committed: boolean;
  allChosen: boolean;
  chosenCount: number;
  setChoice: (beliefId: string, choice: CommitChoice) => void;
  commit: () => void;
};

const MemoryCommitmentContext = createContext<MemoryCommitmentContextValue | null>(
  null,
);

export function MemoryCommitmentProvider({ children }: { children: ReactNode }) {
  const [choices, setChoices] = useState<Partial<Record<string, CommitChoice>>>(
    {},
  );
  const [committed, setCommitted] = useState(false);

  const allChosen = useMemo(
    () => COMMIT_BELIEFS.every((belief) => choices[belief.id] != null),
    [choices],
  );

  const chosenCount = useMemo(
    () => COMMIT_BELIEFS.filter((belief) => choices[belief.id] != null).length,
    [choices],
  );

  const setChoice = useCallback(
    (beliefId: string, choice: CommitChoice) => {
      if (committed) return;
      setChoices((prev) => ({ ...prev, [beliefId]: choice }));
    },
    [committed],
  );

  const commit = useCallback(() => {
    if (!allChosen || committed) return;
    setCommitted(true);
  }, [allChosen, committed]);

  const value = useMemo(
    () => ({
      choices,
      committed,
      allChosen,
      chosenCount,
      setChoice,
      commit,
    }),
    [choices, committed, allChosen, chosenCount, setChoice, commit],
  );

  return (
    <MemoryCommitmentContext.Provider value={value}>
      {children}
    </MemoryCommitmentContext.Provider>
  );
}

function useMemoryCommitmentContext(required = true) {
  const context = useContext(MemoryCommitmentContext);
  if (required && !context) {
    throw new Error("MemoryCommitmentCommitGate requires MemoryCommitmentProvider");
  }
  return context;
}

function normalizeBeliefs(beliefs: Belief[]): Belief[] {
  return beliefs.map((belief) => ({
    ...belief,
    decision: belief.decision ?? "pending",
    scope: belief.scope ?? "Team",
    keep: belief.keep ?? "Permanent",
  }));
}

function computeSummary(beliefs: Belief[]) {
  let committed = 0;
  let expiring = 0;
  let rejected = 0;
  let pending = 0;

  for (const belief of beliefs) {
    const decision = belief.decision ?? "pending";
    if (decision === "committed") {
      committed += 1;
      if (belief.keep === "Expires 30d") expiring += 1;
    } else if (decision === "rejected") {
      rejected += 1;
    } else {
      pending += 1;
    }
  }

  return { committed, expiring, rejected, pending };
}

function MemoryCommitmentReviewHeader({
  beliefCount,
  committedCount,
}: {
  beliefCount: number;
  committedCount: number;
}) {
  const believesReached = committedCount > 0;

  return (
    <header className="memory-commitment-review__header">
      <div className="memory-commitment-review__title-row">
        <h3 className="memory-commitment-review__title">Memory Commitment Review</h3>
        <span className="memory-commitment-review__badge">
          <StarIcon size={12} />
          Agent · session digest
        </span>
      </div>
      <p className="memory-commitment-review__intro">
        The agent observed <strong>{beliefCount} things</strong> worth remembering this
        week. Nothing is stored until you commit it.
      </p>
      <div
        className="memory-commitment-review__progression"
        aria-label="Belief lifecycle"
      >
        {PROGRESSION.map((stage, index) => {
          const reached =
            stage.key === "saw" ||
            stage.key === "proposed" ||
            (stage.key === "believes" && believesReached);
          const active = stage.key === "proposed" && !believesReached;

          return (
            <div key={stage.key} className="memory-commitment-review__progression-step">
              {index > 0 ? (
                <span
                  className={`memory-commitment-review__progression-arrow${
                    reached ? " memory-commitment-review__progression-arrow--reached" : ""
                  }`}
                  aria-hidden
                />
              ) : null}
              <span
                className={`memory-commitment-review__progression-pill memory-commitment-review__progression-pill--${stage.tone}${
                  reached ? " memory-commitment-review__progression-pill--reached" : ""
                }${active ? " memory-commitment-review__progression-pill--current" : ""}${
                  believesReached && stage.key === "believes"
                    ? " memory-commitment-review__progression-pill--current"
                    : ""
                }`}
              >
                <span className="memory-commitment-review__progression-dot" aria-hidden />
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </header>
  );
}

export type MemoryCommitmentReviewBodyProps = {
  beliefs?: Belief[];
  onBeliefsChange?: (beliefs: Belief[]) => void;
  showSummary?: boolean;
  variant?: "standalone" | "panel";
};

export function MemoryCommitmentReviewBody({
  beliefs: beliefsProp,
  onBeliefsChange,
  showSummary = true,
  variant = "standalone",
}: MemoryCommitmentReviewBodyProps) {
  const [internalBeliefs, setInternalBeliefs] = useState(() =>
    normalizeBeliefs(beliefsProp ?? MOCK_BELIEFS),
  );

  const isControlled = beliefsProp != null;
  const beliefs = isControlled ? normalizeBeliefs(beliefsProp) : internalBeliefs;

  const setBeliefs = useCallback(
    (updater: Belief[] | ((prev: Belief[]) => Belief[])) => {
      if (isControlled) {
        const next =
          typeof updater === "function" ? updater(beliefs) : updater;
        onBeliefsChange?.(next);
        return;
      }

      setInternalBeliefs((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        onBeliefsChange?.(next);
        return next;
      });
    },
    [beliefs, isControlled, onBeliefsChange],
  );

  const updateBelief = useCallback(
    (id: string, patch: Partial<Belief>) => {
      setBeliefs((prev) =>
        prev.map((belief) => (belief.id === id ? { ...belief, ...patch } : belief)),
      );
    },
    [setBeliefs],
  );

  const summary = useMemo(() => computeSummary(beliefs), [beliefs]);

  const commitAllApproved = useCallback(() => {
    setBeliefs((prev) =>
      prev.map((belief) =>
        (belief.decision ?? "pending") === "pending"
          ? { ...belief, decision: "committed" as const }
          : belief,
      ),
    );
  }, [setBeliefs]);

  return (
    <div
      className={`memory-commitment-review memory-commitment-review--${variant}${
        showSummary ? " memory-commitment-review--with-summary" : ""
      }`}
    >
      <MemoryCommitmentReviewHeader
        beliefCount={beliefs.length}
        committedCount={summary.committed}
      />

      <ul className="memory-commitment-review__list">
        {beliefs.map((belief) => (
          <li key={belief.id} className="memory-commitment-review__item">
            <BeliefCard
              belief={belief}
              onBeliefChange={(patch) => updateBelief(belief.id, patch)}
            />
          </li>
        ))}
      </ul>

      {showSummary ? (
        <footer className="memory-commitment-review__summary" aria-live="polite">
          <div className="memory-commitment-review__summary-stats">
            <div className="memory-commitment-review__summary-item">
              <span className="memory-commitment-review__summary-value memory-commitment-review__summary-value--committed">
                {summary.committed}
              </span>
              <span className="memory-commitment-review__summary-label">Committed</span>
            </div>
            <div className="memory-commitment-review__summary-item">
              <span className="memory-commitment-review__summary-value memory-commitment-review__summary-value--expiring">
                {summary.expiring}
              </span>
              <span className="memory-commitment-review__summary-label">Expiring</span>
            </div>
            <div className="memory-commitment-review__summary-item">
              <span className="memory-commitment-review__summary-value memory-commitment-review__summary-value--rejected">
                {summary.rejected}
              </span>
              <span className="memory-commitment-review__summary-label">Rejected</span>
            </div>
            <div className="memory-commitment-review__summary-item">
              <span className="memory-commitment-review__summary-value">
                {summary.pending}
              </span>
              <span className="memory-commitment-review__summary-label">Pending</span>
            </div>
          </div>
          <button
            type="button"
            className="memory-commitment-review__commit-all"
            onClick={commitAllApproved}
            disabled={summary.pending === 0}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2.5 7.25l3 3 6-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Commit all approved
          </button>
        </footer>
      ) : null}
    </div>
  );
}

function AgentTag({ agent }: { agent: CommitAgent }) {
  return <span className="memory-commit__agent">{agent}</span>;
}

type CommitGateProps = {
  variant?: "full" | "panel" | "chat";
};

export function MemoryCommitmentCommitGate({ variant = "full" }: CommitGateProps) {
  const groupPrefix = useId();
  const context = useMemoryCommitmentContext(variant !== "full");
  const [localChoices, setLocalChoices] = useState<
    Partial<Record<string, CommitChoice>>
  >({});
  const [localCommitted, setLocalCommitted] = useState(false);

  const choices = context?.choices ?? localChoices;
  const committed = context?.committed ?? localCommitted;
  const allChosen = context
    ? context.allChosen
    : COMMIT_BELIEFS.every((belief) => localChoices[belief.id] != null);
  const chosenCount = context
    ? context.chosenCount
    : COMMIT_BELIEFS.filter((belief) => localChoices[belief.id] != null).length;

  const handleChoice = useCallback(
    (beliefId: string, choice: CommitChoice) => {
      if (committed) return;
      if (context) {
        context.setChoice(beliefId, choice);
        return;
      }
      setLocalChoices((prev) => ({ ...prev, [beliefId]: choice }));
    },
    [committed, context],
  );

  const handleCommit = useCallback(() => {
    if (!allChosen || committed) return;
    if (context) {
      context.commit();
      return;
    }
    setLocalCommitted(true);
  }, [allChosen, committed, context]);

  return (
    <section
      className={`memory-commit__gate memory-commit__gate--${variant}${
        committed ? " memory-commit__gate--locked" : ""
      }`}
      aria-label="Memory commitment review"
    >
      <header className="memory-commit__gate-head">
        <div className="memory-commit__gate-head-row">
          <p className="memory-commit__gate-title">Commit to Cognitive Fabric</p>
          {!committed ? (
            <span className="memory-commit__gate-progress">
              {chosenCount}/{COMMIT_BELIEFS.length} reviewed
            </span>
          ) : null}
        </div>
        <p className="memory-commit__gate-sub">
          Review session beliefs before they become durable memory
        </p>
      </header>

      <ul className="memory-commit__gate-list">
        {COMMIT_BELIEFS.map((belief) => {
          const choice = choices[belief.id];
          const groupId = `${groupPrefix}-${belief.id}`;

          return (
            <li key={belief.id} className="memory-commit__gate-item">
              <article
                className={`memory-commit__belief memory-commit__belief--review${
                  belief.stale ? " memory-commit__belief--stale" : ""
                }${choice ? ` memory-commit__belief--chosen memory-commit__belief--${choice}` : ""}`}
              >
                <div className="memory-commit__belief-head">
                  <AgentTag agent={belief.agent} />
                  {belief.stale ? (
                    <span className="memory-commit__weight-label">Superseded</span>
                  ) : null}
                </div>
                <p className="memory-commit__belief-text">{belief.text}</p>

                {committed ? (
                  choice ? (
                    <p className="memory-commit__choice-log memory-commit__choice-log--locked">
                      {COMMIT_CHOICE_LABEL[choice]} · {COMMIT_CHOICE_LOG[choice]}
                    </p>
                  ) : null
                ) : (
                  <>
                    <div
                      className="memory-commit__choices"
                      role="radiogroup"
                      aria-labelledby={`${groupId}-label`}
                    >
                      <span
                        id={`${groupId}-label`}
                        className="memory-commit__choices-label"
                      >
                        Your choice
                      </span>
                      {CHOICES.map((option) => {
                        const selected = choice === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            className={`memory-commit__choice-btn${
                              selected ? " memory-commit__choice-btn--selected" : ""
                            }`}
                            role="radio"
                            aria-checked={selected}
                            onClick={() => handleChoice(belief.id, option)}
                          >
                            {COMMIT_CHOICE_LABEL[option]}
                          </button>
                        );
                      })}
                    </div>
                    {choice ? (
                      <p className="memory-commit__choice-log">
                        {COMMIT_CHOICE_LABEL[choice]} · {COMMIT_CHOICE_LOG[choice]}
                      </p>
                    ) : null}
                  </>
                )}
              </article>
            </li>
          );
        })}
      </ul>

      <footer className="memory-commit__gate-foot">
        {committed ? (
          <p className="memory-commit__committed">
            Committed to Cognitive Fabric · {COMMIT_BELIEFS.length} beliefs recorded
          </p>
        ) : (
          <button
            type="button"
            className="memory-commit__commit-btn"
            disabled={!allChosen}
            onClick={handleCommit}
          >
            Commit to memory
          </button>
        )}
      </footer>
    </section>
  );
}

export type MemoryCommitmentReviewProps = {
  compact?: boolean;
  beliefs?: Belief[];
  onBeliefsChange?: (beliefs: Belief[]) => void;
};

export function MemoryCommitmentReview({
  compact = false,
  beliefs,
  onBeliefsChange,
}: MemoryCommitmentReviewProps) {
  return (
    <div className="memory-commitment-review-shell">
      <MemoryCommitmentReviewBody
        beliefs={beliefs}
        onBeliefsChange={onBeliefsChange}
        showSummary={!compact}
        variant="standalone"
      />
    </div>
  );
}

export function MemoryCommitmentInContext() {
  return <PlatformRunbookDemo embedded />;
}

/** Registry alias for in-context / panel previews. */
export const MemoryCommitmentPanel = MemoryCommitmentInContext;

/** @deprecated Use MemoryCommitmentReviewBody in panel contexts */
export function MemoryCommitmentInContextPanel() {
  return (
    <MemoryCommitmentReviewBody
      showSummary={false}
      variant="panel"
      beliefs={MOCK_BELIEFS}
    />
  );
}

/** @deprecated Use MemoryCommitmentReviewList naming */
export const MemoryCommitmentReviewList = MemoryCommitmentReviewBody;
