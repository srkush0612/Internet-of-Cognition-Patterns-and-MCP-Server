"use client";

import { useEffect, useRef } from "react";
import { AcmeRenewalRightPanel } from "./AcmeRenewalRightPanel";
import { MemoryCommitmentCommitGate } from "@/components/patterns/MemoryCommitmentReview";
import { ACTIVE_BEAT, BEATS, CHAT_MESSAGES } from "./acme-renewal-data";
import type { ChatMessage } from "./acme-renewal-data";
import "./acme-renewal.css";

const CHANNELS = [
  { name: "Acme Renewal", live: true, active: true },
  { name: "New Feature Kickoff", live: false, active: false },
  { name: "Office Hours", live: false, active: false },
];

function MessageMeta({
  tag,
  tagChecked,
  tagDoubleChecked,
  confidence,
  risk,
  why,
}: {
  tag: string;
  tagChecked?: boolean;
  tagDoubleChecked?: boolean;
  confidence: number;
  risk?: "med";
  why?: boolean;
}) {
  return (
    <div className="acme-chat-meta">
      <span className="acme-chat-meta__tag">
        @ {tag}
        {tagDoubleChecked ? (
          <>
            <span className="acme-chat-meta__check" aria-hidden>
              ✓
            </span>
            <span className="acme-chat-meta__check" aria-hidden>
              ✓
            </span>
          </>
        ) : tagChecked ? (
          <span className="acme-chat-meta__check" aria-hidden>
            ✓
          </span>
        ) : null}
      </span>
      <span className="acme-chat-meta__bar" aria-hidden>
        <span
          className="acme-chat-meta__bar-fill"
          style={{ width: `${confidence}%` }}
        />
      </span>
      <span className="acme-chat-meta__pct">{confidence}%</span>
      {risk === "med" ? (
        <span className="acme-chat-meta__risk">med risk</span>
      ) : null}
      {why ? (
        <button type="button" className="acme-chat-meta__why">
          Why?
        </button>
      ) : null}
    </div>
  );
}

function AgentMessage({ message }: { message: Extract<ChatMessage, { kind: "agent" }> }) {
  return (
    <article className="acme-chat-message">
      <div className="acme-chat-message__head">
        <span
          className={`acme-chat-message__avatar acme-chat-message__avatar--${message.tone}`}
        >
          {message.initials}
        </span>
        <div className="acme-chat-message__head-text">
          <div className="acme-chat-message__title-row">
            <span className="acme-chat-message__author">{message.author}</span>
            <span className="acme-chat-message__badge">{message.badge}</span>
            <span className="acme-chat-message__time">{message.time}</span>
          </div>
        </div>
      </div>
      <p className="acme-chat-message__body">{message.text}</p>
      <MessageMeta
        tag={message.tag}
        tagChecked={message.tagChecked}
        tagDoubleChecked={message.tagDoubleChecked}
        confidence={message.confidence}
        risk={message.risk}
        why={message.why}
      />
      {message.buildsOn ? (
        <p className="acme-chat-message__link">{message.buildsOn}</p>
      ) : null}
      {message.routeNote ? (
        <p className="acme-chat-message__route">{message.routeNote}</p>
      ) : null}
    </article>
  );
}

function GateMessage({ message }: { message: Extract<ChatMessage, { kind: "gate" }> }) {
  return (
    <article className="acme-chat-gate">
      <div className="acme-chat-message__head">
        <span
          className={`acme-chat-message__avatar acme-chat-message__avatar--${message.tone}`}
        >
          {message.initials}
        </span>
        <div className="acme-chat-message__head-text">
          <div className="acme-chat-message__title-row">
            <span className="acme-chat-message__author">{message.author}</span>
            <span className="acme-chat-message__badge acme-chat-message__badge--gate">
              {message.badge}
            </span>
            <span className="acme-chat-message__time">{message.time}</span>
          </div>
        </div>
      </div>
      <p className="acme-chat-gate__body">{message.text}</p>
      <MessageMeta
        tag={message.tag}
        tagChecked={message.tagChecked}
        confidence={message.confidence}
      />
      <div className="acme-chat-gate__actions">
        {message.actions.map((action, index) => (
          <button
            key={action}
            type="button"
            className={`acme-chat-gate__btn${
              index === 0 ? " acme-chat-gate__btn--primary" : ""
            }`}
          >
            {action}
          </button>
        ))}
      </div>
    </article>
  );
}

type AcmeRenewalDemoProps = {
  /** When true, omit outer page chrome for embedding in pattern detail. */
  embedded?: boolean;
  /** Which pattern the demo highlights in the workspace. */
  demoFocus?: "authority-gradient" | "memory-commitment";
};

export function AcmeRenewalDemo({
  embedded = false,
  demoFocus = "authority-gradient",
}: AcmeRenewalDemoProps) {
  const commitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (demoFocus !== "memory-commitment") return;
    const frame = window.requestAnimationFrame(() => {
      commitRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [demoFocus]);

  return (
    <div
      className={`acme-renewal${embedded ? " acme-renewal--embedded" : ""}`}
    >
      <div className="acme-renewal__shell">
        <aside className="acme-renewal__sidebar" aria-label="Channels">
          <div className="acme-renewal__sidebar-head">
            <span className="acme-renewal__sidebar-label">Channels</span>
          </div>
          <ul className="acme-renewal__channels">
            {CHANNELS.map((channel) => (
              <li
                key={channel.name}
                className={`acme-renewal__channel${
                  channel.active ? " acme-renewal__channel--active" : ""
                }`}
              >
                <span className="acme-renewal__channel-name">{channel.name}</span>
                {channel.live ? (
                  <span className="acme-renewal__channel-live">Live</span>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>

        <main className="acme-renewal__chat" aria-label="Acme Renewal conversation">
          <header className="acme-renewal__chat-head">
            <h2 className="acme-renewal__chat-title">Acme Renewal</h2>
            <span className="acme-renewal__chat-meta">
              4 humans · 3 agents · opened 09:55
            </span>
          </header>

          <div className="acme-renewal__messages">
            {CHAT_MESSAGES.map((message) => {
              if (message.kind === "system") {
                if (
                  demoFocus === "memory-commitment" &&
                  message.id === "system-approved"
                ) {
                  return (
                    <div
                      key={message.id}
                      ref={commitRef}
                      className="acme-renewal__commit-wrap"
                    >
                      <p className="acme-chat-system">
                        Approved 20% discount applied · Salesforce record updated ·
                        renewal closing today
                      </p>
                      <MemoryCommitmentCommitGate variant="chat" />
                    </div>
                  );
                }
                return (
                  <p key={message.id} className="acme-chat-system">
                    {message.text}
                  </p>
                );
              }
              if (message.kind === "gate") {
                return <GateMessage key={message.id} message={message} />;
              }
              return <AgentMessage key={message.id} message={message} />;
            })}
          </div>

          <footer className="acme-renewal__compose">
            <input
              type="text"
              readOnly
              className="acme-renewal__compose-input"
              placeholder="Message the Acme Renewal space…"
              aria-label="Message the Acme Renewal space"
            />
          </footer>
        </main>

        <AcmeRenewalRightPanel demoFocus={demoFocus} />
      </div>

      <footer className="acme-renewal__beats" aria-label="Workflow beats">
        <span className="acme-renewal__beats-label">Beats</span>
        <ol className="acme-renewal__beats-track">
          {BEATS.map((beat) => (
            <li
              key={beat.id}
              className={`acme-renewal__beat${
                beat.id === ACTIVE_BEAT ? " acme-renewal__beat--active" : ""
              }${beat.id < ACTIVE_BEAT ? " acme-renewal__beat--done" : ""}`}
            >
              <span className="acme-renewal__beat-id">Beat {beat.id}</span>
              <span className="acme-renewal__beat-label">{beat.label}</span>
            </li>
          ))}
        </ol>
        <span className="acme-renewal__beats-status">
          Emergent Outcome · {ACTIVE_BEAT} / {BEATS.length}
        </span>
      </footer>
    </div>
  );
}
