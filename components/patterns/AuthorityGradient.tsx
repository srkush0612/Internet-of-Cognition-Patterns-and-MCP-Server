"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { PatternComponentCard } from "./PatternComponentCard";
import { PatternPanelCard } from "./PatternPanelCard";
import { LockIcon } from "./icons";
import { AcmeRenewalDemo } from "@/components/demos/acme-renewal/AcmeRenewalDemo";

const LEVELS = ["Suggest", "Ask first", "Act + review", "Act alone"] as const;

type AutonomyLevel = 0 | 1 | 2 | 3;
type RiskTone = "low" | "mid" | "high";
type OriginKind = "agent" | "operator" | "operator-adjusted";
type AuthorityVariant = "standalone" | "panel";

type WorkflowRow = {
  id: string;
  workflow: string;
  level: AutonomyLevel;
  tone: RiskTone;
  origin: OriginKind;
};

type AgentGroup = {
  agent: string;
  rows: WorkflowRow[];
};

const ACME_RENEWAL_GROUPS: AgentGroup[] = [
  {
    agent: "Finance Agent",
    rows: [
      {
        id: "finance-approve-discount",
        workflow: "Approve discount",
        level: 2,
        tone: "mid",
        origin: "agent",
      },
      {
        id: "finance-escalate-director",
        workflow: "Escalate to Director",
        level: 1,
        tone: "high",
        origin: "operator",
      },
      {
        id: "finance-compute-models",
        workflow: "Compute models",
        level: 3,
        tone: "low",
        origin: "operator",
      },
      {
        id: "finance-pricing-baseline",
        workflow: "Set baseline",
        level: 2,
        tone: "mid",
        origin: "agent",
      },
    ],
  },
  {
    agent: "Customer Success Agent",
    rows: [
      {
        id: "cs-account-health",
        workflow: "Assess health",
        level: 3,
        tone: "low",
        origin: "operator",
      },
      {
        id: "cs-churn-signals",
        workflow: "Validate churn",
        level: 2,
        tone: "mid",
        origin: "agent",
      },
      {
        id: "cs-cross-account",
        workflow: "Build patterns",
        level: 3,
        tone: "low",
        origin: "operator",
      },
    ],
  },
  {
    agent: "Salesforce Agent",
    rows: [
      {
        id: "sf-update-crm",
        workflow: "Update CRM",
        level: 3,
        tone: "low",
        origin: "operator",
      },
      {
        id: "sf-data-quality",
        workflow: "Flag quality",
        level: 2,
        tone: "mid",
        origin: "agent",
      },
      {
        id: "sf-sync-forecast",
        workflow: "Sync forecast",
        level: 2,
        tone: "mid",
        origin: "operator",
      },
    ],
  },
];

function cloneGroups(groups: AgentGroup[]): AgentGroup[] {
  return groups.map((group) => ({
    ...group,
    rows: group.rows.map((row) => ({ ...row })),
  }));
}

function originLabel(origin: OriginKind): string {
  switch (origin) {
    case "agent":
      return "Set by: agent";
    case "operator":
      return "Set by: operator";
    case "operator-adjusted":
      return "Set by: operator-adjusted";
  }
}

function riskLabel(tone: RiskTone): string {
  if (tone === "low") return "Low";
  if (tone === "mid") return "Mid";
  return "High";
}

function LevelTrack({
  row,
  compact,
}: {
  row: WorkflowRow;
  compact?: boolean;
}) {
  return (
    <div
      className={`authority__track authority__track--${row.tone}`}
      role="img"
      aria-label={`${row.workflow}: ${LEVELS[row.level]}`}
    >
      {LEVELS.map((label, index) => (
        <span
          key={label}
          className={`authority__seg${
            index <= row.level ? " authority__seg--filled" : ""
          }${index === row.level ? " authority__seg--current" : ""}`}
        />
      ))}
      {compact ? (
        <span className="authority__value authority__value--compact">
          {LEVELS[row.level]}
        </span>
      ) : null}
    </div>
  );
}

function LevelPicker({
  rowId,
  currentLevel,
  onSelect,
}: {
  rowId: string;
  currentLevel: AutonomyLevel;
  onSelect: (level: AutonomyLevel) => void;
}) {
  const groupId = useId();

  return (
    <div
      className="authority__level-picker"
      role="radiogroup"
      aria-labelledby={`${groupId}-label`}
    >
      <span id={`${groupId}-label`} className="authority__level-picker-label">
        Autonomy level
      </span>
      {LEVELS.map((label, index) => {
        const level = index as AutonomyLevel;
        const selected = level === currentLevel;
        return (
          <button
            key={`${rowId}-${label}`}
            type="button"
            className={`authority__level-btn${
              selected ? " authority__level-btn--selected" : ""
            }`}
            role="radio"
            aria-checked={selected}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(level);
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function PanelLevelStrip({ level }: { level: AutonomyLevel }) {
  return (
    <span className="authority__panel-strip" aria-hidden>
      {LEVELS.map((label, index) => (
        <span
          key={label}
          className={`authority__panel-strip-seg${
            index <= level ? " authority__panel-strip-seg--filled" : ""
          }${index === level ? " authority__panel-strip-seg--current" : ""}`}
        />
      ))}
    </span>
  );
}

function PanelWorkflowRow({
  row,
  isEditing,
  readOnly = false,
  onOpen,
  onSelectLevel,
}: {
  row: WorkflowRow;
  isEditing: boolean;
  readOnly?: boolean;
  onOpen: () => void;
  onSelectLevel: (level: AutonomyLevel) => void;
}) {
  const groupId = useId();

  return (
    <article
      className={`authority__panel-card${
        isEditing ? " authority__panel-card--editing" : ""
      }`}
      data-row-id={row.id}
    >
      <header className="authority__panel-card-head">
        <span className="authority__domain">{row.workflow}</span>
      </header>

      {readOnly ? (
        <div
          className="authority__panel-level authority__panel-level--readonly"
          role="img"
          aria-label={`${row.workflow}, ${LEVELS[row.level]}`}
        >
          <PanelLevelStrip level={row.level} />
          <span className="authority__panel-level-text">{LEVELS[row.level]}</span>
        </div>
      ) : isEditing ? (
        <div
          className="authority__panel-picker"
          role="radiogroup"
          aria-labelledby={`${groupId}-label`}
        >
          <span id={`${groupId}-label`} className="authority__level-picker-label">
            Autonomy level
          </span>
          {LEVELS.map((label, index) => {
            const level = index as AutonomyLevel;
            const selected = level === row.level;
            return (
              <button
                key={`${row.id}-${label}`}
                type="button"
                className={`authority__panel-picker-btn${
                  selected ? " authority__panel-picker-btn--selected" : ""
                }`}
                role="radio"
                aria-checked={selected}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectLevel(level);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        <button
          type="button"
          className="authority__panel-level"
          aria-label={`${row.workflow}, ${LEVELS[row.level]}. Click to adjust.`}
          onClick={onOpen}
        >
          <PanelLevelStrip level={row.level} />
          <span className="authority__panel-level-text">{LEVELS[row.level]}</span>
        </button>
      )}

      <footer className="authority__panel-card-foot">
        <span className="authority__origin">{originLabel(row.origin)}</span>
      </footer>
    </article>
  );
}

function WorkflowRowView({
  row,
  compact,
  panel = false,
  readOnly = false,
  isEditing,
  onOpen,
  onSelectLevel,
}: {
  row: WorkflowRow;
  compact?: boolean;
  panel?: boolean;
  readOnly?: boolean;
  isEditing: boolean;
  onOpen: () => void;
  onSelectLevel: (level: AutonomyLevel) => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isEditing) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  if (panel) {
    return (
      <PanelWorkflowRow
        row={row}
        isEditing={isEditing}
        readOnly={readOnly}
        onOpen={onOpen}
        onSelectLevel={onSelectLevel}
      />
    );
  }

  return (
    <div
      className={`authority__row${isEditing ? " authority__row--editing" : ""}`}
      data-row-id={row.id}
    >
      <div
        className="authority__row-main"
        role={isEditing ? undefined : "button"}
        tabIndex={isEditing ? -1 : 0}
        aria-expanded={isEditing}
        aria-label={`${row.workflow}, ${LEVELS[row.level]}. Click to adjust.`}
        onClick={isEditing ? undefined : onOpen}
        onKeyDown={handleKeyDown}
      >
        <span className="authority__domain">{row.workflow}</span>
        <span className={`authority__risk authority__risk--${row.tone}`}>
          {riskLabel(row.tone)}
        </span>
        {isEditing ? (
          <LevelPicker
            rowId={row.id}
            currentLevel={row.level}
            onSelect={onSelectLevel}
          />
        ) : (
          <LevelTrack row={row} compact={compact} />
        )}
        {!compact && !isEditing ? (
          <span className="authority__value">{LEVELS[row.level]}</span>
        ) : null}
      </div>
      <span className="authority__origin">{originLabel(row.origin)}</span>
    </div>
  );
}

function GradientBody({
  compact = false,
  variant = "standalone",
  readOnly = false,
}: {
  compact?: boolean;
  variant?: AuthorityVariant;
  readOnly?: boolean;
}) {
  const panel = variant === "panel";
  const [groups, setGroups] = useState<AgentGroup[]>(() =>
    cloneGroups(ACME_RENEWAL_GROUPS),
  );
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const updateRowLevel = useCallback((rowId: string, level: AutonomyLevel) => {
    if (readOnly) return;
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        rows: group.rows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                level,
                origin: "operator-adjusted",
              }
            : row,
        ),
      })),
    );
    setEditingRowId(null);
  }, [readOnly]);

  useEffect(() => {
    if (readOnly || !editingRowId) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (bodyRef.current?.contains(target)) {
        const editingRow = bodyRef.current.querySelector(
          `[data-row-id="${editingRowId}"]`,
        );
        if (editingRow?.contains(target)) {
          return;
        }
      }
      setEditingRowId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [editingRowId, readOnly]);

  const areaCount = groups.reduce((count, group) => count + group.rows.length, 0);

  return (
    <div
      ref={bodyRef}
      className={`authority${
        compact ? " authority--compact" : ""
      }${panel ? " authority--panel" : ""}${
        readOnly ? " authority--readonly" : ""
      }`}
      data-area-count={panel ? areaCount : undefined}
    >
      {!panel ? (
        <div className="authority__legend" aria-hidden>
          <span className="authority__legend-gap" />
          <span className="authority__legend-gap" />
          <div className="authority__legend-track">
            {LEVELS.map((label) => (
              <span key={label} className="authority__legend-item">
                {label}
              </span>
            ))}
          </div>
          <span className="authority__legend-gap" />
        </div>
      ) : null}

      <div className="authority__groups">
        {groups.map((group) => (
          <section key={group.agent} className="authority__group">
            <h3 className="authority__agent-name">{group.agent}</h3>
            <div className="authority__rows">
              {group.rows.map((row) => (
                <WorkflowRowView
                  key={row.id}
                  row={row}
                  compact={compact}
                  panel={panel}
                  readOnly={readOnly}
                  isEditing={!readOnly && editingRowId === row.id}
                  onOpen={() =>
                    setEditingRowId((current) =>
                      current === row.id ? null : row.id,
                    )
                  }
                  onSelectLevel={(level) => updateRowLevel(row.id, level)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {!panel ? (
        <p className="authority__note">
          Acme Renewal · per-area autonomy sized to risk. Click a row to tighten or
          loosen without pausing the agent.
        </p>
      ) : null}
    </div>
  );
}

export function AuthorityGradient({ compact = false }: { compact?: boolean }) {
  return (
    <PatternComponentCard
      patternKey="AuthorityGradient"
      dotColor="#3b5ec6"
      title="How much can this agent decide"
      contextLabel="Acme Renewal"
      icon={<LockIcon size={compact ? 15 : 18} />}
      footerLeft="Autonomy per area · adjustable anytime"
      footerRight="set 4m ago"
      compact={compact}
    >
      <GradientBody compact={compact} />
    </PatternComponentCard>
  );
}

export function AuthorityGradientInContext() {
  return (
    <PatternPanelCard title="Authority Gradient" statusTag="10 areas">
      <GradientBody variant="panel" readOnly />
    </PatternPanelCard>
  );
}

export function AuthorityGradientInbox() {
  return <AcmeRenewalDemo embedded />;
}

/** Registry alias for in-context / panel previews. */
export const AuthorityGradientPanel = AuthorityGradientInContext;
