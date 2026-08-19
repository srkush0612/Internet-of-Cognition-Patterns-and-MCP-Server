export type AgentKey = "Prometheus" | "Themis" | "Athena" | "Hermes";

export type TimelineEvent =
  | {
      kind: "lane";
      id?: string;
      x: number;
      agent: AgentKey;
      dot: "fill" | "hollow";
      title: string;
      status: string;
      time: string;
      body: string;
      thread?: string;
    }
  | {
      kind: "merge";
      id?: string;
      x: number;
      size: "lg" | "sm";
      title: string;
      status: "CONVERGED";
      time: string;
      body: string;
      agreed: AgentKey[];
      dissent?: AgentKey[];
      human?: boolean;
      thread?: string;
    }
  | {
      kind: "pinch";
      id?: string;
      x: number;
      title: string;
      status: "DIVERGED";
      time: string;
      body: string;
      agreed: AgentKey[];
      dissent: AgentKey[];
      pending?: boolean;
      dNum?: number;
      options?: string[];
      thread?: string;
    };

export const AGENT_META: {
  key: AgentKey;
  color: string;
  phase: number;
}[] = [
  { key: "Prometheus", color: "#5B57E0", phase: 0 },
  { key: "Themis", color: "#1F9E86", phase: Math.PI / 2 },
  { key: "Athena", color: "#C68A2E", phase: Math.PI },
  { key: "Hermes", color: "#B0519F", phase: (3 * Math.PI) / 2 },
];

export const AGENT_COLORS: Record<AgentKey, string> = {
  Prometheus: "#5B57E0",
  Themis: "#1F9E86",
  Athena: "#C68A2E",
  Hermes: "#B0519F",
};

export const STATUS_COLORS: Record<string, string> = {
  CONVERGED: "#23A06B",
  DIVERGED: "#E0447B",
  OPEN: "#E0447B",
  PROPOSED: "#5B57E0",
  FLAGGED: "#1F9E86",
  ORIGIN: "#232946",
  OVERSIGHT: "#5B6178",
};

export const TIMELINE_AXIS = 150;
export const TIMELINE_MERGES = [290, 490, 575, 745];
export const TIMELINE_PINCHES = [375, 665, 808];

export const TIMELINE_OPTS = {
  wl: 132,
  w: 1.8,
  ampMin: 2,
  ampMax: 33,
  base: 18,
};

export const TIMELINE_TICKS: [number, string][] = [
  [76, "13:42"],
  [276, "13:45"],
  [361, "13:47"],
  [476, "13:52"],
  [561, "13:55"],
  [651, "13:58"],
  [794, "14:02+"],
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    x: 185,
    kind: "lane",
    agent: "Prometheus",
    dot: "fill",
    title: "Routing proposal",
    status: "PROPOSED",
    time: "13:43",
    body: "Prometheus proposed a hybrid routing topology that splits traffic across the Tokyo and Osaka regions to balance latency against API compliance.",
    thread: "aMsgMesh",
  },
  {
    x: 235,
    kind: "lane",
    agent: "Themis",
    dot: "hollow",
    title: "Residency constraint",
    status: "FLAGGED",
    time: "13:44",
    body: "Themis flagged a data-residency constraint: personally identifiable traffic must remain within the Tokyo region under APPI.",
    thread: "aMsgResidency",
  },
  {
    x: 290,
    kind: "merge",
    size: "lg",
    title: "Hybrid topology agreed",
    status: "CONVERGED",
    time: "13:45",
    body: "Agents confirmed the hybrid topology can be deployed within the Mythos Corp timeline with no scheduling conflicts against the proposed configuration.",
    agreed: ["Prometheus", "Themis", "Athena"],
    dissent: ["Hermes"],
    thread: "aMsgHybrid",
  },
  {
    x: 375,
    kind: "pinch",
    title: "Cost model disputed",
    status: "DIVERGED",
    time: "13:47",
    body: "Reopened right after the merge. Prometheus and Athena favor reserved capacity; Themis and Hermes argue on-demand better fits the compliance audit window.",
    agreed: ["Prometheus", "Athena"],
    dissent: ["Themis", "Hermes"],
    thread: "aMsgHybrid",
  },
  {
    x: 490,
    kind: "merge",
    size: "lg",
    title: "Both options compliant",
    status: "CONVERGED",
    time: "13:52",
    human: true,
    body: "Compliance review cleared both candidate configurations against APPI scope. Either path is safe to proceed.",
    agreed: ["Prometheus", "Themis", "Athena", "Hermes"],
    thread: "aMsgCompliant",
  },
  {
    x: 575,
    kind: "merge",
    size: "sm",
    title: "Telemetry format",
    status: "CONVERGED",
    time: "13:54",
    body: "Standardized on an OpenTelemetry export format for cross-agent tracing. Athena has not yet ratified the schema version.",
    agreed: ["Prometheus", "Themis", "Hermes"],
    dissent: ["Athena"],
    thread: "aMsgCompliant",
  },
  {
    x: 665,
    kind: "pinch",
    id: "tPinchFailover",
    title: "Failover path",
    status: "DIVERGED",
    time: "13:55",
    pending: true,
    dNum: 1,
    body: "Failover region still contested. Prometheus and Hermes lean Osaka for capacity; Themis and Athena prefer keeping failover in-region.",
    agreed: ["Prometheus", "Hermes"],
    dissent: ["Themis", "Athena"],
    thread: "aMsgFailover",
    options: ["Osaka GS", "Tokyo redundant"],
  },
  {
    x: 745,
    kind: "merge",
    size: "sm",
    title: "Runbook owners",
    status: "CONVERGED",
    time: "13:57",
    body: "On-call ownership and the escalation runbook are assigned. All agents acknowledged their sections.",
    agreed: ["Prometheus", "Themis", "Athena", "Hermes"],
    thread: "aMsgCompliant",
  },
  {
    x: 808,
    kind: "pinch",
    id: "tPinchVendor",
    title: "Vendor scope",
    status: "DIVERGED",
    time: "13:58",
    pending: true,
    dNum: 2,
    body: "Vendor selection scope unresolved. Athena recommends a single managed vendor; Prometheus, Themis, and Hermes want a multi-vendor evaluation first.",
    agreed: ["Athena"],
    dissent: ["Prometheus", "Themis", "Hermes"],
    thread: "aMsgVendor",
    options: ["JP vendors only", "All vendors"],
  },
];

export const CONVERGED_SIDEBAR = [
  "Hybrid topology",
  "Both compliant",
  "Telemetry format",
  "Runbook owners",
];

export const DIVERGED_SIDEBAR = [
  { id: "tPinchFailover", label: "Failover path", dNum: 1 },
  { id: "tPinchVendor", label: "Vendor scope", dNum: 2 },
];

export type TimelineNodeDetail = {
  nodeId: string;
  title: string;
  status: string;
  time: string;
  body: string;
  agreed?: AgentKey[];
  dissent?: AgentKey[];
  dissentLabel?: string;
  human?: boolean;
  pending?: boolean;
  dNum?: number;
  options?: string[];
  thread?: string;
};

export function ampAt(x: number): number {
  let wm = 0;
  let wp = 0;
  for (let i = 0; i < TIMELINE_MERGES.length; i++) {
    wm += Math.exp(-Math.pow((x - TIMELINE_MERGES[i]) / 38, 2));
  }
  for (let i = 0; i < TIMELINE_PINCHES.length; i++) {
    wp += Math.exp(-Math.pow((x - TIMELINE_PINCHES[i]) / 38, 2));
  }
  return (
    (TIMELINE_OPTS.base * 0.5 + TIMELINE_OPTS.ampMin * wm + TIMELINE_OPTS.ampMax * wp) /
    (0.5 + wm + wp)
  );
}

export function strandY(agentIndex: number, x: number): number {
  const phase = AGENT_META[agentIndex].phase;
  return TIMELINE_AXIS + ampAt(x) * Math.sin((2 * Math.PI * x) / TIMELINE_OPTS.wl + phase);
}

export function strandPath(agentIndex: number): string {
  const pts: string[] = [];
  for (let x = 118; x <= 920; x += 2.5) {
    pts.push(`${x.toFixed(1)} ${strandY(agentIndex, x).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

export function eventToDetail(ev: TimelineEvent, nodeId: string): TimelineNodeDetail {
  if (ev.kind === "lane") {
    return {
      nodeId,
      title: ev.title,
      status: ev.status,
      time: ev.time,
      body: ev.body,
      thread: ev.thread,
    };
  }
  return {
    nodeId,
    title: ev.title,
    status: ev.status,
    time: ev.time,
    body: ev.body,
    agreed: ev.agreed,
    dissent: "dissent" in ev ? ev.dissent : undefined,
    dissentLabel: "Diverged",
    human: "human" in ev ? ev.human : undefined,
    pending: "pending" in ev ? ev.pending : undefined,
    dNum: "dNum" in ev ? ev.dNum : undefined,
    options: "options" in ev ? ev.options : undefined,
    thread: ev.thread,
  };
}

export const ORIGIN_DETAIL: TimelineNodeDetail = {
  nodeId: "origin",
  title: "Shared intent",
  status: "ORIGIN",
  time: "13:42",
  body: "All four agents begin from one objective: route Mythos Corp traffic for low latency while preserving full API compliance.",
  agreed: ["Prometheus", "Themis", "Athena", "Hermes"],
  thread: "aMsgMesh",
};

export const OVERSIGHT_DETAIL: TimelineNodeDetail = {
  nodeId: "oversight",
  title: "Chief Architect",
  status: "OVERSIGHT",
  time: "every step",
  body: "You oversee the full timeline and can review, steer, or override the agents at any decision point, before or after they converge.",
};
