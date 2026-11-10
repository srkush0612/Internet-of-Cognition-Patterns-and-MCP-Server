"use client";

import Link from "next/link";
import { useState } from "react";

const RESPONSES = ["consent", "correct", "decline", "defer"] as const;
type Response = (typeof RESPONSES)[number];

const OUTCOMES: Record<Response, string> = {
  consent: "Restart approved. The agent can proceed and records why.",
  correct: "The operator narrows the restart to one pod. The agent updates its plan.",
  decline: "The agent holds the restart and records the decision.",
  defer: "The agent waits and asks again at the next error spike.",
};

function TileHead({ title, body }: { title: string; body: string }) {
  return <div className="v3-how-tile__copy"><h3>{title}</h3><p>{body}</p></div>;
}

export function V3HowStack() {
  const [response, setResponse] = useState<Response | null>(null);
  const [lookupVisible, setLookupVisible] = useState(false);

  return (
    <div className="v3-how-stack">
      <article className="v3-how-tile v3-how-tile--sky">
        <TileHead title="Find the pattern" body="Describe what the agent needs to do and who is involved. Studio suggests a pattern that fits." />
        <div className="v3-how-stage" aria-label="Illustrative Studio pattern match">
          <div className="v3-how-stage__top"><span className="v3-how-stage__brand">HAX / Studio</span><span className="v3-how-stage__tag">New behavior</span></div>
          <div className="v3-how-studio">
            <div className="v3-how-studio__prompt"><span>THE MOMENT</span><p>Before restarting a service, the agent needs a person to review its plan.</p></div>
            <div className="v3-how-studio__fields"><div><small>Agent needs to</small><strong>Propose an action</strong></div><div><small>Who is involved</small><strong>Many agents + one person</strong></div></div>
            <div className="v3-how-studio__match"><span className="v3-how-studio__spark">✳</span><div><small>STUDIO SUGGESTS</small><strong>Pre-Action Handshake</strong><p>State the signal, propose the action, then wait for a reply.</p></div><Link href="/v2/patterns/pre-action-handshake" aria-label="Open Pre-Action Handshake pattern">↗</Link></div>
          </div>
        </div>
      </article>

      <article className="v3-how-tile v3-how-tile--peach">
        <TileHead title="Shape the behavior" body="Preview the interaction in its intended channel and check the replies people or agents can send." />
        <div className="v3-how-stage" aria-label="Illustrative conversation preview">
          <div className="v3-how-stage__top"><span className="v3-how-stage__brand">Interaction preview</span><span className="v3-how-stage__tag">Chat</span></div>
          <div className="v3-how-chat">
            <div className="v3-how-chat__context">INC-2231 <span>·</span> checkout latency</div>
            <div className="v3-how-chat__message"><span className="v3-how-chat__avatar">T</span><div><strong>@triage</strong><p>Checkout p99 hit 2.4s. That points to payments-svc. I’d like to restart it.</p><small>Waiting for an operator reply</small></div></div>
            <div className="v3-how-chat__replies"><span>EXPECTED REPLIES</span><div>{RESPONSES.map(item => <span key={item}>{item}</span>)}</div></div>
            <div className="v3-how-chat__note">The pattern defines the exchange. The preview shows its words and states in context.</div>
          </div>
        </div>
      </article>

      <article className="v3-how-tile v3-how-tile--lilac">
        <TileHead title="Connect your agents" body="Connect the local HAX server through MCP so agents can look up patterns during a task." />
        <div className="v3-how-stage" aria-label="MCP lookup preview">
          <div className="v3-how-stage__top"><span className="v3-how-stage__brand">HAX / MCP server</span><span className="v3-how-stage__tag">Local connection</span></div>
          <div className="v3-how-mcp">
            <div className="v3-how-mcp__query"><span>AGENT LOOKUP</span><code>discover_patterns({"{"}<br />&nbsp;&nbsp;query: &quot;before an irreversible step&quot;<br />{"}"})</code></div>
            <button type="button" onClick={() => setLookupVisible(!lookupVisible)} aria-expanded={lookupVisible} className="v3-how-mcp__run">{lookupVisible ? "Hide preview result" : "Preview lookup result"} <span aria-hidden="true">→</span></button>
            {lookupVisible && <div className="v3-how-mcp__result"><small>PATTERN MATCH</small><strong>Pre-Action Handshake</strong><span>Expected replies: consent · correct · decline · defer</span></div>}
            <p>This is an illustrative preview. The local server currently searches the existing registry.</p>
          </div>
        </div>
      </article>

      <article className="v3-how-tile v3-how-tile--lime">
        <TileHead title="Show the behavior in context" body="HAX brings the selected pattern into an interface for the use case, making the agent’s intent and the person’s next choices clear." />
        <div className="v3-how-stage" aria-label="Interactive incident workspace example">
          <div className="v3-how-stage__top"><span className="v3-how-stage__brand">Incident workspace</span><span className="v3-how-stage__tag">INC-2231</span></div>
          <div className="v3-how-product">
            <div className="v3-how-product__crumb">Payments API <span>/</span> Response</div>
            <div className="v3-how-product__alert"><span>PRE-ACTION CHECK</span><strong>{response ? "Decision recorded" : "Needs your input"}</strong></div>
            <h4>Restart payments service?</h4>
            <p><b>@triage</b> saw checkout p99 reach 2.4s and proposes restarting payments-svc.</p>
            <div className="v3-how-product__choices" aria-label="Choose an operator response">{RESPONSES.map(item => <button type="button" key={item} aria-pressed={response === item} onClick={() => setResponse(item)}>{item}</button>)}</div>
            <div className="v3-how-product__outcome" aria-live="polite">{response ? OUTCOMES[response] : "Choose a reply to see what the agent does next."}</div>
          </div>
        </div>
      </article>
    </div>
  );
}
