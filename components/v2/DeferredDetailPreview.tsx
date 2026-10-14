"use client";

import { useState } from "react";

type Surface = "chat_ui" | "shared_ui";
type Phase = "evaluation" | "pilot" | "rollout";

const PHASES: { id: Phase; label: string }[] = [
  { id: "evaluation", label: "Evaluation" },
  { id: "pilot", label: "Pilot" },
  { id: "rollout", label: "Rollout" },
];

const PHASE_CONTENT: Record<Phase, {
  heading: string;
  status: string;
  tone: "working" | "review" | "complete";
  summary: string;
  decision: string;
  reason: string;
  evidence: string;
  gate: string;
  owner: string;
  agentLine: string;
}> = {
  evaluation: {
    heading: "Vendor selected; capacity stays open",
    status: "Decision deferred",
    tone: "working",
    summary: "The integration and cost checks support a limited pilot. Production sizing needs real traffic data.",
    decision: "Production capacity · undecided",
    reason: "The evaluation has no representative peak load measurement.",
    evidence: "A limited pilot must measure transaction peaks.",
    gate: "Start pilot with the selected vendor",
    owner: "Platform engineering",
    agentLine: "Evaluation is complete. I’m leaving rollout capacity open until the pilot measures actual demand.",
  },
  pilot: {
    heading: "Peak demand is 3× the estimate",
    status: "Gate ready",
    tone: "review",
    summary: "The pilot supplies the missing load evidence and changes the earlier capacity assumption.",
    decision: "Production capacity · ready to set",
    reason: "Sizing was held until traffic could be observed in a representative run.",
    evidence: "Peak transactions reached three times the evaluation estimate.",
    gate: "Review the higher capacity target before rollout",
    owner: "Platform operations",
    agentLine: "The pilot found a higher peak than we expected. The capacity decision is now ready for review.",
  },
  rollout: {
    heading: "Capacity target set from pilot evidence",
    status: "Decision made",
    tone: "complete",
    summary: "The rollout plan uses the observed peak and a reserve agreed at the gate.",
    decision: "Production capacity · approved for rollout",
    reason: "The team waited for the pilot rather than committing to the evaluation estimate.",
    evidence: "The 3× peak measurement informed the approved target.",
    gate: "Operations owns rollout monitoring",
    owner: "Platform operations",
    agentLine: "The team set the capacity target using pilot demand. Operations now owns the rollout phase.",
  },
};

function PhaseView({ phase }: { phase: Phase }) {
  const item = PHASE_CONTENT[phase];
  const phaseNumber = PHASES.findIndex((entry) => entry.id === phase) + 1;
  return (
    <section className="v2-deferred" aria-label="Deferred decision by phase">
      <header className="v2-deferred__head">
        <div>
          <p className="v2-deferred__eyebrow">Phase {phaseNumber} · {PHASES[phaseNumber - 1].label}</p>
          <h3>{item.heading}</h3>
        </div>
        <span className="v2-deferred__status" data-status={item.tone}>{item.status}</span>
      </header>
      <p className="v2-deferred__detail">{item.summary}</p>
      <div className="v2-deferred__decision">
        <div className="v2-deferred__decision-label"><span>{item.decision}</span></div>
      </div>
      <dl className="v2-deferred__facts">
        <div><dt>Why it waited</dt><dd>{item.reason}</dd></div>
        <div><dt>Evidence</dt><dd>{item.evidence}</dd></div>
        <div><dt>Gate / next step</dt><dd>{item.gate}</dd></div>
      </dl>
      <p className="v2-deferred__next">Phase owner · {item.owner}</p>
      <ol className="v2-deferred__trail" aria-label="Migration phases">
        {PHASES.map((entry, index) => (
          <li key={entry.id} data-current={phase === entry.id ? "true" : undefined}>
            <span>{index + 1}</span><b>{entry.label}</b>
            <small>{entry.id === "evaluation" ? "Capacity held" : entry.id === "pilot" ? "Demand measured" : "Target set"}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function DeferredDetailPreview({ surface }: { surface: Surface }) {
  const [phase, setPhase] = useState<Phase>("evaluation");
  const item = PHASE_CONTENT[phase];
  const control = (
    <div className="v2-deferred__stages" aria-label="Preview phase">
      {PHASES.map((entry) => (
        <button key={entry.id} type="button" aria-pressed={phase === entry.id} onClick={() => setPhase(entry.id)}>
          {entry.label}
        </button>
      ))}
    </div>
  );

  if (surface === "chat_ui") {
    return (
      <div className="v2-deferred-chat">
        <header><span>Payments migration</span><strong>MIG-1842</strong></header>
        {control}
        <div className="v2-deferred-chat__turn">
          <span className="v2-deferred-chat__avatar" aria-hidden="true">M</span>
          <div>
            <p className="v2-deferred-chat__byline"><b>Migration agent</b><span>Phase update</span></p>
            <p className="v2-deferred-chat__message">{item.agentLine}</p>
          </div>
          <div className="v2-deferred-chat__panel"><PhaseView phase={phase} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-deferred-workspace">
      <aside><p>PROGRAM</p><strong>Payments migration</strong><span>Phase plan</span><span className="v2-deferred-workspace__active">Decision gates</span></aside>
      <div className="v2-deferred-workspace__main">
        <header><div><p>Migration program / MIG-1842</p><h3>Phase decisions</h3></div><span>Current owner · {item.owner}</span></header>
        {control}
        <PhaseView phase={phase} />
      </div>
    </div>
  );
}
