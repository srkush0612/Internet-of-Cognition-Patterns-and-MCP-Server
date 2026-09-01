import { PatternComponentCard } from "./PatternComponentCard";
import { ConvergencePointVisualizationSelector } from "./ConvergencePointVisualizationSelector";
import { PatternInboxShell } from "./PatternInboxShell";
import {
  asConvergence,
  convergenceAgentsFromPositions,
  convergenceInboxMessage,
  hasUserScenario,
  resolveLivePreview,
  type PatternLivePreviewInput,
} from "@/lib/pattern-live-preview";
import { convergenceFormToWorkspace } from "@/components/patterns/edit/convergence-point-extractor";
import type { ConvergenceSaveRevealState } from "@/lib/convergence-save-reveal";
import { defaultWorkspaceForSlug } from "@/lib/workspace-defaults";

export function ConvergencePoint({
  compact = false,
  live,
  saveReveal,
}: {
  compact?: boolean;
  live?: PatternLivePreviewInput;
  saveReveal?: ConvergenceSaveRevealState;
}) {
  const workspace = live
    ? asConvergence(live.workspace)
    : asConvergence(defaultWorkspaceForSlug("convergence-point"));
  const isDemoData =
    (!live || !hasUserScenario("convergence-point", live.workspace)) &&
    !saveReveal?.showAlternatives;
  const contextLabel =
    workspace?.disagreement?.trim() ||
    (typeof workspace?.scenario === "string" && workspace.scenario.trim()) ||
    live?.title?.trim() ||
    "Mission room · Mythos Corp routing";

  return (
    <div className="convergence-point-wide">
      <ConvergencePointVisualizationSelector
        compact={compact}
        workspace={workspace}
        isDemoData={isDemoData}
        contextLabel={contextLabel}
        saveReveal={saveReveal}
      />
    </div>
  );
}

const CONVERGENCE_INBOX_AGENTS = [
  {
    name: "Prometheus",
    preview: "Hybrid topology agreed at 13:45",
    timestamp: "2m ago",
    status: "active" as const,
  },
  {
    name: "Themis",
    preview: "Failover path still diverged",
    timestamp: "just now",
    status: "alert" as const,
  },
  {
    name: "Athena",
    preview: "Vendor scope pending your call",
    timestamp: "1m ago",
    status: "waiting" as const,
  },
];

const CONVERGENCE_INBOX_MESSAGE =
  "Two decisions are still open on the timeline. Prometheus and Hermes lean Osaka for failover; Themis and Athena want in-region redundancy. Vendor scope is split the other way. The view shows where agents converged and where they are still negotiating.";

export function ConvergencePointInContext({
  live,
  data,
  saveReveal,
}: {
  live?: PatternLivePreviewInput;
  data?: {
    agentRoster?: string[];
    disagreementDimension?: string;
    resolutionMechanism?: string;
    outcome?: string;
  };
  saveReveal?: ConvergenceSaveRevealState;
}) {
  const resolvedLive =
    live ??
    (data
      ? resolveLivePreview("convergence-point", {
          workspace: convergenceFormToWorkspace(data),
        })
      : undefined);

  const workspace = resolvedLive ? asConvergence(resolvedLive.workspace) : null;
  const useLive = resolvedLive
    ? hasUserScenario("convergence-point", resolvedLive.workspace)
    : false;
  const agents = useLive
    ? convergenceAgentsFromPositions(workspace?.positions ?? [])
    : CONVERGENCE_INBOX_AGENTS;
  const message =
    (useLive && workspace && convergenceInboxMessage(workspace)) ||
    CONVERGENCE_INBOX_MESSAGE;
  const activeAgent =
    agents.find((agent) => agent.status === "alert")?.name ??
    agents[0]?.name ??
    "Themis";

  return (
    <PatternInboxShell
      agents={agents.length > 0 ? agents : CONVERGENCE_INBOX_AGENTS}
      activeAgentName={activeAgent}
      message={message}
    >
      <ConvergencePoint compact live={resolvedLive} saveReveal={saveReveal} />
    </PatternInboxShell>
  );
}
