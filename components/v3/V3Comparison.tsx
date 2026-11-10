"use client";

import { useState } from "react";

type View = "without" | "with";

const separateActions = [
  { agent: "Triage agent", action: "Runs diagnostics autonomously" },
  { agent: "Planner agent", action: "Asks: “Approve rollback?”" },
  { agent: "Monitor agent", action: "Asks: “Restart the service?”" },
] as const;

export function V3Comparison() {
  const [view, setView] = useState<View>("without");

  return (
    <div className="v3-comparison" data-view={view}>
      <div className="v3-comparison-toolbar">
        <span className="v3-comparison-caption">One situation, two outcomes</span>
        <div className="v3-comparison-switch" role="group" aria-label="Compare agent collaboration">
          <button type="button" aria-pressed={view === "without"} onClick={() => setView("without")}>Without HAX 2.0</button>
          <button type="button" aria-pressed={view === "with"} onClick={() => setView("with")}>With HAX 2.0</button>
        </div>
      </div>

      <div className="v3-comparison-stage">
        <div className="v3-comparison-layer v3-comparison-layer--without" aria-hidden={view !== "without"}>
          <p className="v3-comparison-label">Separate actions &amp; requests</p>
          <div className="v3-comparison-agent-list">
            {separateActions.map(({ agent, action }) => (
              <div className="v3-comparison-agent" key={agent}>
                <strong>{agent}</strong>
                <span>{action}</span>
              </div>
            ))}
          </div>
          <p className="v3-comparison-takeaway">Agents act and ask for input. The person still has to reconcile the requests, their context, and their consequences.</p>
        </div>

        <div className="v3-comparison-layer v3-comparison-layer--with" aria-hidden={view !== "with"}>
          <p className="v3-comparison-label">One recovery plan, with context</p>
          <div className="v3-comparison-proposal">
            <h3>Review proposed recovery</h3>
            <p>Diagnostics link the errors to the release. Rollback is proposed; restart is held to avoid conflicting actions. Active sessions may be interrupted.</p>
            <div className="v3-comparison-options" aria-label="Example response options">
              <span>Approve rollback</span>
              <span>Ask for details</span>
              <span>Defer</span>
            </div>
          </div>
          <p className="v3-comparison-takeaway">Agents know when to act or wait. The person sees why rollback is proposed and can approve it, ask for details, or defer.</p>
        </div>
      </div>
    </div>
  );
}
