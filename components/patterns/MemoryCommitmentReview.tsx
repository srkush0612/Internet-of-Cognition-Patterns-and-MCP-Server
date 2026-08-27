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
  STANDALONE_BELIEFS,
  STANDALONE_SCENARIO,
  type CommitAgent,
  type CommitChoice,
  type StandaloneBelief,
} from "@/lib/memory-commitment-data";
import { AcmeRenewalDemo } from "@/components/demos/acme-renewal/AcmeRenewalDemo";
import { PatternComponentCard } from "./PatternComponentCard";
import { PatternPanelCard } from "./PatternPanelCard";
import { LockIcon } from "./icons";

const CHOICES: CommitChoice[] = ["acknowledge", "restore", "revoke"];

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

function AgentTag({ agent }: { agent: CommitAgent }) {
  return <span className="memory-commit__agent">{agent}</span>;
}

function StandaloneBeliefRow({
  belief,
  showShift,
  shiftNote,
}: {
  belief: StandaloneBelief;
  showShift?: boolean;
  shiftNote?: string;
}) {
  return (
    <>
      {showShift && shiftNote ? (
        <p className="memory-commit__shift-note">{shiftNote}</p>
      ) : null}
      <article
        className={`memory-commit__belief memory-commit__belief--${belief.weight}`}
      >
        <AgentTag agent={belief.agent} />
        <p className="memory-commit__belief-text">{belief.text}</p>
        {belief.weight === "stale" ? (
          <span className="memory-commit__weight-label">Stale</span>
        ) : belief.weight === "operative" ? (
          <span className="memory-commit__weight-label">Operative</span>
        ) : null}
      </article>
    </>
  );
}

function StalenessBody({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`memory-commit${compact ? " memory-commit--compact" : ""}`}>
      <p className="memory-commit__scenario">{STANDALONE_SCENARIO.title}</p>
      <div className="memory-commit__belief-stack">
        {STANDALONE_BELIEFS.map((belief, index) => (
          <StandaloneBeliefRow
            key={belief.id}
            belief={belief}
            showShift={index === 1}
            shiftNote={index === 1 ? STANDALONE_SCENARIO.shiftNote : undefined}
          />
        ))}
      </div>
    </div>
  );
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

export function MemoryCommitmentInContextPanel() {
  return (
    <PatternPanelCard title="Memory Commitment Review" statusTag="4 beliefs">
      <MemoryCommitmentCommitGate variant="panel" />
    </PatternPanelCard>
  );
}

export function MemoryCommitmentReview({ compact = false }: { compact?: boolean }) {
  return (
    <PatternComponentCard
      patternKey="MemoryCommitmentReview"
      dotColor="#3b5ec6"
      title="When beliefs shift, mark what's stale"
      contextLabel="Acme Renewal · pricing"
      icon={<LockIcon size={compact ? 15 : 18} />}
      footerLeft="Staleness surfaced inline · commitment gated at session end"
      footerRight="beat 7"
      compact={compact}
    >
      <StalenessBody compact={compact} />
    </PatternComponentCard>
  );
}

export function MemoryCommitmentInContext() {
  return (
    <MemoryCommitmentProvider>
      <AcmeRenewalDemo embedded demoFocus="memory-commitment" />
    </MemoryCommitmentProvider>
  );
}

/** Registry alias for in-context / panel previews. */
export const MemoryCommitmentPanel = MemoryCommitmentInContext;
