"use client";

import { useEffect, useRef, useState } from "react";
import { AUDIENCE_LABEL, CHANNEL_FACING, CHANNEL_LABEL, LEVEL_LABEL } from "@/lib/v2/levels";
import { MODE_LABEL } from "@/lib/v2/modes";
import { buildStudioGeneratedUi, generatedSurfaceName, getStudioGeneratedChanges } from "@/lib/v2/studio-generated-ui";
import type { SpecDraft } from "@/lib/v2/spec";
import type { Channel, Pattern } from "@/lib/v2/types";

function responseResult(action: string): string {
  const lower = action.toLowerCase();
  if (/defer|later|wait/.test(lower)) return "Decision deferred. The agent is waiting.";
  if (/decline|reject|revoke|stop/.test(lower)) return "The proposed change is stopped.";
  if (/correct|revise|restore/.test(lower)) return "The agent will revise this before proceeding.";
  if (/evaluate|verify|source|trace|review/.test(lower)) return "Evidence is open for review.";
  if (/approve|consent|proceed|adopt|keep/.test(lower)) return "The decision is recorded. The agent can continue.";
  return `“${action}” is recorded for this interaction.`;
}

export function StudioGeneratedPreview({ pattern, draft, behaviorNotes }: { pattern: Pattern; draft: SpecDraft; behaviorNotes: string[] }) {
  const model = buildStudioGeneratedUi(pattern, draft, behaviorNotes);
  const changes = getStudioGeneratedChanges(pattern, draft, behaviorNotes);
  const [surface, setSurface] = useState<Channel>(model.channel);
  const [revealed, setRevealed] = useState(model.reveal === "inline");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (loadingTimer.current) clearTimeout(loadingTimer.current); }, []);
  function transition(label: string, action: () => void) {
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    setLoading(label);
    loadingTimer.current = setTimeout(() => { action(); setLoading(null); loadingTimer.current = null; }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 120 : 360);
  }
  const channels = [...new Set([model.channel, ...pattern.channels])];
  const agentFacing = CHANNEL_FACING[surface] === "agent";
  const recipient = draft.audience ? AUDIENCE_LABEL[draft.audience] : "Receiver";
  const participants = draft.level ? LEVEL_LABEL[draft.level] : "Agent + person";
  const move = draft.mode ? MODE_LABEL[draft.mode] : "Agent move";
  const interactionVisible = model.reveal !== "on_request" || revealed;

  const evidence = <div className="v2-generated__evidence" data-changed={changes.order} aria-label="Evidence">
    {model.evidence.map((item) => <div key={`${item.label}:${item.value}`}><span>{item.label}</span><strong>{item.value}</strong></div>)}
  </div>;
  const output = <div className="v2-generated__output" data-changed={changes.mode || changes.order}><span>{move.toUpperCase()}{changes.mode ? <b>CHANGED</b> : null}</span><h3>{model.title}</h3><p>{model.output}</p></div>;
  const explanation = <div className="v2-generated__explanation" data-changed={changes.reveal || changes.order}><span>WHY THIS IS HERE{changes.reveal || changes.order ? <b>CHANGED</b> : null}</span><p>{model.rationale}</p>{model.confidence ? <small>{model.confidence}</small> : null}</div>;
  const content = <>
    <div className="v2-generated__meta"><span data-changed={changes.trigger}>WHEN · {model.trigger}{changes.trigger ? <b>CHANGED</b> : null}</span><span data-changed={changes.audience}>FOR · {recipient}{changes.audience ? <b>CHANGED</b> : null}</span><span data-changed={changes.level}>{participants}{changes.level ? <b>CHANGED</b> : null}</span></div>
    {model.reveal !== "inline" && !revealed ? <>
      <div className="v2-generated__prelude" data-changed={changes.reveal}><span>EARLIER IN THE INTERACTION</span><p>{model.output}</p></div>
      <button type="button" className="v2-generated__reveal" data-changed={changes.reveal} onClick={() => transition("Revealing pattern details", () => setRevealed(true))}>{model.reveal === "on_request" ? "Ask why" : "Show details"}{changes.reveal ? <b>NEW</b> : null}</button>
    </> : <>
      {model.order === "evidence_first" ? evidence : output}
      {explanation}
      {model.order === "evidence_first" ? output : evidence}
      {model.reveal !== "inline" ? <button type="button" className="v2-generated__collapse" onClick={() => transition("Returning to the earlier state", () => setRevealed(false))}>Hide details</button> : null}
    </>}
    {interactionVisible && model.approval ? <p className="v2-generated__gate" data-changed={changes.approval}>Waiting for a decision before the agent continues{changes.approval ? <b>NEW</b> : null}</p> : null}
    {interactionVisible && model.actions.length ? <div className="v2-generated__actions" aria-label="Receiver actions">{model.actions.map((action) => <button type="button" key={action} data-added={changes.addedActions.includes(action)} aria-pressed={selectedAction === action} onClick={() => transition("Applying the selected response", () => { setSelectedAction(action); if (/evaluate|verify|source|trace|review/i.test(action)) setRevealed(true); })}>{action}{changes.addedActions.includes(action) ? <b>NEW</b> : null}</button>)}</div> : null}
    {interactionVisible && selectedAction ? <p className="v2-generated__result" role="status">{responseResult(selectedAction)}</p> : null}
  </>;

  return <div className="v2-generated" data-surface={surface} data-reveal={model.reveal} data-pattern={pattern.id}>
    <div className="v2-generated__top"><span>ADAPTED PATTERN UI</span><span>Interactive preview</span></div>
    <div className="v2-generated__change-strip" aria-live="polite"><strong>{changes.labels.length ? `${changes.labels.length} ${changes.labels.length === 1 ? "difference" : "differences"} from original` : "Matches original behavior"}</strong><div>{changes.labels.map((label) => <span key={label}>{label}</span>)}{changes.removedActions.map((action) => <span key={`removed:${action}`}>Removed: {action}</span>)}</div></div>
    {channels.length > 1 ? <div className="v2-generated__tabs" role="tablist" aria-label="Generated views">{channels.map((channel) => <button type="button" role="tab" key={channel} data-changed={changes.channel && channel === model.channel} aria-selected={surface === channel} onClick={() => transition(`Opening ${CHANNEL_LABEL[channel]}`, () => { setSurface(channel); setSelectedAction(null); })}>{CHANNEL_LABEL[channel]}{changes.channel && channel === model.channel ? <b>CHANGED</b> : null}</button>)}</div> : null}
    <div className="v2-generated__host" data-kind={agentFacing ? "agent" : surface === "chat_ui" ? "chat" : surface === "settings_panel" ? "settings" : "shared"} data-changed={changes.channel && surface === model.channel}>
      {agentFacing ? <div className="v2-generated__signal"><div><span>STRUCTURED SIGNAL</span><strong>{generatedSurfaceName(surface)}</strong></div><pre>{JSON.stringify({ pattern: pattern.id, mode: draft.mode, trigger: model.trigger, recipient: draft.audience, participants: draft.level, reveal: model.reveal, order: model.order, requires_decision: model.approval, available_responses: model.actions, response: selectedAction ?? "awaiting" }, null, 2)}</pre></div> : <>
        {surface === "chat_ui" ? <div className="v2-generated__chat-rail"><strong>Conversation</strong><span>{model.agentName}</span><span>{["inline-rationale", "pre-action-handshake", "convergence-point"].includes(pattern.id) ? "payments-svc" : pattern.name}</span></div> : null}
        {surface === "settings_panel" ? <div className="v2-generated__surface-head"><span>AGENT SETUP</span><strong>Interaction settings</strong></div> : null}
        {surface === "shared_ui" ? <div className="v2-generated__surface-head"><span>SHARED WORKSPACE</span><strong>Incident · INC-2231</strong></div> : null}
        <div className="v2-generated__interaction"><div className="v2-generated__identity"><span className="v2-generated__avatar">A</span><div><strong>{model.agentName}</strong><span>{surface === "chat_ui" ? "in conversation" : generatedSurfaceName(surface)}</span></div><span>LIVE</span></div>{content}</div>
      </>}
      {loading ? <div className="v2-generated__loading" role="status" aria-label={loading}><div className="v2-generated__loading-head"><span>{loading}</span><i aria-hidden="true" /></div><div className="v2-generated__loading-body" aria-hidden="true"><i /><i /><i /><div><i /><i /><i /></div></div></div> : null}
    </div>
  </div>;
}
