"use client";

import {
  useCallback,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from "react";
import {
  AGENT_BRANCH_HUES,
  AGENT_BRANCHES,
  CASE_ID,
  HEADER_LINE,
  SHARED_CONTEXT,
  basisContextId,
  basisLine,
  type AgentBranch,
  type AgentBranchHue,
  type AssumptionSeed,
  type ContextItem,
} from "@/lib/assumption-surface-data";

type CorrectedAssumption = {
  claim: string;
  correctedByPerson: true;
};

type HighlightState = {
  contextId: string;
  branchId: string;
} | null;

const MAX_CONTEXT_ONLY = Math.max(
  ...AGENT_BRANCHES.map((branch) => branch.contextOnly.length),
);
const MAX_ASSUMPTIONS = Math.max(
  ...AGENT_BRANCHES.map((branch) => branch.assumptions.length),
);

/** agent + context block + assumptions block + interpretation block */
const BRANCH_GRID_ROW_COUNT = 4;

const SHARED_CONTEXT_IDS = new Set(SHARED_CONTEXT.map((item) => item.id));

const TRUNK_GRID: ContextItem[][] = [
  [SHARED_CONTEXT[0], SHARED_CONTEXT[1]],
  [SHARED_CONTEXT[2], SHARED_CONTEXT[3]],
];

function agentHueStyle(hue: AgentBranchHue): CSSProperties {
  return {
    "--as-agent-line": hue.line,
    "--as-agent-soft": hue.soft,
    "--as-agent-border": hue.border,
  } as CSSProperties;
}

function TrunkContextCell({
  item,
  highlighted,
  hue,
}: {
  item: ContextItem;
  highlighted: boolean;
  hue: AgentBranchHue | null;
}) {
  return (
    <div
      className={`assumption-surface__trunk-cell${
        highlighted ? " assumption-surface__trunk-cell--highlighted" : ""
      }`}
      data-context-id={item.id}
      style={highlighted && hue ? agentHueStyle(hue) : undefined}
    >
      {item.label}
    </div>
  );
}

function PrivateContextRow({
  item,
  highlighted,
  hue,
}: {
  item: ContextItem;
  highlighted: boolean;
  hue: AgentBranchHue;
}) {
  return (
    <div
      className={`assumption-surface__private-row${
        highlighted ? " assumption-surface__private-row--highlighted" : ""
      }`}
      data-context-id={item.id}
      style={agentHueStyle(hue)}
    >
      {item.label}
    </div>
  );
}

function AssumptionCard({
  assumption,
  branchId,
  hue,
  corrected,
  editing,
  editDraft,
  onHighlight,
  onClearHighlight,
  onStartEdit,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
}: {
  assumption: AssumptionSeed;
  branchId: string;
  hue: AgentBranchHue;
  corrected?: CorrectedAssumption;
  editing: boolean;
  editDraft: string;
  onHighlight: (contextId: string | null, branchId: string) => void;
  onClearHighlight: () => void;
  onStartEdit: () => void;
  onEditDraftChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  const basis = assumption.basis;
  const grounded = basis.kind === "derived";
  const displayClaim = corrected?.claim ?? assumption.claim;
  const contextId = basisContextId(basis);

  const bindHighlight = {
    onMouseEnter: () => onHighlight(contextId, branchId),
    onMouseLeave: onClearHighlight,
    onFocus: () => onHighlight(contextId, branchId),
    onBlur: (event: FocusEvent<HTMLButtonElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        onClearHighlight();
      }
    },
  };

  return (
    <div
      className={`assumption-surface__assumption${
        grounded
          ? " assumption-surface__assumption--grounded"
          : " assumption-surface__assumption--unfounded"
      }${corrected ? " assumption-surface__assumption--corrected" : ""}`}
      style={corrected ? agentHueStyle(hue) : undefined}
      tabIndex={editing ? -1 : 0}
      onMouseEnter={() => onHighlight(contextId, branchId)}
      onMouseLeave={onClearHighlight}
      onFocusCapture={() => onHighlight(contextId, branchId)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onClearHighlight();
        }
      }}
    >
      {editing ? (
        <div className="assumption-surface__edit">
          <label className="assumption-surface__edit-label" htmlFor={`edit-${assumption.id}`}>
            Correct assumption
          </label>
          <textarea
            id={`edit-${assumption.id}`}
            className="assumption-surface__edit-input"
            rows={2}
            value={editDraft}
            onChange={(event) => onEditDraftChange(event.target.value)}
          />
          <div className="assumption-surface__edit-actions">
            <button
              type="button"
              className="assumption-surface__btn assumption-surface__btn--primary"
              onClick={onSaveEdit}
            >
              Save
            </button>
            <button
              type="button"
              className="assumption-surface__btn"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="assumption-surface__assumption-claim">{displayClaim}</p>
          <div className="assumption-surface__assumption-meta">
            <p className="assumption-surface__assumption-basis">{basisLine(basis)}</p>
            {corrected ? (
              <span className="assumption-surface__person-tag">Set by a person</span>
            ) : (
              <button
                type="button"
                className="assumption-surface__correct-btn"
                onClick={onStartEdit}
                {...bindHighlight}
              >
                Correct
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function InterpretationBlock({
  branch,
  hue,
  stale,
  pendingRederive,
  onRederive,
}: {
  branch: AgentBranch;
  hue: AgentBranchHue;
  stale: boolean;
  pendingRederive: boolean;
  onRederive: () => void;
}) {
  return (
    <div
      className={`assumption-surface__interpretation${
        stale ? " assumption-surface__interpretation--stale" : ""
      }${pendingRederive ? " assumption-surface__interpretation--pending" : ""}`}
      style={!stale ? agentHueStyle(hue) : undefined}
    >
      <p className="assumption-surface__interpretation-conclusion">
        {branch.interpretation.conclusion}
      </p>
      {stale ? (
        <>
          <p className="assumption-surface__interpretation-stale-note">
            Rests on a corrected assumption
          </p>
          {pendingRederive ? (
            <p className="assumption-surface__interpretation-pending">
              Re-derivation pending
            </p>
          ) : (
            <button
              type="button"
              className="assumption-surface__rederive-btn"
              onClick={onRederive}
            >
              Re-derive
            </button>
          )}
        </>
      ) : null}
    </div>
  );
}

function LayerLabel({ children }: { children: ReactNode }) {
  return <p className="assumption-surface__layer-label">{children}</p>;
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="assumption-surface__section-header">
      <LayerLabel>{children}</LayerLabel>
    </div>
  );
}

function PrivateContextSection({
  branch,
  hue,
  highlight,
}: {
  branch: AgentBranch;
  hue: AgentBranchHue;
  highlight: HighlightState;
}) {
  return (
    <div className="assumption-surface__context-section">
      <SectionHeader>Context only this agent holds</SectionHeader>
      <ul className="assumption-surface__context-list">
        {Array.from({ length: MAX_CONTEXT_ONLY }, (_, index) => {
          const item = branch.contextOnly[index];
          if (!item) {
            return (
              <li
                key={`ctx-pad-${branch.id}-${index}`}
                className="assumption-surface__private-row assumption-surface__private-row--pad"
                aria-hidden
              />
            );
          }
          const isHighlighted =
            highlight?.contextId === item.id && highlight.branchId === branch.id;
          return (
            <li key={item.id} className="assumption-surface__context-list-item">
              <PrivateContextRow
                item={item}
                highlighted={isHighlighted}
                hue={hue}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AssumptionsSection({
  branch,
  hue,
  correctedMap,
  editingId,
  editDraft,
  onHighlight,
  onClearHighlight,
  onStartEdit,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
}: {
  branch: AgentBranch;
  hue: AgentBranchHue;
  correctedMap: Record<string, CorrectedAssumption>;
  editingId: string | null;
  editDraft: string;
  onHighlight: (contextId: string | null, branchId: string) => void;
  onClearHighlight: () => void;
  onStartEdit: (assumptionId: string, draft: string) => void;
  onEditDraftChange: (value: string) => void;
  onSaveEdit: (assumptionId: string) => void;
  onCancelEdit: () => void;
}) {
  return (
    <div className="assumption-surface__assumptions-section">
      <SectionHeader>Assumptions made</SectionHeader>
      <ul className="assumption-surface__assumptions-list">
        {Array.from({ length: MAX_ASSUMPTIONS }, (_, index) => {
          const assumption = branch.assumptions[index];
          if (!assumption) {
            return (
              <li
                key={`asm-pad-${branch.id}-${index}`}
                className="assumption-surface__assumptions-list-item assumption-surface__assumptions-list-item--pad"
                aria-hidden
              />
            );
          }
          return (
            <li key={assumption.id} className="assumption-surface__assumptions-list-item">
              <AssumptionCard
                assumption={assumption}
                branchId={branch.id}
                hue={hue}
                corrected={correctedMap[assumption.id]}
                editing={editingId === assumption.id}
                editDraft={editDraft}
                onHighlight={onHighlight}
                onClearHighlight={onClearHighlight}
                onStartEdit={() =>
                  onStartEdit(
                    assumption.id,
                    correctedMap[assumption.id]?.claim ?? assumption.claim,
                  )
                }
                onEditDraftChange={onEditDraftChange}
                onSaveEdit={() => onSaveEdit(assumption.id)}
                onCancelEdit={onCancelEdit}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function InterpretationSection({
  branch,
  hue,
  stale,
  pendingRederive,
  onRederive,
}: {
  branch: AgentBranch;
  hue: AgentBranchHue;
  stale: boolean;
  pendingRederive: boolean;
  onRederive: () => void;
}) {
  return (
    <div className="assumption-surface__interpretation-section">
      <SectionHeader>Interpretation drawn</SectionHeader>
      <InterpretationBlock
        branch={branch}
        hue={hue}
        stale={stale}
        pendingRederive={pendingRederive}
        onRederive={onRederive}
      />
    </div>
  );
}

function BranchLayerRow({
  branchIndex,
  rowIndex,
  hue,
  branchStart,
  groupStart,
  hideTick,
  isLastRow,
  pad,
  children,
}: {
  branchIndex: number;
  rowIndex: number;
  hue: AgentBranchHue;
  branchStart?: boolean;
  groupStart?: boolean;
  hideTick?: boolean;
  isLastRow?: boolean;
  pad?: boolean;
  children?: ReactNode;
}) {
  const gridColumn = branchIndex === 0 ? 1 : 3;
  const mobileRow = branchIndex === 0 ? rowIndex : rowIndex + BRANCH_GRID_ROW_COUNT;
  return (
    <div
      className={`assumption-surface__branch-col${
        branchStart ? " assumption-surface__branch-col--branch-start" : ""
      }${isLastRow ? " assumption-surface__branch-col--last" : ""}${
        pad ? " assumption-surface__branch-col--pad" : ""
      }`}
      style={{
        ...agentHueStyle(hue),
        gridColumn,
        gridRow: rowIndex,
        "--as-row-mobile": mobileRow,
      } as CSSProperties}
      aria-hidden={pad ? true : undefined}
    >
      {pad ? null : (
        <div
          className={`assumption-surface__layer-row${
            groupStart ? " assumption-surface__layer-row--group-start" : ""
          }${hideTick ? " assumption-surface__layer-row--no-tick" : ""}`}
        >
          {!hideTick ? (
            <span className="assumption-surface__layer-tick" aria-hidden />
          ) : null}
          <div className="assumption-surface__layer-content">{children}</div>
        </div>
      )}
    </div>
  );
}

function AssumptionSurfaceBody({ compact = false }: { compact?: boolean }) {
  const [highlight, setHighlight] = useState<HighlightState>(null);
  const [correctedMap, setCorrectedMap] = useState<
    Record<string, CorrectedAssumption>
  >({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [pendingRederive, setPendingRederive] = useState<Record<string, boolean>>(
    {},
  );
  const sharedHeadingId = useId();

  const gridTemplateRows = useMemo(
    () => Array.from({ length: BRANCH_GRID_ROW_COUNT }, () => "auto").join(" "),
    [],
  );

  const mobileGridTemplateRows = useMemo(
    () =>
      Array.from({ length: BRANCH_GRID_ROW_COUNT * 2 }, () => "auto").join(" "),
    [],
  );

  let rowIndex = 1;
  const agentRow = rowIndex;
  rowIndex += 1;
  const contextBlockRow = rowIndex;
  rowIndex += 1;
  const assumptionsBlockRow = rowIndex;
  rowIndex += 1;
  const interpretationBlockRow = rowIndex;

  const handleHighlight = useCallback(
    (contextId: string | null, branchId: string) => {
      if (!contextId) {
        setHighlight(null);
        return;
      }
      setHighlight({ contextId, branchId });
    },
    [],
  );

  const handleSaveEdit = useCallback(
    (assumptionId: string) => {
      const trimmed = editDraft.trim();
      if (!trimmed) return;
      setCorrectedMap((prev) => ({
        ...prev,
        [assumptionId]: { claim: trimmed, correctedByPerson: true },
      }));
      setEditingId(null);
      setEditDraft("");
      setPendingRederive((prev) => {
        const next = { ...prev };
        for (const branch of AGENT_BRANCHES) {
          if (branch.assumptions.some((item) => item.id === assumptionId)) {
            next[branch.id] = false;
          }
        }
        return next;
      });
    },
    [editDraft],
  );

  const handleRederive = useCallback((branchId: string) => {
    setPendingRederive((prev) => ({ ...prev, [branchId]: true }));
  }, []);

  const handleReset = useCallback(() => {
    setHighlight(null);
    setCorrectedMap({});
    setEditingId(null);
    setEditDraft("");
    setPendingRederive({});
  }, []);

  return (
    <div className={`assumption-surface${compact ? " assumption-surface--compact" : ""}`}>
      <header className="assumption-surface__header">
        <span className="assumption-surface__case-id">{CASE_ID}</span>
        <p className="assumption-surface__header-line">{HEADER_LINE}</p>
      </header>

      <section
        className="assumption-surface__trunk"
        aria-labelledby={sharedHeadingId}
      >
        <div className="assumption-surface__trunk-head">
          <p className="assumption-surface__layer-label" id={sharedHeadingId}>
            Context held by both
          </p>
          <span className="assumption-surface__trunk-count">
            {SHARED_CONTEXT.length} items
          </span>
        </div>
        <div className="assumption-surface__trunk-body">
          {TRUNK_GRID.map((row, rowIndex) => (
            <div key={`trunk-row-${rowIndex}`} className="assumption-surface__trunk-grid-row">
              {row.map((item) => {
                const isHighlighted =
                  highlight?.contextId === item.id &&
                  SHARED_CONTEXT_IDS.has(item.id);
                const hue = highlight?.branchId
                  ? AGENT_BRANCH_HUES[highlight.branchId]
                  : null;
                return (
                  <TrunkContextCell
                    key={item.id}
                    item={item}
                    highlighted={isHighlighted}
                    hue={isHighlighted ? hue : null}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <div className="assumption-surface__stage">
        <div
          className="assumption-surface__drops"
          style={{ gridTemplateColumns: "1fr 1.25rem 1fr" }}
          aria-hidden
        >
          {AGENT_BRANCHES.map((branch) => (
            <div
              key={branch.id}
              className="assumption-surface__drop"
              style={{
                ...agentHueStyle(AGENT_BRANCH_HUES[branch.id]),
                gridColumn: branch.id === "refund" ? 1 : 3,
              }}
            />
          ))}
        </div>

        <div
          className="assumption-surface__grid"
          style={{
            gridTemplateColumns: "1fr 1.25rem 1fr",
            gridTemplateRows,
            "--as-mobile-rows": mobileGridTemplateRows,
          } as CSSProperties}
        >
          {AGENT_BRANCHES.map((branch, branchIndex) => (
            <div
              key={`rail-${branch.id}`}
              className="assumption-surface__branch-rail"
              aria-hidden
              style={{
                ...agentHueStyle(AGENT_BRANCH_HUES[branch.id]),
                gridColumn: branchIndex === 0 ? 1 : 3,
                gridRow: `1 / ${interpretationBlockRow + 1}`,
              }}
            />
          ))}

          {AGENT_BRANCHES.map((branch, branchIndex) => {
            const hue = AGENT_BRANCH_HUES[branch.id];
            return (
              <BranchLayerRow
                key={`agent-${branch.id}`}
                branchIndex={branchIndex}
                rowIndex={agentRow}
                hue={hue}
                branchStart={branchIndex === 1}
              >
                <p
                  className="assumption-surface__agent-name"
                  style={{ color: hue.line }}
                >
                  {branch.agentName}
                </p>
              </BranchLayerRow>
            );
          })}

          {AGENT_BRANCHES.map((branch, branchIndex) => (
            <BranchLayerRow
              key={`ctx-${branch.id}`}
              branchIndex={branchIndex}
              rowIndex={contextBlockRow}
              hue={AGENT_BRANCH_HUES[branch.id]}
              groupStart
              hideTick
            >
              <PrivateContextSection
                branch={branch}
                hue={AGENT_BRANCH_HUES[branch.id]}
                highlight={highlight}
              />
            </BranchLayerRow>
          ))}

          {AGENT_BRANCHES.map((branch, branchIndex) => (
            <BranchLayerRow
              key={`asm-${branch.id}`}
              branchIndex={branchIndex}
              rowIndex={assumptionsBlockRow}
              hue={AGENT_BRANCH_HUES[branch.id]}
              groupStart
              hideTick
            >
              <AssumptionsSection
                branch={branch}
                hue={AGENT_BRANCH_HUES[branch.id]}
                correctedMap={correctedMap}
                editingId={editingId}
                editDraft={editDraft}
                onHighlight={handleHighlight}
                onClearHighlight={() => setHighlight(null)}
                onStartEdit={(assumptionId, draft) => {
                  setEditingId(assumptionId);
                  setEditDraft(draft);
                }}
                onEditDraftChange={setEditDraft}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditDraft("");
                }}
              />
            </BranchLayerRow>
          ))}

          {AGENT_BRANCHES.map((branch, branchIndex) => {
            const hue = AGENT_BRANCH_HUES[branch.id];
            const hasCorrected = branch.assumptions.some(
              (item) => correctedMap[item.id],
            );
            return (
              <BranchLayerRow
                key={`interp-${branch.id}`}
                branchIndex={branchIndex}
                rowIndex={interpretationBlockRow}
                hue={hue}
                groupStart
                hideTick
                isLastRow
              >
                <InterpretationSection
                  branch={branch}
                  hue={hue}
                  stale={hasCorrected}
                  pendingRederive={Boolean(pendingRederive[branch.id])}
                  onRederive={() => handleRederive(branch.id)}
                />
              </BranchLayerRow>
            );
          })}
        </div>
      </div>

      <footer className="assumption-surface__footer">
        <button type="button" className="assumption-surface__reset-btn" onClick={handleReset}>
          Reset
        </button>
      </footer>
    </div>
  );
}

export function AssumptionSurface({ compact: compactProp = false }: { compact?: boolean }) {
  const [compactLocal, setCompactLocal] = useState(compactProp);
  const compact = compactProp || compactLocal;

  return (
    <div className="assumption-surface-wide">
      {!compactProp ? (
        <label className="assumption-surface__compact-toggle">
          <input
            type="checkbox"
            checked={compactLocal}
            onChange={(event) => setCompactLocal(event.target.checked)}
          />
          compact
        </label>
      ) : null}
      <div
        className={`assumption-surface-panel${
          compact ? " assumption-surface-panel--compact" : ""
        }`}
      >
        <AssumptionSurfaceBody compact={compact} />
      </div>
    </div>
  );
}
