import { patterns as v2Patterns } from "@/lib/v2/catalog";
import { PATTERN_PRINCIPLES, type PatternPrinciples } from "@/lib/v2/principles";
import type { Pattern } from "@/lib/v2/types";
import { NEW_AGENTIC_DETAILS } from "./new-agentic-details";

/**
 * Principle mappings for the seven new agentic patterns added in v3. The
 * mapping format mirrors PATTERN_PRINCIPLES in v2/principles.ts so the detail
 * page can read both through one resolver.
 */
const V3_NEW_PATTERN_PRINCIPLES: Record<string, PatternPrinciples> = {
  "stream-of-thought": {
    primary: { id: "clarity", why: "The agent's reasoning appears as it unfolds, where a person can read it." },
    secondary: { id: "control", why: "A person can interrupt or redirect before the agent commits." },
  },
  "follow-up": {
    primary: { id: "clarity", why: "The agent asks about the specific missing fact instead of guessing." },
    secondary: { id: "control", why: "The person's answer, or an explicit skip, decides what the agent does next." },
  },
  "agent-memory": {
    primary: { id: "control", why: "The person can keep, edit, or forget any memory entry." },
    secondary: { id: "clarity", why: "Each memory entry is traceable to when and where the agent learned it." },
  },
  "task-creation": {
    primary: { id: "collaboration", why: "A request becomes a shared task with a visible owner and expected result." },
    secondary: { id: "control", why: "The person edits or declines the proposal before the task is tracked." },
  },
  "task-assignment": {
    primary: { id: "collaboration", why: "Peer agents coordinate who does what through structured accept or decline." },
    secondary: { id: "traceability", why: "The shared view records who owns each assignment." },
  },
  "priority-ranking": {
    primary: { id: "clarity", why: "The agent's reason for each rank is visible beside the task." },
    secondary: { id: "control", why: "A person can reorder the list and the agent learns from the override." },
  },
  "subtask-generation": {
    primary: { id: "collaboration", why: "A person and the agent review the breakdown before any subtask is tracked." },
    secondary: { id: "clarity", why: "Dependencies between subtasks are marked where review can see them." },
  },
};

const V2_BY_ID = new Map(v2Patterns.map((pattern) => [pattern.id, pattern]));
const V3_NEW_BY_ID = new Map(
  NEW_AGENTIC_DETAILS.map((pattern) => [pattern.id, pattern]),
);

/** Resolve an agentic pattern's full detail by id (v2-authored or v3-new). */
export function getV3PatternDetail(id: string): Pattern | undefined {
  return V2_BY_ID.get(id) ?? V3_NEW_BY_ID.get(id);
}

/** Resolve a pattern's principle mapping, checking v2 first and v3-new second. */
export function getV3PatternPrinciples(
  id: string,
): PatternPrinciples | undefined {
  return (
    PATTERN_PRINCIPLES[id as keyof typeof PATTERN_PRINCIPLES] ??
    V3_NEW_PATTERN_PRINCIPLES[id]
  );
}

/** All ids the v3 detail page can render. Used for static params generation. */
export function getV3AgenticPatternIds(): string[] {
  return [
    ...v2Patterns.map((pattern) => pattern.id),
    ...NEW_AGENTIC_DETAILS.map((pattern) => pattern.id),
  ];
}
