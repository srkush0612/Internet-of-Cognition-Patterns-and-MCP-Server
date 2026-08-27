"use client";

import {
  getAgentColor,
  getUniqueAgentPositions,
} from "@/lib/convergence-timeline-from-workspace";
import type { ConvergencePointWorkspaceState } from "@/lib/workspace-defaults";

export function DecisionTreeVisualization({
  workspace,
}: {
  workspace: ConvergencePointWorkspaceState & Record<string, unknown>;
}) {
  const positions = getUniqueAgentPositions(workspace);
  const disagreement = String(workspace.disagreement ?? "").trim();
  const decision = String(workspace.decision ?? "").trim();
  const resolution = String(
    workspace.resolutionMechanism ?? workspace.resolutionRationale ?? "",
  ).trim();

  return (
    <div className="cp-decision-tree">
      <h3 className="cp-decision-tree__title">Decision flow</h3>

      <div className="cp-decision-tree__root">
        <div className="cp-decision-tree__root-label">Core disagreement</div>
        <div className="cp-decision-tree__root-text">
          {disagreement || "No disagreement recorded yet."}
        </div>
      </div>

      <div className="cp-decision-tree__branches">
        {positions.map((position, index) => (
          <div
            key={`branch-${index}-${position.agent}`}
            className="cp-decision-tree__branch"
            style={{ borderLeft: `3px solid ${getAgentColor(position.agent)}` }}
          >
            <div
              className="cp-decision-tree__branch-label"
              style={{ color: getAgentColor(position.agent) }}
            >
              {position.agent}
            </div>
            <div className="cp-decision-tree__branch-text">
              {position.stance?.trim() || "(no stance recorded)"}
            </div>
          </div>
        ))}
      </div>

      <div className="cp-decision-tree__resolution">
        <div className="cp-decision-tree__resolution-label">Resolution</div>
        <div className="cp-decision-tree__resolution-text">
          {decision || "(not yet decided)"}
          {resolution ? `\n${resolution}` : ""}
        </div>
      </div>
    </div>
  );
}
