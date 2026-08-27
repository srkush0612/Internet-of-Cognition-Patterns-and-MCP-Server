import { getPattern } from "@/lib/patterns";
import { isPatternReady } from "@/lib/pattern-ready";

export type PatternSuggestion = {
  slug: string;
  name: string;
  description: string;
};

type WorkspaceLike = Record<string, unknown>;

type PositionRow = { agent?: string; stance?: string };

function getPositions(workspace: WorkspaceLike): PositionRow[] {
  if (Array.isArray(workspace.positions)) {
    return workspace.positions as PositionRow[];
  }

  if (Array.isArray(workspace.agentRoster)) {
    return (workspace.agentRoster as string[]).map((agent) => ({
      agent: String(agent),
      stance: "",
    }));
  }

  return [];
}

function readText(workspace: WorkspaceLike, ...keys: string[]): string {
  for (const key of keys) {
    const value = workspace[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

/**
 * Score which patterns fit saved workspace data (excludes current slug).
 * Prefers patterns with reference designs when trimming results.
 */
export function detectApplicablePatterns(
  workspace: WorkspaceLike,
  excludeSlug?: string,
): PatternSuggestion[] {
  const positions = getPositions(workspace);
  const disagreement = readText(
    workspace,
    "disagreement",
    "disagreementDimension",
  );
  const decision = readText(workspace, "decision", "outcome");
  const resolution = readText(
    workspace,
    "resolutionMechanism",
    "resolutionRationale",
  );
  const stancesFilled = positions.filter((row) => row.stance?.trim()).length;

  const applicable: string[] = [];

  if (positions.length >= 2 && disagreement) {
    applicable.push("convergence-point");
  }

  if (decision && (positions.length >= 1 || resolution)) {
    applicable.push("decision-ledger");
  }

  if (stancesFilled >= 2 || (positions.length >= 2 && disagreement)) {
    applicable.push("assumption-surface");
  }

  if (positions.length >= 3) {
    applicable.push("credential-boundary");
  }

  if (decision && disagreement) {
    applicable.push("deferred-detail");
  }

  const unique = [...new Set(applicable)].filter((slug) => slug !== excludeSlug);

  const readyFirst = [
    ...unique.filter((slug) => isPatternReady(slug)),
    ...unique.filter((slug) => !isPatternReady(slug)),
  ];

  return readyFirst.slice(0, 3).flatMap((slug) => {
    const pattern = getPattern(slug);
    if (!pattern) return [];
    return [
      {
        slug,
        name: pattern.title,
        description: pattern.oneliner || pattern.explanation.slice(0, 120),
      },
    ];
  });
}

export function workspaceFromInstanceState(
  state: Record<string, unknown>,
): WorkspaceLike {
  const workspace = state.workspace;
  if (workspace && typeof workspace === "object" && !Array.isArray(workspace)) {
    return workspace as WorkspaceLike;
  }
  return state;
}
