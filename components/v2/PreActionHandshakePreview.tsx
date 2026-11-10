"use client";

import { useState } from "react";
import { Check, RotateCcw, ShieldAlert } from "lucide-react";

type Decision = "pending" | "consented" | "declined" | "deferred" | "corrected";

/** A working chat mock that records the operator's handshake response locally. */
export function PreActionHandshakePreview() {
  const [decision, setDecision] = useState<Decision>("pending");
  const [corrected, setCorrected] = useState(false);

  const reset = () => {
    setDecision("pending");
    setCorrected(false);
  };

  const correct = () => {
    setCorrected(true);
    setDecision("corrected");
  };

  const proposal = corrected
    ? "Inspect the canary cohort and compare its error rate with the previous release before choosing a mitigation."
    : "Roll back checkout-api to release 2.18.4.";

  const decisionCopy: Record<Decision, string> = {
    pending: "Waiting for the operator. No action has been taken.",
    consented: "Consent recorded. A connected workflow can now proceed with the proposal shown above.",
    declined: "Declined. The proposed action remains stopped.",
    deferred: "Deferred. The action remains stopped while the operator gathers more evidence.",
    corrected: "Correction recorded. The revised proposal is waiting for a fresh decision.",
  };

  return (
    <div className="v2-handshake-chat">
      <header className="v2-handshake-chat__header">
        <span className="v2-handshake-chat__avatar" aria-hidden="true">R</span>
        <div>
          <strong>Reliability agent</strong>
          <span>Incident response · checkout-api</span>
        </div>
        <span className="v2-handshake-chat__live"><i aria-hidden="true" /> Conversation</span>
      </header>

      <div className="v2-handshake-chat__thread">
        <p className="v2-handshake-chat__context">INC-4821 · Checkout error rate elevated</p>
        <div className="v2-handshake-chat__agent-row">
          <span className="v2-handshake-chat__avatar v2-handshake-chat__avatar--small" aria-hidden="true">R</span>
          <article className="v2-handshake-message" aria-label="Pre-action handoff">
            <div className="v2-handshake-message__eyebrow">
              <ShieldAlert size={15} aria-hidden="true" />
              <span>Action held for your decision</span>
            </div>
            <h3>Before I roll back checkout-api</h3>
            <div className="v2-handshake-flow" role="list" aria-label="Observation to action proposal">
              <div role="listitem">
                <span>Observed</span>
                <p>Metrics agent reports 5xx errors rose from 0.4% to 4.1% over the last 8 minutes, just after release 2.18.5.</p>
              </div>
              <span className="v2-handshake-flow__arrow" aria-hidden="true">→</span>
              <div role="listitem">
                <span>Interpreted</span>
                <p>{corrected ? "The increase may be isolated to the canary cohort; the release is not yet confirmed as the cause." : "The timing suggests release 2.18.5 introduced a regression."}</p>
              </div>
              <span className="v2-handshake-flow__arrow" aria-hidden="true">→</span>
              <div role="listitem">
                <span>Proposed</span>
                <p>{proposal}</p>
              </div>
            </div>

            <p className="v2-handshake-impact"><strong>Impact</strong> {corrected ? "No production change while the canary is inspected." : "Rollback affects all checkout traffic; it is reversible by redeploying 2.18.5."}</p>

            <div className="v2-handshake-decision" data-decision={decision} role="status" aria-live="polite">
              {decisionCopy[decision]}
            </div>

            {decision === "pending" || decision === "corrected" ? (
              <div className="v2-handshake-actions" aria-label="Operator response">
                <button type="button" data-action="consent" onClick={() => setDecision("consented")}>
                  <Check size={15} aria-hidden="true" /> Consent
                </button>
                <button type="button" onClick={correct}>Correct</button>
                <button type="button" data-action="decline" onClick={() => setDecision("declined")}>Decline</button>
                <button type="button" onClick={() => setDecision("deferred")}>Defer</button>
              </div>
            ) : (
              <button type="button" className="v2-handshake-reset" onClick={reset}>
                <RotateCcw size={14} aria-hidden="true" /> Reset preview
              </button>
            )}
          </article>
        </div>
      </div>

      <div className="v2-handshake-chat__composer" aria-hidden="true">Reply to Reliability agent…</div>
    </div>
  );
}
