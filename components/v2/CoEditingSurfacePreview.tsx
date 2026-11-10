"use client";

import { useState } from "react";

const INITIAL_PLAN = "Restart payments-svc at 03:20 UTC. Rotate instances one at a time so checkout remains available.";
const INITIAL_REASON = "Checkout errors are rising after the retry-loop change. A controlled restart should clear the affected connections while the team prepares a code fix.";
type SectionId = "action" | "reason" | "watch" | "impact";
type Comment = { id: number; section: SectionId; body: string };

export function CoEditingSurfacePreview({ surface }: { surface: "chat_ui" | "shared_ui" }) {
  const [plan, setPlan] = useState(INITIAL_PLAN);
  const [reason, setReason] = useState(INITIAL_REASON);
  const [edited, setEdited] = useState(false);
  const [continued, setContinued] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentingOn, setCommentingOn] = useState<SectionId | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  function personEdited() {
    setEdited(true);
    setContinued(false);
  }

  function commentArea(section: SectionId, title: string) {
    const sectionComments = comments.filter((comment) => comment.section === section);
    return (
      <div className="v2-coedit__comments">
        <button type="button" className="v2-coedit__comment-trigger" aria-label={`Comment on ${title}`} onClick={() => { setCommentingOn(section); setCommentDraft(""); }}>
          {sectionComments.length ? `${sectionComments.length} comment${sectionComments.length === 1 ? "" : "s"} · Add comment` : "Add comment"}
        </button>
        {sectionComments.map((comment) => (
          <div className="v2-coedit__comment" key={comment.id}><strong>You · on {title}</strong><p>{comment.body}</p></div>
        ))}
        {commentingOn === section ? (
          <form className="v2-coedit__comment-form" onSubmit={(event) => { event.preventDefault(); const body = commentDraft.trim(); if (!body) return; setComments((current) => [...current, { id: current.length + 1, section, body }]); setCommentDraft(""); setCommentingOn(null); }}>
            <label htmlFor={`coedit-comment-${section}`}>Comment on {title}</label>
            <textarea id={`coedit-comment-${section}`} rows={3} value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Leave a note about this part of the document" />
            <div><button type="submit" disabled={!commentDraft.trim()}>Post comment</button><button type="button" onClick={() => setCommentingOn(null)}>Cancel</button></div>
          </form>
        ) : null}
      </div>
    );
  }

  return (
    <div className="v2-coedit" data-surface={surface}>
      {surface === "chat_ui" ? (
        <div className="v2-coedit__conversation">
          <div className="v2-coedit__conversation-head"><strong>Incident conversation</strong><span>INC-2231 · Payments API</span></div>
          <div className="v2-coedit__person-turn"><span>You</span><p>Draft a restart plan for payments-svc that we can review together.</p></div>
          <div className="v2-coedit__agent-turn"><span className="v2-coedit__avatar" aria-hidden="true">IA</span><div><strong>Incident agent</strong><p>I drafted the document below. Edit or comment here, then Reliability agent can continue from your contribution.</p></div></div>
        </div>
      ) : null}
      <div className="v2-coedit__workspace">
        {surface === "shared_ui" ? <div className="v2-coedit__rail" aria-label="Workspace navigation">
          <span className="v2-coedit__brand">Incident workspace</span>
          <span>INC-2231</span>
          <span className="v2-coedit__rail-active">Restart plan</span>
          <span>Activity</span>
        </div> : null}
        <div className="v2-coedit__main">
          <div className="v2-coedit__top">
            <div>
              <p className="v2-coedit__kicker">{surface === "chat_ui" ? "Editable document · attached to this reply" : "Payments API · shared document"}</p>
              <h3>Restart plan</h3>
            </div>
            <span className="v2-coedit__state">Current draft</span>
          </div>
          <p className="v2-coedit__hint">Drafted by Incident agent · Reliability agent reviewing next · {edited ? "Revised by you" : comments.length ? "Comments from you" : "Awaiting your contribution"}</p>

          <article className="v2-coedit__document" aria-label="Editable restart plan document">
            <p className="v2-coedit__doc-meta">INC-2231 <span aria-hidden="true">·</span> Payments API <span aria-hidden="true">·</span> Working document</p>
            <h4>Restart plan for payments-svc</h4>
            <div className="v2-coedit__doc-section">
              <label htmlFor="coedit-plan">Proposed action</label>
              <textarea id="coedit-plan" rows={5} value={plan} onChange={(event) => { setPlan(event.target.value); personEdited(); }} />
              {commentArea("action", "Proposed action")}
            </div>
            <div className="v2-coedit__doc-section">
              <label htmlFor="coedit-reason">Why this action</label>
              <textarea id="coedit-reason" rows={7} value={reason} onChange={(event) => { setReason(event.target.value); personEdited(); }} />
              {commentArea("reason", "Why this action")}
            </div>
            <div className="v2-coedit__doc-section">
              <h5>What to watch</h5>
              <p>Track checkout errors and connection health for 15 minutes after the restart. Stop the rotation if errors rise.</p>
              {commentArea("watch", "What to watch")}
            </div>
            {continued ? <div className="v2-coedit__doc-section v2-coedit__doc-section--agent">
              <h5>Impact assessment <span>Added by Reliability agent</span></h5>
              <p>For the revised action, “{plan}” Keep the on-call engineer in the loop and compare checkout errors with the pre-restart baseline. The reason recorded for the team is: “{reason}”</p>
              {comments.length ? <p className="v2-coedit__comment-ack">Review notes considered: {Array.from(new Set(comments.map((comment) => ({ action: "Proposed action", reason: "Why this action", watch: "What to watch", impact: "Impact assessment" })[comment.section]))).join(", ")}.</p> : null}
              {commentArea("impact", "Impact assessment")}
            </div> : null}
          </article>

          <div className="v2-coedit__actions">
            <button type="button" onClick={() => setContinued(true)} disabled={(!edited && comments.length === 0) || continued}>Ask Reliability agent to continue</button>
            <span>{continued ? "Reliability agent added to the document" : edited ? "Your edit is in the shared document" : comments.length ? "Your comments are attached to the document" : "Edit or comment on the document to continue"}</span>
          </div>
          <div className="v2-coedit__history" aria-label="Revision history">
            <span><b>1</b> Incident agent drafted the document</span>
            {edited ? <span><b>2</b> You revised the document</span> : null}
            {comments.length ? <span><b>{edited ? 3 : 2}</b> You commented on {comments.length} {comments.length === 1 ? "part" : "parts"}</span> : null}
            {continued ? <span><b>{edited && comments.length ? 4 : 3}</b> Reliability agent added an impact assessment</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
