"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  STATUS_COLORS,
  TIMELINE_AXIS,
  TIMELINE_OPTS,
  TIMELINE_TICKS,
  OVERSIGHT_DETAIL,
  eventToDetail,
  strandPathForAgents,
  strandYForAgents,
  type TimelineAgentMeta,
  type TimelineEvent,
  type TimelineNodeDetail,
} from "@/lib/convergence-timeline-data";
import {
  buildTimelineModel,
  demoTimelineModel,
} from "@/lib/convergence-timeline-from-workspace";
import { hasUserScenario } from "@/lib/pattern-live-preview";
import type { ConvergencePointWorkspaceState } from "@/lib/workspace-defaults";

function PersonIcon({
  cx,
  cy,
  scale,
  fill,
}: {
  cx: number;
  cy: number;
  scale: number;
  fill: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy - 1.4 * scale} r={1.5 * scale} fill={fill} />
      <path
        d={`M ${cx - 2.3 * scale},${cy + 2.6 * scale} C ${cx - 2.3 * scale},${cy - 0.3 * scale} ${cx + 2.3 * scale},${cy - 0.3 * scale} ${cx + 2.3 * scale},${cy + 2.6 * scale} Z`}
        fill={fill}
      />
    </g>
  );
}

function AgentDots({
  x,
  agreed,
  agents,
}: {
  x: number;
  agreed: string[];
  agents: TimelineAgentMeta[];
}) {
  if (agents.length === 0) return null;

  const spread = agents.length === 1 ? 0 : Math.min(24, (agents.length - 1) * 8);
  const xs = agents.map((_, index) =>
    agents.length === 1 ? x : x - spread / 2 + (spread * index) / (agents.length - 1),
  );

  return (
    <g>
      {agents.map((agent, index) => {
        const on = agreed.includes(agent.key);
        const dotKey = `dot-${index}-${agent.key}`;
        return on ? (
          <circle key={dotKey} cx={xs[index]} cy={178} r={2.5} fill={agent.color} />
        ) : (
          <circle
            key={dotKey}
            cx={xs[index]}
            cy={178}
            r={2.2}
            fill="#FFFFFF"
            stroke={agent.color}
            strokeWidth={1.1}
            opacity={0.9}
          />
        );
      })}
    </g>
  );
}

function MergeNode({
  ev,
  resolved,
  onSelect,
  highlighted,
  agents,
}: {
  ev: Extract<TimelineEvent, { kind: "merge" }>;
  resolved?: boolean;
  onSelect: (detail: TimelineNodeDetail, el: SVGGElement) => void;
  highlighted: boolean;
  agents: TimelineAgentMeta[];
}) {
  const r = ev.size === "lg" ? 11 : 8;
  const nodeId = ev.id ?? `merge-${ev.x}`;
  const detail = eventToDetail(ev, nodeId);

  return (
    <g
      className={`convergence__node${highlighted ? " convergence__node--highlight" : ""}`}
      data-node-id={nodeId}
      onClick={(e) => onSelect(detail, e.currentTarget)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(detail, e.currentTarget);
        }
      }}
    >
      <circle cx={ev.x} cy={TIMELINE_AXIS} r={20} fill="transparent" />
      <circle cx={ev.x} cy={TIMELINE_AXIS} r={resolved ? 9 : r} fill="#23A06B" />
      <text
        x={ev.x}
        y={TIMELINE_AXIS + (resolved || ev.size === "lg" ? 3.6 : 3)}
        fontSize={resolved || ev.size === "lg" ? 9 : 7.5}
        fill="#fff"
        textAnchor="middle"
        fontWeight={700}
      >
        ✓
      </text>
      {ev.human ? (
        <>
          <line
            x1={ev.x}
            y1={TIMELINE_AXIS + r}
            x2={ev.x}
            y2={262}
            stroke="#232946"
            strokeWidth={1}
            strokeDasharray="3,3"
            opacity={0.38}
          />
          <line
            x1={ev.x}
            y1={TIMELINE_AXIS - 15}
            x2={ev.x}
            y2={TIMELINE_AXIS - r}
            stroke="#232946"
            strokeWidth={1}
            opacity={0.4}
          />
          <circle
            cx={ev.x}
            cy={TIMELINE_AXIS - 25}
            r={9.5}
            fill="#FFFFFF"
            stroke="#232946"
            strokeWidth={1.3}
          />
          <circle cx={ev.x} cy={TIMELINE_AXIS - 25} r={7.5} fill="#232946" />
          <PersonIcon cx={ev.x} cy={TIMELINE_AXIS - 25} scale={1.5} fill="#FFFFFF" />
        </>
      ) : null}
      <AgentDots x={ev.x} agreed={ev.agreed} agents={agents} />
    </g>
  );
}

function PinchNode({
  ev,
  resolved,
  onSelect,
  highlighted,
  agents,
}: {
  ev: Extract<TimelineEvent, { kind: "pinch" }>;
  resolved: boolean;
  onSelect: (detail: TimelineNodeDetail, el: SVGGElement) => void;
  highlighted: boolean;
  agents: TimelineAgentMeta[];
}) {
  const nodeId = ev.id ?? `pinch-${ev.x}`;
  const detail = eventToDetail(ev, nodeId);

  if (resolved) {
    return (
      <g
        className={`convergence__node${highlighted ? " convergence__node--highlight" : ""}`}
        data-node-id={nodeId}
        onClick={(e) =>
          onSelect(
            {
              ...detail,
              status: "CONVERGED",
              time: "resolved",
              body: "Decision resolved by Chief Architect.",
              pending: false,
              options: undefined,
            },
            e.currentTarget,
          )
        }
        role="button"
        tabIndex={0}
      >
        <circle cx={ev.x} cy={TIMELINE_AXIS} r={20} fill="transparent" />
        <circle cx={ev.x} cy={TIMELINE_AXIS} r={9} fill="#23A06B" />
        <text
          x={ev.x}
          y={TIMELINE_AXIS + 3.2}
          fontSize={8}
          fill="#fff"
          textAnchor="middle"
          fontWeight={700}
        >
          ✓
        </text>
      </g>
    );
  }

  return (
    <g
      className={`convergence__node${highlighted ? " convergence__node--highlight" : ""}`}
      data-node-id={nodeId}
      onClick={(e) => onSelect(detail, e.currentTarget)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(detail, e.currentTarget);
        }
      }}
    >
      <circle cx={ev.x} cy={TIMELINE_AXIS} r={20} fill="transparent" />
      <circle cx={ev.x} cy={TIMELINE_AXIS} r={10} fill="none" stroke="#E0447B" strokeWidth={1.6} opacity={0.7}>
        <animate attributeName="r" values="7;22;7" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.75;0;0.75" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx={ev.x} cy={TIMELINE_AXIS} r={10} fill="none" stroke="#E0447B" strokeWidth={1.2} opacity={0.5}>
        <animate attributeName="r" values="7;22;7" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
      </circle>
      <circle cx={ev.x} cy={TIMELINE_AXIS} r={3.2} fill="#E0447B" opacity={0.9}>
        <animate attributeName="opacity" values="0.9;0.55;0.9" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle
        cx={ev.x}
        cy={TIMELINE_AXIS - 13}
        r={3}
        fill="none"
        stroke="#E0447B"
        strokeWidth={1.3}
        opacity={0.85}
      />
      <circle
        cx={ev.x}
        cy={TIMELINE_AXIS + 13}
        r={3}
        fill="none"
        stroke="#E0447B"
        strokeWidth={1.3}
        opacity={0.85}
      />
      <line
        x1={ev.x}
        y1={TIMELINE_AXIS - 9}
        x2={ev.x}
        y2={TIMELINE_AXIS + 9}
        stroke="#E0447B"
        strokeWidth={0.9}
        strokeDasharray="2,2.5"
        opacity={0.55}
      />
      <AgentDots x={ev.x} agreed={ev.agreed} agents={agents} />
    </g>
  );
}

function LaneNode({
  ev,
  agentIndex,
  onSelect,
  highlighted,
  agents,
}: {
  ev: Extract<TimelineEvent, { kind: "lane" }>;
  agentIndex: number;
  onSelect: (detail: TimelineNodeDetail, el: SVGGElement) => void;
  highlighted: boolean;
  agents: TimelineAgentMeta[];
}) {
  const y = strandYForAgents(agents, agentIndex, ev.x);
  const col = agents[agentIndex]?.color ?? "#5B57E0";
  const nodeId = ev.id ?? `lane-${ev.x}-${ev.agent}`;
  const detail = eventToDetail(ev, nodeId);

  return (
    <g
      className={`convergence__node${highlighted ? " convergence__node--highlight" : ""}`}
      data-node-id={nodeId}
      onClick={(e) => onSelect(detail, e.currentTarget)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(detail, e.currentTarget);
        }
      }}
    >
      <circle cx={ev.x} cy={y} r={13} fill="transparent" />
      {ev.dot === "fill" ? (
        <circle cx={ev.x} cy={y} r={4.5} fill={col} />
      ) : (
        <circle
          cx={ev.x}
          cy={y}
          r={4.5}
          fill="#FFFFFF"
          stroke={col}
          strokeWidth={1.7}
        />
      )}
    </g>
  );
}

function TimelineDetailPanel({
  detail,
  position,
  onClose,
  onResolve,
  agentColors,
}: {
  detail: TimelineNodeDetail;
  position: { left: number; top: number };
  onClose: () => void;
  onResolve: (dNum: number) => void;
  agentColors: Record<string, string>;
}) {
  const statusColor = STATUS_COLORS[detail.status] ?? "#9AA0B5";

  return (
    <>
      <button
        type="button"
        className="convergence__panel-overlay"
        aria-label="Close detail panel"
        onClick={onClose}
      />
      <div
        className="convergence__panel"
        style={{ left: position.left, top: position.top }}
        role="dialog"
        aria-labelledby="convergence-panel-title"
      >
        <button
          type="button"
          className="convergence__panel-close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
        <div id="convergence-panel-title" className="convergence__panel-title">
          {detail.title}
        </div>
        <div className="convergence__panel-meta">
          <span style={{ color: statusColor, fontWeight: 700 }}>
            {detail.status}
          </span>
          <span className="convergence__panel-meta-sep">·</span>
          <span className="convergence__panel-time">{detail.time}</span>
        </div>
        <p className="convergence__panel-body">{detail.body}</p>
        {detail.agreed?.length ? (
          <p className="convergence__panel-agents">
            <span className="convergence__panel-agents-label">Converged:</span>{" "}
            {detail.agreed.map((name, i) => (
              <span key={`agreed-${i}-${name}`}>
                {i > 0 ? ", " : ""}
                <span style={{ color: agentColors[name] ?? "#5B57E0", fontWeight: 600 }}>
                  {name}
                </span>
              </span>
            ))}
            {detail.dissent?.length ? (
              <>
                {" "}
                ·{" "}
                <span className="convergence__panel-agents-label">
                  {detail.dissentLabel ?? "Diverged"}:
                </span>{" "}
                {detail.dissent.map((name, i) => (
                  <span key={`dissent-${i}-${name}`}>
                    {i > 0 ? ", " : ""}
                    <span style={{ color: agentColors[name] ?? "#5B57E0", fontWeight: 600 }}>
                      {name}
                    </span>
                  </span>
                ))}
              </>
            ) : null}
          </p>
        ) : null}
        {detail.human ? (
          <div className="convergence__panel-human">
            <svg width={15} height={15} viewBox="0 0 16 16" aria-hidden>
              <circle cx={8} cy={5.2} r={2.8} fill="#232946" />
              <path
                d="M2.8 14 C2.8 9.6 13.2 9.6 13.2 14 Z"
                fill="#232946"
              />
            </svg>
            Chief Architect reviewed &amp; approved this decision
          </div>
        ) : null}
        {detail.pending && detail.options?.length ? (
          <div className="convergence__panel-actions">
            {detail.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="convergence__panel-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (detail.dNum != null) onResolve(detail.dNum);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : detail.thread ? (
          <button type="button" className="convergence__panel-thread">
            View reasoning in thread →
          </button>
        ) : null}
        <div className="convergence__panel-footer">
          <input
            type="text"
            className="convergence__panel-input"
            placeholder="Message the agents..."
            onClick={(e) => e.stopPropagation()}
          />
          <button type="button" className="convergence__panel-send">
            Send
          </button>
        </div>
      </div>
    </>
  );
}

export function ConvergenceTimeline({
  compact = false,
  workspace,
}: {
  compact?: boolean;
  workspace?: ConvergencePointWorkspaceState & Record<string, unknown>;
}) {
  const fadeId = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<TimelineNodeDetail | null>(null);
  const [panelPos, setPanelPos] = useState({ left: 0, top: 0 });
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [resolvedPinches, setResolvedPinches] = useState<Set<number>>(
    () => new Set(),
  );

  const model = useMemo(() => {
    if (workspace && hasUserScenario("convergence-point", workspace)) {
      const built = buildTimelineModel(workspace);
      if (built.agents.length > 0) {
        return built;
      }
    }
    return demoTimelineModel();
  }, [workspace]);

  const { agents, events, convergedSidebar, divergedSidebar, originDetail, agentColors } =
    model;

  const paths = useMemo(
    () => agents.map((_, index) => strandPathForAgents(agents, index)),
    [agents],
  );

  const divergedCount =
    divergedSidebar.length -
    divergedSidebar.filter((item) => resolvedPinches.has(item.dNum)).length;

  const closePanel = useCallback(() => {
    setSelected(null);
    setHighlightId(null);
  }, []);

  const openPanel = useCallback(
    (detail: TimelineNodeDetail, el: SVGGElement) => {
      const rect = el.getBoundingClientRect();
      const pw = 340;
      const ph = 320;
      let left = rect.left + rect.width / 2 - 44;
      let top = rect.top - ph - 12;
      if (top < 10) top = rect.bottom + 12;
      left = Math.max(10, Math.min(left, window.innerWidth - pw - 10));
      top = Math.max(10, Math.min(top, window.innerHeight - ph - 10));
      setPanelPos({ left, top });
      setSelected(detail);
      setHighlightId(detail.nodeId);
    },
    [],
  );

  const handleResolve = useCallback(
    (dNum: number) => {
      setResolvedPinches((prev) => new Set(prev).add(dNum));
      closePanel();
    },
    [closePanel],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePanel]);

  const handleSvgClick = (e: ReactMouseEvent) => {
    if ((e.target as Element).closest(".convergence__node")) return;
    closePanel();
  };

  return (
    <div
      className={`convergence${compact ? " convergence--compact" : ""}`}
    >
      <div className="convergence__layout">
        <div className="convergence__main">
          <svg
            ref={svgRef}
            id="convergenceTimelineSvg"
            viewBox="0 0 1000 300"
            className="convergence__svg"
            onClick={handleSvgClick}
          >
            <defs>
              <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity={1} />
              </linearGradient>
            </defs>

            {TIMELINE_TICKS.map(([x, label]) => (
              <text
                key={label}
                x={x}
                y={20}
                className="convergence__tick"
              >
                {label}
              </text>
            ))}
            <line
              x1={95}
              y1={28}
              x2={920}
              y2={28}
              stroke="rgba(35,41,70,0.08)"
              strokeWidth={0.6}
            />

            <g
              className={`convergence__node${highlightId === "origin" ? " convergence__node--highlight" : ""}`}
              data-node-id="origin"
              onClick={(e) => openPanel(originDetail, e.currentTarget)}
              role="button"
              tabIndex={0}
            >
              <circle cx={90} cy={TIMELINE_AXIS} r={24} fill="transparent" />
              <circle
                cx={90}
                cy={TIMELINE_AXIS}
                r={22}
                fill="#F7F8FB"
                stroke="#232946"
                strokeWidth={1.4}
              />
              <text x={90} y={TIMELINE_AXIS - 4} className="convergence__origin-label">
                SHARED
              </text>
              <text x={90} y={TIMELINE_AXIS + 7} className="convergence__origin-label">
                INTENT
              </text>
            </g>

            {agents.map((agent, index) => (
              <g key={`strand-${index}-${agent.key}`}>
                <path
                  d={paths[index]}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={TIMELINE_OPTS.w + 3.2}
                  strokeLinecap="round"
                  pointerEvents="none"
                />
                <path
                  d={paths[index]}
                  fill="none"
                  stroke={agent.color}
                  strokeWidth={TIMELINE_OPTS.w}
                  strokeLinecap="round"
                  opacity={0.9}
                  pointerEvents="none"
                />
              </g>
            ))}

            <rect
              x={900}
              y={26}
              width={100}
              height={250}
              fill={`url(#${fadeId})`}
              pointerEvents="none"
            />

            {events.map((ev) => {
              if (ev.kind === "lane") {
                const idx = agents.findIndex((agent) => agent.key === ev.agent);
                if (idx < 0) return null;
                return (
                  <LaneNode
                    key={ev.id ?? `lane-${ev.x}-${ev.agent}`}
                    ev={ev}
                    agentIndex={idx}
                    onSelect={openPanel}
                    highlighted={highlightId === (ev.id ?? `lane-${ev.x}-${ev.agent}`)}
                    agents={agents}
                  />
                );
              }
              if (ev.kind === "merge") {
                return (
                  <MergeNode
                    key={ev.id ?? `merge-${ev.x}`}
                    ev={ev}
                    onSelect={openPanel}
                    highlighted={highlightId === (ev.id ?? `merge-${ev.x}`)}
                    agents={agents}
                  />
                );
              }
              const resolved =
                ev.dNum != null && resolvedPinches.has(ev.dNum);
              return (
                <PinchNode
                  key={ev.id ?? `pinch-${ev.x}`}
                  ev={ev}
                  resolved={resolved}
                  onSelect={openPanel}
                  highlighted={
                    highlightId === (ev.id ?? `pinch-${ev.x}`)
                  }
                  agents={agents}
                />
              );
            })}

            <g
              className={`convergence__node${highlightId === "oversight" ? " convergence__node--highlight" : ""}`}
              data-node-id="oversight"
              onClick={(e) => openPanel(OVERSIGHT_DETAIL, e.currentTarget)}
              role="button"
              tabIndex={0}
            >
              <line
                x1={118}
                y1={266}
                x2={900}
                y2={266}
                stroke="#232946"
                strokeWidth={1}
                strokeDasharray="2,4"
                opacity={0.3}
              />
              {events.filter((ev) => ev.kind !== "lane").map((ev) => (
                <circle
                  key={`dot-${ev.x}`}
                  cx={ev.x}
                  cy={266}
                  r={1.7}
                  fill="#232946"
                  opacity={0.35}
                />
              ))}
              <circle cx={104} cy={266} r={11} fill="#232946" />
              <PersonIcon cx={104} cy={266} scale={1.7} fill="#FFFFFF" />
              <text x={121} y={269.5} className="convergence__architect-label">
                Chief Architect
              </text>
              <rect x={93} y={258} width={807} height={16} fill="transparent" />
            </g>
          </svg>

          <div className="convergence__legend">
            {agents.map((agent, index) => (
              <span key={`legend-${index}-${agent.key}`} className="convergence__legend-item">
                <svg width={20} height={6} aria-hidden>
                  <line
                    x1={1}
                    y1={3}
                    x2={19}
                    y2={3}
                    stroke={agent.color}
                    strokeWidth={2.6}
                    strokeLinecap="round"
                  />
                </svg>
                {agent.key}
              </span>
            ))}
            <span className="convergence__legend-item convergence__legend-item--end">
              <span className="convergence__legend-dot convergence__legend-dot--converged" />
              Converged
            </span>
            <span className="convergence__legend-item">
              <span className="convergence__legend-dot convergence__legend-dot--diverged" />
              Diverged
            </span>
            <span className="convergence__legend-item">
              <span className="convergence__legend-neg-dot" />
              Agents negotiating
            </span>
          </div>
        </div>

        {!compact ? (
          <aside className="convergence__sidebar" aria-label="Decision summary">
            <div>
              <div className="convergence__sidebar-heading convergence__sidebar-heading--converged">
                CONVERGED · {convergedSidebar.length}
              </div>
              <ul className="convergence__sidebar-list">
                {convergedSidebar.map((item, index) => (
                  <li key={`converged-${index}-${item}`}>
                    <span className="convergence__sidebar-bullet convergence__sidebar-bullet--converged">
                      ●
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="convergence__sidebar-heading convergence__sidebar-heading--diverged">
                DIVERGED · {divergedCount}
              </div>
              <ul className="convergence__sidebar-list">
                {divergedSidebar.filter(
                  (item) => !resolvedPinches.has(item.dNum),
                ).map((item) => (
                  <li key={item.id}>
                    <span className="convergence__sidebar-bullet convergence__sidebar-bullet--diverged">
                      ●
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>

      {selected ? (
        <TimelineDetailPanel
          detail={selected}
          position={panelPos}
          onClose={closePanel}
          onResolve={handleResolve}
          agentColors={agentColors}
        />
      ) : null}
    </div>
  );
}
