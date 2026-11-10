"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

const separateActions = [
  { agent: "Triage agent", action: "Runs diagnostics autonomously", initial: "T" },
  { agent: "Planner agent", action: "Asks: “Approve rollback?”", initial: "P" },
  { agent: "Monitor agent", action: "Asks: “Restart the service?”", initial: "M" },
] as const;

const patternsInExample = [
  { name: "Convergence Point", id: "convergence-point" },
  { name: "Pre-Action Handshake", id: "pre-action-handshake" },
  { name: "Inline Rationale", id: "inline-rationale" },
] as const;

type Response = "approve" | "details" | "defer";

const responseText: Record<Response, string> = {
  approve: "Rollback approved. The restart stays on hold while the recovery proceeds.",
  details: "The errors began after the release. Rollback is the proposed recovery; restart remains on hold to avoid a conflict.",
  defer: "Decision deferred. The agents hold the rollback and restart until you are ready to review.",
};

export function V3Comparison() {
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [phase, setPhase] = useState(4);
  const [response, setResponse] = useState<Response | null>(null);

  const replay = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setResponse(null);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase(4);
      return;
    }
    setPhase(0);
    for (const [delay, next] of [[380, 1], [900, 2], [1420, 3], [1900, 4]] as const) {
      timers.current.push(setTimeout(() => setPhase(next), delay));
    }
  }, []);

  useEffect(() => {
    if (!root.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        replay();
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(root.current);
    return () => {
      observer.disconnect();
      timers.current.forEach(clearTimeout);
    };
  }, [replay]);

  return (
    <div className="v3-comparison" data-phase={phase} ref={root}>
      <div className="v3-comparison-grid">
        <div className="v3-comparison-column">
          <div className="v3-comparison-meta v3-comparison-meta--without">
            <span className="v3-comparison-meta__dot" aria-hidden="true" />
            <strong>Without HAX</strong>
          </div>
          <article className="v3-comparison-panel v3-comparison-panel--without">
          <div className="v3-comparison-panel__body">
            <div className="v3-comparison-skeleton" aria-hidden="true"><i /><i /><i /></div>
            <p className="v3-comparison-label">Separate actions &amp; requests</p>
            <ol className="v3-comparison-agent-list">
              {separateActions.map(({ agent, action, initial }) => (
                <li className="v3-comparison-agent" key={agent}>
                  <span className="v3-comparison-avatar" aria-hidden="true">{initial}</span>
                  <div><strong>{agent}</strong><p>{action}</p></div>
                </li>
              ))}
            </ol>
            <p className="v3-comparison-takeaway">Agents act and ask for input. The person still has to reconcile the requests, their context, and their consequences.</p>
          </div>
          </article>
        </div>

        <div className="v3-comparison-column">
          <div className="v3-comparison-meta v3-comparison-meta--with">
            <span className="v3-comparison-meta__dot" aria-hidden="true" />
            <strong>With HAX</strong>
            <nav className="v3-comparison-patterns" aria-label="HAX patterns in this example">
              {patternsInExample.map(({ name, id }) => (
                <Link href={`/v3/patterns/${id}`} key={id}>{name}</Link>
              ))}
            </nav>
            <button className="v3-comparison-replay" type="button" onClick={replay} aria-label="Replay comparison" title="Replay comparison">
              <RotateCcw size={18} aria-hidden="true" />
            </button>
          </div>
          <article className="v3-comparison-panel v3-comparison-panel--with">
          <div className="v3-comparison-panel__body">
            <div className="v3-comparison-skeleton" aria-hidden="true"><i /><i /><i /></div>
            <p className="v3-comparison-label">Behavior + human context</p>
            <div className="v3-comparison-proposal">
              <span className="v3-comparison-proposal__mark" aria-hidden="true">H</span>
              <div>
                <h3>Review proposed recovery</h3>
                <p>Diagnostics link the errors to the release. Rollback is proposed; restart is held to avoid conflicting actions. Active sessions may be interrupted.</p>
                <div className="v3-comparison-options" role="group" aria-label="Respond to the recovery proposal">
                  <button type="button" disabled={phase < 3} aria-pressed={response === "approve"} onClick={() => setResponse("approve")}>Approve rollback</button>
                  <button type="button" disabled={phase < 3} aria-pressed={response === "details"} onClick={() => setResponse("details")}>Ask for details</button>
                  <button type="button" disabled={phase < 3} aria-pressed={response === "defer"} onClick={() => setResponse("defer")}>Defer</button>
                </div>
                {response ? <p className="v3-comparison-response" role="status">{responseText[response]}</p> : null}
              </div>
            </div>
            <p className="v3-comparison-takeaway">Agents know when to proceed, pause, or involve a person. The person sees the context and can choose what happens next.</p>
          </div>
          </article>
        </div>
      </div>
    </div>
  );
}
