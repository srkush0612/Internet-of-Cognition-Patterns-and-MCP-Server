/** Ways to visualize the same conflict data (not other IoC patterns). */
export type ConflictVisibilityViewId = "timeline" | "network" | "tree";

export type ConflictVisibilityAlternative = {
  id: ConflictVisibilityViewId;
  name: string;
  /** Short card description (1–2 lines). */
  description: string;
  /** Why this view fits better than Convergence Point for 5+ agents. */
  overConvergence: string;
};

export const CONFLICT_VISIBILITY_ALTERNATIVES: ConflictVisibilityAlternative[] = [
  {
    id: "network",
    name: "Conflict Network",
    description: "See who disagrees with whom at a glance.",
    overConvergence:
      "Convergence Point shows when agents aligned — but with 5+ roles, a network map is clearer for spotting who disagrees with whom without reading every timeline lane.",
  },
  {
    id: "tree",
    name: "Decision Tree",
    description: "Trace branches from disagreement to resolution.",
    overConvergence:
      "Convergence Point emphasizes merge moments; a decision tree is better when you need to see how each agent's branch led to the final outcome, not just that they converged.",
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Follow the conflict as it unfolded over time.",
    overConvergence:
      "Convergence Point is strongest at pinch points; the full timeline is better when sequence matters — who entered the debate when, and how positions shifted before resolution.",
  },
];

export function getConflictVisibilityAlternatives(): ConflictVisibilityAlternative[] {
  return CONFLICT_VISIBILITY_ALTERNATIVES;
}
