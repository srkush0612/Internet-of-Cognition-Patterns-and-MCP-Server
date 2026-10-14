"use client";

import { useState } from "react";

type Surface = "chat_ui" | "shared_ui";
type DetailLevel = 0 | 1 | 2 | 3;

const LAYERS: { label: string; action: string }[] = [
  { label: "Outcome", action: "Incident mitigated" },
  { label: "Why", action: "Show reasoning" },
  { label: "Coordination", action: "Show agent handoffs" },
  { label: "Full trace", action: "Open full trace" },
];

function DisclosureControls({
  level,
  setLevel,
}: {
  level: DetailLevel;
  setLevel: (level: DetailLevel) => void;
}) {
  return (
    <div className="v2-disclosure__controls" aria-label="Disclosure detail">
      {LAYERS.slice(1).map((layer, index) => {
        const target = (index + 1) as DetailLevel;
        return (
          <button
            key={layer.label}
            type="button"
            aria-expanded={level >= target}
            onClick={() => setLevel(level >= target ? (target - 1) as DetailLevel : target)}
          >
            {level >= target ? `Hide ${layer.label.toLowerCase()}` : layer.action}
          </button>
        );
      })}
    </div>
  );
}

function DisclosureLayers({ level }: { level: DetailLevel }) {
  return (
    <div className="v2-disclosure__layers" aria-live="polite">
      {level >= 1 ? (
        <section className="v2-disclosure__layer">
          <h4>Why this worked</h4>
          <p>The database agent found a connection pool spike. Restarting the affected service returned error rates to baseline.</p>
        </section>
      ) : null}
      {level >= 2 ? (
        <section className="v2-disclosure__layer">
          <h4>Agent handoffs</h4>
          <ol>
            <li><b>Database monitor</b><span>Detected pool saturation · 14:06</span></li>
            <li><b>Incident coordinator</b><span>Routed the finding to remediation · 14:08</span></li>
            <li><b>Remediation agent</b><span>Restarted the affected service · 14:11</span></li>
          </ol>
        </section>
      ) : null}
      {level >= 3 ? (
        <section className="v2-disclosure__layer v2-disclosure__trace">
          <h4>Full trace · 3 events</h4>
          <ol>
            <li><time>14:06:12</time><span>Pool utilization reached 96%; error rate rose above 8%.</span></li>
            <li><time>14:08:31</time><span>Coordinator selected a service restart; no data loss risk detected.</span></li>
            <li><time>14:11:05</time><span>Restart completed; error rate returned to baseline.</span></li>
          </ol>
        </section>
      ) : null}
    </div>
  );
}

export function DisclosureGradientPreview({ surface }: { surface: Surface }) {
  const [level, setLevel] = useState<DetailLevel>(0);

  if (surface === "chat_ui") {
    return (
      <div className="v2-disclosure-chat">
        <header><div><span>Incident response</span><strong>INC-4821</strong></div><span className="v2-disclosure__status">Resolved</span></header>
        <div className="v2-disclosure-chat__thread">
          <p className="v2-disclosure-chat__person"><span aria-hidden="true">J</span>Jordan · 14:12</p>
          <div className="v2-disclosure-chat__turn">
            <span className="v2-disclosure-chat__avatar" aria-hidden="true">I</span>
            <div className="v2-disclosure-chat__reply">
              <p className="v2-disclosure-chat__byline"><b>Incident agent</b><span>14:12</span></p>
              <p className="v2-disclosure-chat__outcome">Incident mitigated</p>
              <p className="v2-disclosure-chat__summary">Error rates returned to baseline after the affected service restarted.</p>
              <DisclosureControls level={level} setLevel={setLevel} />
              <DisclosureLayers level={level} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-disclosure-workspace">
      <aside aria-label="Incident workspace navigation"><p>INCIDENTS</p><strong>Payments API</strong><span className="v2-disclosure-workspace__active">INC-4821 · Resolved</span><span>INC-4817 · Monitoring</span></aside>
      <div className="v2-disclosure-workspace__main">
        <header><div><p>Payments API / INC-4821</p><h3>Incident summary</h3></div><span className="v2-disclosure__status">Resolved · 14:12</span></header>
        <section className="v2-disclosure-workspace__result">
          <p>OUTCOME</p><h4>Incident mitigated</h4><span>Error rates returned to baseline after the affected service restarted.</span>
        </section>
        <DisclosureControls level={level} setLevel={setLevel} />
        <DisclosureLayers level={level} />
        <footer>Updated by Incident agent · Trace retained for review</footer>
      </div>
    </div>
  );
}
