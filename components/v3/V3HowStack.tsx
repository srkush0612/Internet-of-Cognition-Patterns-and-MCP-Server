"use client";

import { useMemo, useState } from "react";

const INITIAL = {
  trigger: "Checkout latency rose after the release.",
  action: "Restart payments service",
  choices: "Approve, Ask for details, Defer",
};

function TileHead({ number, title, body }: { number: string; title: string; body: string }) {
  return <div className="v3-how-tile__copy">
    <span className="v3-how-tile__number">{number} / 04</span>
    <h3>{title}</h3>
    <p>{body}</p>
  </div>;
}

export function V3HowStack() {
  const [behavior, setBehavior] = useState(INITIAL);
  const [response, setResponse] = useState<string | null>(null);
  const choices = useMemo(() => behavior.choices.split(",").map((choice) => choice.trim()).filter(Boolean).slice(0, 4), [behavior.choices]);

  function update(field: keyof typeof INITIAL, value: string) {
    setBehavior((current) => ({ ...current, [field]: value }));
    setResponse(null);
  }

  const outcome = response === "Approve"
    ? "Approved. The agent can proceed and records the decision."
    : response === "Ask for details"
      ? "The agent shows its evidence before anything changes."
      : response === "Defer"
        ? "The agent waits. The proposed action stays on hold."
        : response ? `Decision recorded: ${response}.` : "Choose a response to see what happens next.";

  return <div className="v3-how-stack">
    <article className="v3-how-tile" id="studio">
      <TileHead number="01" title="Find a pattern with a prompt" body="Tell your agent what you are trying to build. Ask it which HAX patterns fit your task." />
      <figure className="v3-how-stage v3-how-image" role="img" aria-label="A person asks their agent to find HAX patterns for a service restart approval. The agent looks up matching patterns through HAX MCP.">
        <div className="v3-how-stage__top"><span className="v3-how-stage__brand">Your agent <span>· New chat</span></span><span className="v3-how-stage__tag v3-how-stage__tag--connected"><i /> HAX MCP connected</span></div>
        <div className="v3-how-prompt-image">
          <p className="v3-how-prompt-image__question">What should we build today?</p>
          <div className="v3-how-prompt-image__request">Find HAX patterns for an agent that proposes a service restart and asks an operator to decide.</div>
          <div className="v3-how-prompt-image__reply"><span className="v3-how-prompt-image__avatar">A</span><div><strong>I’ll find the right HAX patterns.</strong><small><i /> Finding patterns · HAX MCP</small></div></div>
        </div>
        <div className="v3-how-prompt-image__composer"><span>+</span><p>Ask your agent…</p><span>↵</span></div>
      </figure>
    </article>

    <article className="v3-how-tile">
      <TileHead number="02" title="HAX finds the right building blocks" body="Your agent gets patterns that fit the task, plus the interface parts needed to show them." />
      <figure className="v3-how-stage v3-how-image" role="img" aria-label="A request flows through HAX MCP to two matched patterns, Pre-Action Handshake and Inline Rationale, and two interface parts, a context card and decision actions.">
        <div className="v3-how-stage__top"><span className="v3-how-stage__brand">Pattern match</span><span className="v3-how-stage__tag">HAX MCP</span></div>
        <div className="v3-how-map">
          <div className="v3-how-map__request"><small>YOUR REQUEST</small><strong>Review a proposed service restart</strong></div>
          <span className="v3-how-map__arrow" aria-hidden="true">→</span>
          <div className="v3-how-map__hub"><strong>HAX</strong><small>patterns + guidance</small></div>
          <span className="v3-how-map__arrow" aria-hidden="true">→</span>
          <div className="v3-how-map__matches">
            <div><small>PATTERN</small><strong>Pre-Action Handshake</strong><span>✓</span></div>
            <div><small>PATTERN</small><strong>Inline Rationale</strong><span>✓</span></div>
            <div><small>INTERFACE PART</small><strong>Context card</strong><span>✓</span></div>
            <div><small>INTERFACE PART</small><strong>Decision actions</strong><span>✓</span></div>
          </div>
        </div>
      </figure>
    </article>

    <article className="v3-how-tile">
      <TileHead number="03" title="Create a behavior you can edit" body="Review when the agent acts, what it proposes, and how a person can respond. Change the draft to fit your workflow." />
      <div className="v3-how-stage v3-how-editor" aria-label="Editable behavior draft">
        <div className="v3-how-stage__top"><span className="v3-how-stage__brand">Behavior draft</span><span className="v3-how-stage__tag">Editable</span></div>
        <div className="v3-how-editor__body">
          <div className="v3-how-editor__intro"><span>Pre-Action Handshake</span><strong>Service restart review</strong><p>Edit this example. The next step updates as you type.</p></div>
          <label>When this happens<input value={behavior.trigger} onChange={(event) => update("trigger", event.target.value)} /></label>
          <label>The agent proposes<input value={behavior.action} onChange={(event) => update("action", event.target.value)} /></label>
          <label>A person can choose<input value={behavior.choices} onChange={(event) => update("choices", event.target.value)} /></label>
        </div>
      </div>
    </article>

    <article className="v3-how-tile">
      <TileHead number="04" title="Show the behavior in your workflow" body="Place the behavior where the work happens, with the agent’s context and the person’s choices together." />
      <div className="v3-how-stage" aria-label="Interactive incident workspace example">
        <div className="v3-how-stage__top"><span className="v3-how-stage__brand">Incident workspace</span><span className="v3-how-stage__tag">INC-2231</span></div>
        <div className="v3-how-product">
          <div className="v3-how-product__crumb">Payments API <span>/</span> Response</div>
          <div className="v3-how-product__alert"><span>PRE-ACTION CHECK</span><strong>{response ? "Decision recorded" : "Needs your input"}</strong></div>
          <h4>{behavior.action.trim() || "Proposed action"}{behavior.action.trim().endsWith("?") ? "" : "?"}</h4>
          <p><b>@triage</b> reports: {behavior.trigger.trim() || "A change needs review."}</p>
          <div className="v3-how-product__choices" aria-label="Choose an operator response">{choices.map((choice) => <button type="button" key={choice} aria-pressed={response === choice} onClick={() => setResponse(choice)}>{choice}</button>)}</div>
          <div className="v3-how-product__outcome" aria-live="polite">{outcome}</div>
        </div>
      </div>
    </article>
  </div>;
}
