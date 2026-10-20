"use client";

import { useState } from "react";

const steps = [
  {
    number: "01", name: "Fetch ticket", kind: "Fixed API call", tone: "success",
    input: "Ticket ID T-482", output: "Ticket fields and customer history",
    detail: "The support API returns the same fields for the same ticket and access scope.",
    gate: "No review gate",
  },
  {
    number: "02", name: "Choose response path", kind: "Agent-selected", tone: "warning",
    input: "Ticket fields and support policy", output: "Refund or troubleshooting path",
    detail: "The agent interprets the ticket and selects a path. The selected path is recorded before drafting.",
    gate: "Path shown to operator",
  },
  {
    number: "03", name: "Draft reply", kind: "Generated content", tone: "warning",
    input: "Selected path and ticket context", output: "Proposed customer reply",
    detail: "The reply is generated from the selected path. It can vary even when the input is similar.",
    gate: "Operator reviews before send",
  },
] as const;

export function certaintyBoundarySignal() {
  return JSON.stringify({
    type: "certainty-boundary",
    workflow: "Support ticket reply",
    agent: "Support Agent",
    steps: steps.map((step) => ({
      id: step.number,
      name: step.name,
      execution: step.kind,
      input: step.input,
      output: step.output,
      review: step.gate,
    })),
    current_step: "03",
    downstream_state: "waiting_for_operator_review",
  }, null, 2);
}

export function CertaintyBoundaryPreview() {
  const [selected, setSelected] = useState(2);
  const step = steps[selected];

  return <div className="v2-certainty">
    <div className="v2-certainty__shell">
      <aside className="v2-certainty__sidebar" aria-label="Settings navigation">
        <strong>Support Agent</strong>
        <span>Overview</span>
        <span className="v2-certainty__sidebar-active">Workflow</span>
        <span>Access</span>
      </aside>
      <div className="v2-certainty__main">
        <div className="v2-certainty__heading">
          <div><span className="v2-certainty__eyebrow">Workflow settings</span><h3>Support ticket reply</h3><p>How each step produces its output</p></div>
          <span className="v2-certainty__status">Review pending</span>
        </div>
        <ol className="v2-certainty__path" aria-label="Workflow steps">
          {steps.map((item, index) => <li key={item.number}>
            <button type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className="v2-certainty__step" data-selected={selected === index}>
              <span className="v2-certainty__number">{item.number}</span>
              <strong>{item.name}</strong>
              <span className="v2-certainty__kind" data-tone={item.tone}>{item.kind}</span>
            </button>
          </li>)}
        </ol>
        <div className="v2-certainty__detail" aria-live="polite">
          <div className="v2-certainty__detail-head"><span>Step {step.number}</span><strong>{step.name}</strong></div>
          <p>{step.detail}</p>
          <dl><div><dt>Input</dt><dd>{step.input}</dd></div><div><dt>Output</dt><dd>{step.output}</dd></div><div><dt>Review point</dt><dd>{step.gate}</dd></div></dl>
        </div>
      </div>
    </div>
  </div>;
}
