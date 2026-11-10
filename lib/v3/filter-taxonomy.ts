import type { NucleuxCluster, V3PatternCard } from "./catalog";

export const DESIGN_NEEDS = [
  { id: "trust", label: "Build trust" },
  { id: "start", label: "Start a request" },
  { id: "understand", label: "Understand the work" },
  { id: "coordinate", label: "Coordinate work" },
  { id: "decide", label: "Make a decision" },
  { id: "recover", label: "Recover and refine" },
  { id: "remember", label: "Remember and adapt" },
] as const;

export type DesignNeed = (typeof DESIGN_NEEDS)[number]["id"];

const NEEDS_BY_CLUSTER: Record<NucleuxCluster, DesignNeed[]> = {
  "trust-disclosure": ["trust"],
  identity: ["trust"],
  "capability-discovery": ["trust", "start"],
  "entry-points": ["start"],
  "expressive-input": ["start"],
  "prompt-scaffolds": ["start", "recover"],
  "context-expansion": ["start", "understand"],
  "output-processing": ["understand"],
  "task-agent-management": ["coordinate", "decide"],
  "collaboration-canvas": ["coordinate", "recover"],
  refinement: ["recover"],
  explainability: ["understand", "decide"],
  recovery: ["recover", "decide"],
  "power-controls": ["decide", "recover"],
  "memory-continuity": ["remember"],
  "privacy-control": ["trust", "remember"],
  adaptation: ["remember", "recover"],
  "change-management": ["trust", "remember"],
};

/** Design needs describe why someone reaches for a pattern; they can overlap. */
export function getPatternNeeds(pattern: V3PatternCard): DesignNeed[] {
  return NEEDS_BY_CLUSTER[pattern.nucleuxCluster];
}
