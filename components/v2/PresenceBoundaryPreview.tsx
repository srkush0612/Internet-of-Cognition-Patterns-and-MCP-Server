"use client";

import { useState } from "react";
import type { Channel } from "@/lib/v2/types";

type AgentId = "rollback" | "triage" | "telemetry";
type State = "Working" | "Observing" | "Waiting" | "Paused";
type AgentStatus = { narrow: boolean; state: State; changed: boolean };

const agents: Record<AgentId, { name: string; task: string; observing: string; broad: string; narrow: string; review: string; initial: State }> = {
  rollback: { name: "Rollback agent", task: "Drafting a rollback plan for edge-router-7.", observing: "Edge-router fleet telemetry · 42 devices", broad: "Draft changes across the fleet", narrow: "Draft changes for edge-router-7 only", review: "Required before applying changes", initial: "Working" },
  triage: { name: "Triage agent", task: "Observing incidents related to edge-router-7.", observing: "Network incidents and change tickets", broad: "Tag and prioritize network incidents", narrow: "Tag edge-router-7 incidents only", review: "Required before closing incidents", initial: "Observing" },
  telemetry: { name: "Telemetry agent", task: "Waiting for the next metrics window.", observing: "Fleet health metrics · 42 devices", broad: "Update fleet health summaries", narrow: "Update edge-router-7 health summary only", review: "Required before publishing summaries", initial: "Waiting" },
};
const initialStatuses: Record<AgentId, AgentStatus> = {
  rollback: { narrow: false, state: "Working", changed: false },
  triage: { narrow: false, state: "Observing", changed: false },
  telemetry: { narrow: false, state: "Waiting", changed: false },
};
const agentIds: AgentId[] = ["rollback", "triage", "telemetry"];
const trackStates = ["Idle", "Observing", "Working", "Waiting", "Acting"];

export function PresenceBoundaryPreview({ surface }: { surface: Channel }) {
  const [selected, setSelected] = useState<AgentId>("rollback");
  const [statuses, setStatuses] = useState(initialStatuses);
  const [expanded, setExpanded] = useState(false);
  const id = surface === "chat_ui" ? "rollback" : selected;
  const agent = agents[id];
  const status = statuses[id];
  const actOn = status.narrow ? agent.narrow : agent.broad;
  const activity = status.state === "Paused" ? "Work paused by you." : status.state === "Waiting" && status.changed ? "Holding at the current boundary." : agent.task;
  function update(patch: Partial<AgentStatus>) {
    setStatuses((current) => ({ ...current, [id]: { ...current[id], ...patch, changed: true } }));
  }
  const boundary = (
    <section className="v2-presence" aria-label={`${agent.name} presence boundary`}>
      <header className="v2-presence__head">
        <div><strong>{agent.name}</strong><span className="v2-presence__activity">{activity}</span></div>
        <span className="v2-presence__status" data-state={status.state.toLowerCase()}>{status.state}</span>
      </header>
      <div className="v2-presence__track" aria-label={`Current state: ${status.state}`}>
        {trackStates.map((item) => <span key={item} data-active={item === status.state}>{item}</span>)}
      </div>
      <div className="v2-presence__scope">
        <div><span>Observing</span><strong>{agent.observing}</strong></div>
        <div><span>Can act on</span><strong>{actOn}</strong></div>
        <div><span>Review</span><strong>{agent.review}</strong></div>
      </div>
      <div className="v2-presence__actions">
        <button type="button" onClick={() => update({ state: status.state === "Paused" ? agent.initial : "Paused" })}>{status.state === "Paused" ? "Resume" : "Pause"}</button>
        <button type="button" onClick={() => update({ narrow: true, state: "Waiting" })} disabled={status.narrow}>Narrow scope</button>
        <button type="button" onClick={() => update({ narrow: false, state: agent.initial })} disabled={!status.narrow}>Widen scope</button>
      </div>
      <p className="v2-presence__change" role="status">{status.changed ? "Boundary changed by you" : "Initial boundary set by you"}</p>
    </section>
  );
  if (surface === "state_signal") return <pre className="v2-code v2-presence__signal"><code>{JSON.stringify({
    type: "presence-boundary", agent_id: `${id}-agent`, state: status.state.toLowerCase(), activity,
    observing: [agent.observing], can_act_on: [actOn], review: agent.review, boundary_changed_by: "you",
  }, null, 2)}</code></pre>;
  if (surface === "shared_ui") return <div className="v2-presence-host">
    <div className="v2-presence-host__bar"><strong>Network operations</strong><span>Agent workspace · edge-router-7 rollback</span></div>
    <div className="v2-presence-host__body"><div className="v2-presence-host__list" aria-label="Agents">{agentIds.map((agentId) => <button key={agentId} type="button" aria-pressed={selected === agentId} onClick={() => setSelected(agentId)}>{agents[agentId].name} · {statuses[agentId].state}</button>)}</div>{boundary}</div>
  </div>;
  return <div className="v2-presence-chat">
    <div className="v2-presence-chat__bar">Network ops / edge-router-7 rollback</div>
    <div className="v2-presence-chat__turn"><span className="v2-presence-chat__avatar" aria-hidden="true">R</span><div><strong>Rollback agent</strong><p>I’m drafting a rollback plan. Here is my current activity and boundary.</p><button type="button" className="v2-presence-chat__reveal" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Hide boundary" : "Show boundary"}</button>{expanded ? boundary : null}</div></div>
  </div>;
}
