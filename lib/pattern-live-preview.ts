import type { BoundarySplitData } from "@/lib/boundary-split";
import type { SealedLedgerRecord } from "@/lib/decision-ledger-data";
import {
  defaultWorkspaceForSlug,
  getWorkspaceState,
  mergeWorkspaceForSlug,
  type AgentPosition,
  type AssumptionSurfaceWorkspaceState,
  type BackgroundWorkWorkspaceState,
  type ConvergencePointWorkspaceState,
  type CredentialBoundaryWorkspaceState,
  type DecisionLedgerWorkspaceState,
  type DeferredDetailWorkspaceState,
  type PresenceBoundaryWorkspaceState,
} from "@/lib/workspace-defaults";
import type { PresenceTrackState } from "@/lib/presence-boundary";

export type PatternLivePreviewInput = {
  workspace: Record<string, unknown>;
  context?: Record<string, string>;
  title?: string;
};

export function resolveLivePreview(
  slug: string,
  instanceState?: Record<string, unknown>,
): PatternLivePreviewInput {
  const defaults = defaultWorkspaceForSlug(slug);
  const workspace = mergeWorkspaceForSlug(slug, instanceState?.workspace as Record<string, unknown> ?? {});
  const rawContext = instanceState?.context;
  const context =
    rawContext && typeof rawContext === "object" && !Array.isArray(rawContext)
      ? Object.fromEntries(
          Object.entries(rawContext as Record<string, unknown>).map(
            ([key, value]) => [key, String(value ?? "")],
          ),
        )
      : undefined;

  return {
    workspace,
    context,
    title: typeof instanceState?.title === "string" ? instanceState.title : undefined,
  };
}

function isFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.some((item) => isFilled(item));
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(isFilled);
  }
  return true;
}

/** True when the user has entered something beyond empty defaults. */
export function hasUserScenario(
  slug: string,
  workspace: Record<string, unknown>,
): boolean {
  const defaults = defaultWorkspaceForSlug(slug);
  for (const [key, value] of Object.entries(workspace)) {
    const baseline = defaults[key as keyof typeof defaults];
    if (JSON.stringify(value) === JSON.stringify(baseline)) continue;
    if (isFilled(value)) return true;
  }
  return false;
}

export function asDecisionLedger(
  workspace: Record<string, unknown>,
): DecisionLedgerWorkspaceState {
  return workspace as DecisionLedgerWorkspaceState;
}

export function decisionLedgerLiveRecord(
  workspace: DecisionLedgerWorkspaceState,
): SealedLedgerRecord | null {
  const chosen = workspace.chosen?.trim() || workspace.decision?.trim();
  if (!chosen) return null;

  const alternativesText = workspace.alternatives?.trim();
  const alternatives = alternativesText
    ? alternativesText.split(/[,;\n]+/).map((item) => ({ text: item.trim() })).filter((a) => a.text)
    : [{ text: "Add alternatives considered in the edit panel." }];

  const inputs: string[] = [];
  if (workspace.constraints?.trim()) inputs.push(workspace.constraints.trim());
  if (workspace.decided_by?.trim()) inputs.push(`Decided by: ${workspace.decided_by.trim()}`);
  if (inputs.length === 0) inputs.push("Add constraints or decision context in the edit panel.");

  return {
    id: "live-scenario",
    action: chosen,
    changeRef: "YOUR-CASE",
    attribution: workspace.decided_by?.trim()
      ? "operator-added-context"
      : "agent-decision",
    agentReason: workspace.reasoning?.trim() || "Add reasoning in the edit panel.",
    operatorContext: workspace.decision?.trim() && workspace.decision.trim() !== chosen
      ? `Decision needed: ${workspace.decision.trim()}`
      : undefined,
    alternatives,
    inputs,
    policyVersion: "Your scenario",
    sealedAgo: "In progress",
  };
}

export function asDeferredDetail(
  workspace: Record<string, unknown>,
): DeferredDetailWorkspaceState & Record<string, unknown> {
  return workspace as DeferredDetailWorkspaceState & Record<string, unknown>;
}

export function asConvergence(
  workspace: Record<string, unknown>,
): ConvergencePointWorkspaceState & Record<string, unknown> {
  return workspace as ConvergencePointWorkspaceState & Record<string, unknown>;
}

export function asAssumption(
  workspace: Record<string, unknown>,
): AssumptionSurfaceWorkspaceState {
  return workspace as AssumptionSurfaceWorkspaceState;
}

export function asPresence(
  workspace: Record<string, unknown>,
): PresenceBoundaryWorkspaceState {
  return workspace as PresenceBoundaryWorkspaceState;
}

export function asCredential(
  workspace: Record<string, unknown>,
): CredentialBoundaryWorkspaceState {
  return workspace as CredentialBoundaryWorkspaceState;
}

export function asBackgroundWork(
  workspace: Record<string, unknown>,
): BackgroundWorkWorkspaceState {
  return workspace as BackgroundWorkWorkspaceState;
}

export function credentialBoundaryFromWorkspace(
  workspace: CredentialBoundaryWorkspaceState,
): BoundarySplitData | null {
  if (
    !workspace.roles_and_contributions?.trim() &&
    !workspace.capability_gaps?.trim() &&
    !workspace.decision?.trim()
  ) {
    return null;
  }

  return {
    left: {
      label: "Roles & contributions",
      steps: workspace.roles_and_contributions?.trim()
        ? [workspace.roles_and_contributions.trim()]
        : ["Describe each role's contribution in the edit panel"],
      cannotSee: workspace.capability_gaps?.trim() || "capability gaps",
    },
    right: {
      label: "Capability gaps",
      steps: workspace.capability_gaps?.trim()
        ? [workspace.capability_gaps.trim()]
        : ["Explain why one role wasn't enough"],
      cannotSee: workspace.roles_and_contributions?.trim() || "other roles' contributions",
    },
    outcome: {
      label: "Decision",
      text:
        workspace.decision?.trim() ||
        workspace.decision_authority?.trim() ||
        "Describe the decision that required multiple roles.",
    },
  };
}

export function presenceStateFromWorkspace(
  _workspace: PresenceBoundaryWorkspaceState,
): PresenceTrackState {
  return "Working";
}

export function convergenceAgentsFromPositions(positions: AgentPosition[]) {
  return positions
    .filter((position) => position.agent?.trim() || position.stance?.trim())
    .map((position, index) => ({
      name: position.agent.trim() || `Agent ${index + 1}`,
      preview: position.stance.trim() || "Position not set yet",
      timestamp: "your scenario",
      status: "active" as const,
    }));
}

export function convergenceInboxMessage(
  workspace: ConvergencePointWorkspaceState & Record<string, unknown>,
): string | null {
  const parts: string[] = [];
  if (workspace.disagreement?.trim()) {
    parts.push(workspace.disagreement.trim());
  }
  const filledPositions = (workspace.positions ?? []).filter((p) => p.stance?.trim());
  if (filledPositions.length > 0) {
    parts.push(
      filledPositions
        .map((p) => `${p.agent}: ${p.stance}`)
        .join(" · "),
    );
  }
  if (workspace.decision?.trim()) {
    parts.push(`Decision: ${workspace.decision.trim()}`);
  }
  if (typeof workspace.resolutionRationale === "string" && workspace.resolutionRationale.trim()) {
    parts.push(workspace.resolutionRationale.trim());
  } else if (
    typeof workspace.resolutionMechanism === "string" &&
    workspace.resolutionMechanism.trim()
  ) {
    parts.push(workspace.resolutionMechanism.trim());
  }
  return parts.length > 0 ? parts.join("\n\n") : null;
}
