"use client";

import { useState, type FormEvent } from "react";

type Surface = "chat_ui" | "shared_ui";

const ENTRIES = [
  {
    time: "03:08",
    kind: "Signal",
    title: "5xx rate rose above the incident threshold",
    detail: "Telemetry alert · edge-router-7 · 8.4% of requests",
    tone: "warning",
  },
  {
    time: "03:16",
    kind: "Assumption",
    title: "Likely a retry storm, not a configuration regression",
    detail: "Based on correlated gateway and upstream retry counts. This is an interpretation, not a confirmed cause.",
    tone: "note",
  },
  {
    time: "03:40",
    kind: "Action",
    title: "Scaled replicas from 3 to 6",
    detail: "Deploy tool · edge-router-7 · change CHG-2231 · completed",
    tone: "action",
  },
  {
    time: "04:02",
    kind: "Result",
    title: "Error rate returned to baseline",
    detail: "Health checks passed across all 6 replicas. Postmortem owner sign-off is still open.",
    tone: "success",
  },
] as const;

function RecordBody({ variant }: { variant: string }) {
  const [answer, setAnswer] = useState("");
  const [sent, setSent] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const visibleEntries = variant === "live-progress" ? ENTRIES.slice(0, 3) : ENTRIES;
  const isDigest = variant === "return-digest";

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer.trim()) return;
    setSent(true);
  }

  return (
    <section className="v2-activity-record" aria-label="Activity record for incident INC-2231">
      <header className="v2-activity-record__summary">
        <div>
          <p className="v2-activity-record__eyebrow">
            {variant === "live-progress" ? "Live progress" : isDigest ? "While you were away" : "Incident timeline"}
          </p>
          <h3>{isDigest ? "4 events · 3h 52m" : "INC-2231 · edge-router-7"}</h3>
          <p className="v2-activity-record__subline">
            {variant === "live-progress"
              ? "3 events recorded · work continues"
              : isDigest
                ? "Work completed · one question remains"
                : "4 recorded events · owner sign-off pending"}
          </p>
        </div>
        <span className="v2-activity-record__status" data-status={isDigest ? "success" : "warning"}>
          {isDigest ? "Stable" : "Review open"}
        </span>
      </header>

      <ol className="v2-activity-record__timeline">
        {visibleEntries.map((entry) => (
          <li key={entry.time} className="v2-activity-record__entry">
            <time dateTime={`2026-10-09T${entry.time}:00`}>{entry.time}</time>
            <span className="v2-activity-record__marker" data-tone={entry.tone} aria-hidden="true" />
            <details>
              <summary>
                <span className="v2-activity-record__kind" data-tone={entry.tone}>{entry.kind}</span>
                <span className="v2-activity-record__title">{entry.title}</span>
              </summary>
              <p>{entry.detail}</p>
            </details>
          </li>
        ))}
      </ol>

      {variant === "live-progress" ? (
        <p className="v2-activity-record__held">One event is still being recorded as work continues.</p>
      ) : (
        <div className="v2-activity-record__question">
          <div className="v2-activity-record__question-head">
            <span>Open question</span>
            {sent ? <span className="v2-activity-record__answered">Answer added</span> : null}
          </div>
          <p>Which team owns the postmortem sign-off for INC-2231?</p>
          {sent ? (
            <p className="v2-activity-record__answer">Your answer: {answer.trim()}</p>
          ) : (
            <form onSubmit={submitAnswer} className="v2-activity-record__form">
              <label className="sr-only" htmlFor="activity-record-answer">Answer the open question</label>
              <input
                id="activity-record-answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Add an answer…"
              />
              <button type="submit" disabled={!answer.trim()}>Send answer</button>
            </form>
          )}
        </div>
      )}

      <button
        className="v2-activity-record__expand"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Hide record details" : "Show record details"}
      </button>
      {expanded ? (
        <dl className="v2-activity-record__metadata">
          <div><dt>Agent</dt><dd>Rollback agent</dd></div>
          <div><dt>Source</dt><dd>Incident run INC-2231</dd></div>
          <div><dt>Last updated</dt><dd>07:00 · Oct 9</dd></div>
        </dl>
      ) : null}
    </section>
  );
}

export function ActivityRecordPreview({ surface, variant }: { surface: Surface; variant: string }) {
  return surface === "chat_ui" ? (
    <div className="v2-activity-chat">
      <header><span>Incident workspace</span><strong>INC-2231</strong></header>
      <div className="v2-activity-chat__message">
        <span className="v2-activity-chat__avatar" aria-hidden="true">R</span>
        <div>
          <p className="v2-activity-chat__agent">Rollback agent <span>07:00</span></p>
          <p className="v2-activity-chat__reply">The error rate is stable after scaling edge-router-7. One owner sign-off remains open.</p>
          <RecordBody key={variant} variant={variant} />
        </div>
      </div>
    </div>
  ) : (
    <div className="v2-activity-workspace">
      <aside>
        <p>INCIDENT</p>
        <strong>INC-2231</strong>
        <span>edge-router-7</span>
        <span className="v2-activity-workspace__active">Run history</span>
      </aside>
      <div className="v2-activity-workspace__main">
        <header><div><p>Incident response / Run 1842</p><h3>Agent activity</h3></div><span>Updated 07:00</span></header>
        <RecordBody key={variant} variant={variant} />
      </div>
    </div>
  );
}
