"use client";

import { useMemo } from "react";
import { STATUS_COLORS } from "@/lib/convergence-timeline-data";
import { getUniqueAgentPositions } from "@/lib/convergence-timeline-from-workspace";
import type { ConvergencePointWorkspaceState } from "@/lib/workspace-defaults";

type NetworkNode = {
  id: string;
  label: string;
  displayLabel: string;
  color: string;
  stance: string;
  x: number;
  y: number;
};

type NetworkEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number;
};

const VIEW_WIDTH = 900;
const VIEW_HEIGHT = 450;
const NODE_RADIUS = 10;
const GRAPH_TOP_PADDING = 44;

/** Convergence timeline agent palette (Prometheus, Themis, Athena, Hermes + extensions). */
const NETWORK_AGENT_COLORS = [
  "#5B57E0",
  "#1F9E86",
  "#C68A2E",
  "#B0519F",
  "#5B6FFF",
  "#0FA998",
  "#E0447B",
];

const CONFLICT_STRONG = STATUS_COLORS.DIVERGED ?? "#E0447B";
const CONFLICT_MUTED = "#C96B8A";
const CONFLICT_WEAK = "#C4C9D9";

function formatAgentLabel(agent: string): string {
  return agent
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1),
  );
}

function stanceConflictStrength(stanceA: string, stanceB: string): number {
  const a = stanceA.trim();
  const b = stanceB.trim();
  if (!a || !b) return 0;
  if (a.toLowerCase() === b.toLowerCase()) return 0;

  const wordsA = tokenize(a);
  const wordsB = tokenize(b);
  if (wordsA.size === 0 || wordsB.size === 0) return 0.55;

  let shared = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) shared += 1;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  const similarity = shared / union;
  return Math.min(1, Math.max(0.2, 1 - similarity * 1.15));
}

function agentTokens(agent: string): string[] {
  return agent
    .toLowerCase()
    .split(/[-_\s]+/)
    .filter(Boolean);
}

const ROLE_CONFLICT_PAIRS: Array<[string, string, number]> = [
  ["policy", "legal", 1],
  ["legal", "compliance", 0.88],
  ["policy", "compliance", 0.72],
  ["product", "director", 0.68],
  ["product", "legal", 0.62],
  ["policy", "product", 0.58],
  ["director", "legal", 0.56],
  ["director", "compliance", 0.52],
];

function roleConflictStrength(agentA: string, agentB: string): number {
  const tokensA = agentTokens(agentA);
  const tokensB = agentTokens(agentB);
  let score = 0;

  for (const [left, right, weight] of ROLE_CONFLICT_PAIRS) {
    const aHasLeft = tokensA.includes(left);
    const aHasRight = tokensA.includes(right);
    const bHasLeft = tokensB.includes(left);
    const bHasRight = tokensB.includes(right);
    if ((aHasLeft && bHasRight) || (aHasRight && bHasLeft)) {
      score = Math.max(score, weight);
    }
  }

  const teamPattern = /team\s*\d+/;
  if (teamPattern.test(agentA) && teamPattern.test(agentB) && agentA !== agentB) {
    score = Math.max(score, 0.48);
  }

  return score;
}

function pairConflictStrength(
  agentA: string,
  agentB: string,
  stanceA: string,
  stanceB: string,
  indexA: number,
  indexB: number,
  count: number,
): number {
  const stanceScore = stanceConflictStrength(stanceA, stanceB);
  const roleScore = roleConflictStrength(agentA, agentB);

  if (stanceScore > 0) {
    return Math.max(stanceScore, roleScore * 0.85);
  }

  if (roleScore > 0) {
    return roleScore;
  }

  const half = Math.ceil(count / 2);
  const onOppositeSides =
    (indexA < half && indexB >= half) || (indexA >= half && indexB < half);
  if (!onOppositeSides) return 0;

  const leftIndex = indexA < half ? indexA : indexB;
  const rightIndex = indexA >= half ? indexA : indexB;
  const leftCenter = (half - 1) / 2;
  const rightCenter = half + (count - half - 1) / 2;
  const leftSpan = Math.max(1, half - 1);
  const rightSpan = Math.max(1, count - half - 1);
  const leftCentrality = 1 - Math.abs(leftIndex - leftCenter) / leftSpan;
  const rightCentrality = 1 - Math.abs(rightIndex - rightCenter) / rightSpan;

  return 0.22 + ((leftCentrality + rightCentrality) / 2) * 0.45;
}

function buildNetworkLayout(
  workspace: ConvergencePointWorkspaceState & Record<string, unknown>,
): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  const positions = getUniqueAgentPositions(workspace);
  const count = positions.length;
  if (count === 0) {
    return { nodes: [], edges: [] };
  }

  const centerX = VIEW_WIDTH / 2;
  const radius = Math.min(148, 44 + count * 14);
  const centerY = GRAPH_TOP_PADDING + NODE_RADIUS + 4 + radius;

  const nodes: NetworkNode[] = positions.map((position, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    const id = position.agent.trim();
    return {
      id,
      label: id,
      displayLabel: formatAgentLabel(id),
      color: NETWORK_AGENT_COLORS[index % NETWORK_AGENT_COLORS.length]!,
      stance: position.stance?.trim() ?? "",
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const edges: NetworkEdge[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]!;
      const b = nodes[j]!;
      const strength = pairConflictStrength(
        a.id,
        b.id,
        a.stance,
        b.stance,
        i,
        j,
        count,
      );

      if (strength >= 0.2) {
        edges.push({
          id: `${a.id}-${b.id}`,
          sourceId: a.id,
          targetId: b.id,
          strength,
        });
      }
    }
  }

  if (edges.length === 0 && nodes.length > 1) {
    const half = Math.ceil(nodes.length / 2);
    for (let i = 0; i < half; i++) {
      for (let j = half; j < nodes.length; j++) {
        edges.push({
          id: `${nodes[i]!.id}-${nodes[j]!.id}`,
          sourceId: nodes[i]!.id,
          targetId: nodes[j]!.id,
          strength:
            pairConflictStrength(
              nodes[i]!.id,
              nodes[j]!.id,
              nodes[i]!.stance,
              nodes[j]!.stance,
              i,
              j,
              count,
            ) || 0.35 + ((half - i) / half) * 0.4,
        });
      }
    }
  }

  return { nodes, edges };
}

function normalizeStrength(
  strength: number,
  minStrength: number,
  maxStrength: number,
): number {
  if (maxStrength <= minStrength) return 0.5;
  return (strength - minStrength) / (maxStrength - minStrength);
}

function edgeStrokeWidth(normalized: number): number {
  return 0.8 + normalized * 4.2;
}

function edgeColor(normalized: number): string {
  if (normalized >= 0.62) return CONFLICT_STRONG;
  if (normalized >= 0.32) return CONFLICT_MUTED;
  return CONFLICT_WEAK;
}

function edgeOpacity(normalized: number): number {
  return 0.42 + normalized * 0.5;
}

export function ConflictNetworkVisualization({
  workspace,
}: {
  workspace: ConvergencePointWorkspaceState & Record<string, unknown>;
}) {
  const { nodes, edges } = useMemo(() => buildNetworkLayout(workspace), [workspace]);

  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  );

  const strengthRange = useMemo(() => {
    if (edges.length === 0) return { min: 0, max: 1 };
    const values = edges.map((edge) => edge.strength);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [edges]);

  return (
    <div className="cp-conflict-network">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="cp-conflict-network__svg"
        role="img"
        aria-label="Conflict network showing agent disagreements"
      >
        <rect
          x={0}
          y={0}
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          fill="#ffffff"
          rx={8}
        />

        {edges.map((edge) => {
          const source = nodeById.get(edge.sourceId);
          const target = nodeById.get(edge.targetId);
          if (!source || !target) return null;

          const normalized = normalizeStrength(
            edge.strength,
            strengthRange.min,
            strengthRange.max,
          );

          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              className="cp-conflict-network__edge"
              stroke={edgeColor(normalized)}
              strokeWidth={edgeStrokeWidth(normalized)}
              strokeOpacity={edgeOpacity(normalized)}
            />
          );
        })}

        {nodes.map((node) => (
          <g key={node.id} className="cp-conflict-network__node">
            <circle
              cx={node.x}
              cy={node.y}
              r={NODE_RADIUS + 4}
              fill="none"
              stroke={node.color}
              strokeWidth={1.2}
              opacity={0.28}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={NODE_RADIUS}
              fill={node.color}
              stroke="#ffffff"
              strokeWidth={2.5}
            />
            <text
              x={node.x}
              y={node.y + NODE_RADIUS + 13}
              textAnchor="middle"
              className="cp-conflict-network__label"
            >
              {node.displayLabel}
            </text>
          </g>
        ))}

        <text x={24} y={28} className="cp-conflict-network__tick">
          DIVERGED LINKS
        </text>
        <text x={VIEW_WIDTH - 24} y={28} textAnchor="end" className="cp-conflict-network__tick">
          {nodes.length} AGENTS
        </text>
      </svg>

      <div className="cp-conflict-network__legend">
        <span className="cp-conflict-network__legend-item">
          <span
            className="cp-conflict-network__legend-dot cp-conflict-network__legend-dot--diverged"
            aria-hidden
          />
          Strong conflict
        </span>
        <span className="cp-conflict-network__legend-item">
          <span className="cp-conflict-network__legend-line cp-conflict-network__legend-line--mid" aria-hidden />
          Moderate tension
        </span>
        <span className="cp-conflict-network__legend-item">
          <span className="cp-conflict-network__legend-line cp-conflict-network__legend-line--weak" aria-hidden />
          Peripheral
        </span>
        <span className="cp-conflict-network__legend-item cp-conflict-network__legend-item--end">
          Thicker = stronger disagreement
        </span>
      </div>

      <p className="cp-conflict-network__caption">
        Agents as nodes. Lines show disagreement intensity — thicker lines mean stronger conflict.
      </p>
    </div>
  );
}
