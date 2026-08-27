import {
  AGENT_META,
  CONVERGED_SIDEBAR,
  DIVERGED_SIDEBAR,
  ORIGIN_DETAIL,
  TIMELINE_EVENTS,
  type TimelineAgentMeta,
  type TimelineEvent,
  type TimelineNodeDetail,
} from "@/lib/convergence-timeline-data";
import type { ConvergencePointWorkspaceState } from "@/lib/workspace-defaults";

export type { TimelineAgentMeta };

export type TimelineModel = {
  agents: TimelineAgentMeta[];
  events: TimelineEvent[];
  convergedSidebar: string[];
  divergedSidebar: Array<{ id: string; label: string; dNum: number }>;
  originDetail: TimelineNodeDetail;
  agentColors: Record<string, string>;
};

const AGENT_PALETTE = [
  "#5B6FFF",
  "#0FA998",
  "#FFB347",
  "#A78BFA",
  "#F87171",
  "#60A5FA",
];

export function getAgentColor(agentKey: string): string {
  const hash = agentKey
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AGENT_PALETTE[hash % AGENT_PALETTE.length]!;
}

function splitAgents(agentKeys: string[]): { agreed: string[]; dissent: string[] } {
  if (agentKeys.length <= 1) {
    return { agreed: agentKeys, dissent: [] };
  }
  const half = Math.ceil(agentKeys.length / 2);
  return {
    agreed: agentKeys.slice(0, half),
    dissent: agentKeys.slice(half),
  };
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

function uniquePositions(
  positions: Array<{ agent: string; stance: string; evidence: string[] }>,
): Array<{ agent: string; stance: string; evidence: string[] }> {
  const seen = new Set<string>();
  const result: typeof positions = [];
  for (const position of positions) {
    const key = position.agent.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push({
      ...position,
      agent: position.agent.trim(),
    });
  }
  return result;
}

export function getUniqueAgentPositions(
  workspace: ConvergencePointWorkspaceState & Record<string, unknown>,
): Array<{ agent: string; stance: string; evidence: string[] }> {
  const fromPositions = uniquePositions(
    (workspace.positions ?? []).filter((p) => p.agent?.trim()) as Array<{
      agent: string;
      stance: string;
      evidence: string[];
    }>,
  );

  const fromRoster = Array.isArray(workspace.agentRoster)
    ? uniquePositions(
        (workspace.agentRoster as string[])
          .filter((agent) => String(agent).trim())
          .map((agent) => ({
            agent: String(agent).trim(),
            stance: "",
            evidence: [] as string[],
          })),
      )
    : [];

  if (fromRoster.length >= fromPositions.length && fromRoster.length > 0) {
    return fromRoster;
  }

  if (fromPositions.length > 0) {
    return fromPositions;
  }

  return fromRoster;
}

export function getUniqueAgentCount(
  workspace: ConvergencePointWorkspaceState & Record<string, unknown>,
): number {
  return getUniqueAgentPositions(workspace).length;
}

export function buildTimelineModel(
  workspace: ConvergencePointWorkspaceState & Record<string, unknown>,
): TimelineModel {
  const positions = getUniqueAgentPositions(workspace);
  const agents: TimelineAgentMeta[] = positions.map((position, index) => ({
    key: position.agent.trim(),
    color: getAgentColor(position.agent),
    phase: positions.length > 1 ? (index * Math.PI) / 2 : 0,
  }));

  const agentKeys = agents.map((agent) => agent.key);
  const agentColors = Object.fromEntries(agents.map((agent) => [agent.key, agent.color]));

  const events: TimelineEvent[] = [];
  const divergedSidebar: TimelineModel["divergedSidebar"] = [];
  let dNum = 0;

  positions.forEach((position, index) => {
    events.push({
      kind: "lane",
      id: `lane-user-${index}`,
      x: 180 + index * 35,
      agent: position.agent.trim(),
      dot: index === 0 ? "fill" : "hollow",
      title: position.stance?.trim() || `${position.agent} enters`,
      status: index === 0 ? "PROPOSED" : "FLAGGED",
      time: "—",
      body:
        position.stance?.trim() ||
        `${position.agent} joined the scenario with an open position.`,
    });
  });

  const disagreement = String(workspace.disagreement ?? "").trim();
  if (disagreement) {
    dNum += 1;
    const { agreed, dissent } = splitAgents(agentKeys);
    events.push({
      kind: "pinch",
      id: "pinch-disagreement",
      x: 375,
      title: truncate(disagreement, 40),
      status: "DIVERGED",
      time: "—",
      body: disagreement,
      agreed,
      dissent: dissent.length > 0 ? dissent : agreed,
      pending: !String(workspace.decision ?? "").trim(),
      dNum,
    });
    divergedSidebar.push({
      id: "pinch-disagreement",
      label: truncate(disagreement, 48),
      dNum,
    });
  }

  const convergencePoints = workspace.convergencePoints ?? [];
  const checked = convergencePoints.filter((point) => point.checked && point.label?.trim());
  const unchecked = convergencePoints.filter((point) => !point.checked && point.label?.trim());

  checked.forEach((point, index) => {
    events.push({
      kind: "merge",
      id: `merge-cp-${index}`,
      x: 450 + index * 70,
      size: index === 0 ? "lg" : "sm",
      title: point.label,
      status: "CONVERGED",
      time: "—",
      body: point.label,
      agreed: agentKeys,
    });
  });

  unchecked.forEach((point) => {
    dNum += 1;
    const { agreed, dissent } = splitAgents(agentKeys);
    divergedSidebar.push({
      id: `pinch-cp-${dNum}`,
      label: point.label,
      dNum,
    });
    events.push({
      kind: "pinch",
      id: `pinch-cp-${dNum}`,
      x: 520 + dNum * 35,
      title: point.label,
      status: "DIVERGED",
      time: "—",
      body: point.label,
      agreed,
      dissent: dissent.length > 0 ? dissent : agreed,
      pending: true,
      dNum,
    });
  });

  const decision = String(workspace.decision ?? "").trim();
  const resolution = String(
    workspace.resolutionMechanism ?? workspace.resolutionRationale ?? "",
  ).trim();

  if (decision) {
    events.push({
      kind: "merge",
      id: "merge-decision",
      x: 745,
      size: "lg",
      title: "Decision",
      status: "CONVERGED",
      time: "—",
      body: resolution ? `${decision}\n\n${resolution}` : decision,
      agreed: agentKeys,
      human: Boolean(resolution),
    });
  }

  const originBody = disagreement
    ? `Agents begin aligned, then diverge over: ${disagreement}`
    : agentKeys.length > 0
      ? `${agentKeys.join(", ")} enter the scenario from a shared starting point.`
      : "Scenario start.";

  const convergedSidebar = [
    ...checked.map((point) => point.label),
    ...(decision ? ["Decision"] : []),
  ];

  return {
    agents,
    events,
    convergedSidebar,
    divergedSidebar,
    originDetail: {
      nodeId: "origin",
      title: "Shared intent",
      status: "ORIGIN",
      time: "—",
      body: originBody,
      agreed: agentKeys,
    },
    agentColors,
  };
}

export function demoTimelineModel(): TimelineModel {
  const agentColors = Object.fromEntries(AGENT_META.map((agent) => [agent.key, agent.color]));

  return {
    agents: AGENT_META.map((agent) => ({
      key: agent.key,
      color: agent.color,
      phase: agent.phase,
    })),
    events: TIMELINE_EVENTS,
    convergedSidebar: CONVERGED_SIDEBAR,
    divergedSidebar: DIVERGED_SIDEBAR,
    originDetail: ORIGIN_DETAIL,
    agentColors,
  };
}
