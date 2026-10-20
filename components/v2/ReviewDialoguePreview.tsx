"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

type Turn = "review" | "clarify" | "revised" | "accepted" | "deferred" | "declined";

/** A local conversation mock showing feedback becoming a revised draft. */
export function ReviewDialoguePreview() {
  const [turn, setTurn] = useState<Turn>("review");
  const [focus, setFocus] = useState("setup time");
  const [version, setVersion] = useState(1);

  const reset = () => {
    setTurn("review");
    setFocus("setup time");
    setVersion(1);
  };

  const revise = (nextFocus: string) => {
    setFocus(nextFocus);
    setVersion((current) => current + 1);
    setTurn("revised");
  };

  return (
    <div className="v2-review-dialogue">
      <header className="v2-review-dialogue__header">
        <span className="v2-review-dialogue__avatar" aria-hidden="true">M</span>
        <div><strong>Marketing agent</strong><span>Launch campaign · Draft review</span></div>
        <span className="v2-review-dialogue__state" data-state={turn === "accepted" ? "done" : turn === "deferred" ? "waiting" : "review"}>
          {turn === "accepted" ? "Operator accepted" : turn === "deferred" ? "Deferred by operator" : turn === "declined" ? "Declined" : "Human review needed"}
        </span>
      </header>

      <div className={`v2-review-dialogue__thread${version > 1 ? " v2-review-dialogue__thread--revision" : ""}`}>
        <p className="v2-review-dialogue__context">Launch email · Version {version}</p>
        <div className="v2-review-dialogue__handoff" aria-label="Research agent recommendation passed to Marketing agent">
          <span className="v2-review-dialogue__handoff-agent">Research agent · Proposal</span>
          <span className="v2-review-dialogue__handoff-arrow" aria-hidden="true">→</span>
          <span className="v2-review-dialogue__handoff-agent">Marketing agent</span>
          <p>Recommend leading with setup in under 10 minutes for new trial users. Survey synthesis: setup time is their top onboarding concern.</p>
        </div>
        {version > 1 ? (
          <div className="v2-review-dialogue__reviewer">
            <span>You</span>
            <p>{version > 1 ? `Emphasize ${focus} for new trial users.` : "Wrong audience. This is for new trial users, not existing customers."}</p>
          </div>
        ) : null}
        <div className="v2-review-dialogue__row">
          <span className="v2-review-dialogue__avatar v2-review-dialogue__avatar--small" aria-hidden="true">M</span>
          <article className="v2-review-dialogue__message">
            <span className="v2-review-dialogue__eyebrow">{version > 1 ? "Revised draft" : "Draft for review"}</span>
            <h3>{version > 1
              ? focus === "setup time" ? "Get your team started in minutes" : "Bring customer work into one clear view"
              : "Make more of your customer workspace"}</h3>
            <p>{version > 1
              ? `Set up your first workspace in under ten minutes. ${focus === "setup time" ? "Invite your team and see your first results today." : "Bring your customer work into one clear view."}`
              : "Bring every customer conversation together and give your team a clearer view of what comes next."}</p>
            {version > 1 ? (
              <div className="v2-review-dialogue__change"><Check size={14} aria-hidden="true" /> Changed: audience and opening focus</div>
            ) : null}
            {turn !== "clarify" ? <div className="v2-review-dialogue__decision" role="status" aria-live="polite">
              {turn === "review" ? "Your campaign judgment is needed: does this audience and lead promise fit the launch? Marketing will not schedule or send until you accept." : null}
              {turn === "revised" ? "Revised from your feedback. Check this audience and lead promise again; this version needs your decision too." : null}
              {turn === "accepted" ? "Accepted for this draft. Sending still happens in the host workflow." : null}
              {turn === "deferred" ? "Deferred. This draft remains unsent." : null}
              {turn === "declined" ? "Declined. The agent will not continue this draft." : null}
            </div> : null}

            {turn === "review" ? (
              <div className="v2-review-dialogue__actions" aria-label="Review response">
                <button type="button" data-action="accept" onClick={() => setTurn("accepted")}>Accept draft</button>
                <button type="button" onClick={() => revise("product value")}>Correct wording</button>
                <button type="button" onClick={() => setTurn("clarify")}>Decline with reason</button>
                <button type="button" onClick={() => setTurn("deferred")}>Defer</button>
              </div>
            ) : null}
            {turn === "revised" ? (
              <div className="v2-review-dialogue__actions" aria-label="Review revised draft">
                <button type="button" data-action="accept" onClick={() => setTurn("accepted")}>Accept revised draft</button>
                <button type="button" onClick={() => setTurn("clarify")}>Ask for another change</button>
                <button type="button" onClick={() => setTurn("deferred")}>Defer</button>
              </div>
            ) : null}
            {turn === "accepted" || turn === "deferred" || turn === "declined" ? (
              <button type="button" className="v2-review-dialogue__reset" onClick={reset}><RotateCcw size={14} aria-hidden="true" /> Reset preview</button>
            ) : null}
          </article>
        </div>
        {turn === "clarify" ? (
          <>
            <div className="v2-review-dialogue__reviewer"><span>You</span><p>Wrong audience. This is for new trial users, not existing customers.</p></div>
            <div className="v2-review-dialogue__row v2-review-dialogue__row--followup">
              <span className="v2-review-dialogue__avatar v2-review-dialogue__avatar--small" aria-hidden="true">M</span>
              <article className="v2-review-dialogue__message">
                <span className="v2-review-dialogue__eyebrow">One clarification</span>
                <p>Which message should lead for new trial users?</p>
                <div className="v2-review-dialogue__actions" aria-label="Clarify feedback">
                  <button type="button" data-action="revise" onClick={() => revise("setup time")}>Emphasize setup time</button>
                  <button type="button" data-action="revise" onClick={() => revise("product value")}>Emphasize product value</button>
                </div>
              </article>
            </div>
          </>
        ) : null}
      </div>
      <div className="v2-review-dialogue__composer" aria-hidden="true">Reply to Marketing agent…</div>
    </div>
  );
}
