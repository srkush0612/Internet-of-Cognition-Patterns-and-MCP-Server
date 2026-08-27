"use client";

import { AuthorityGradientInContext } from "@/components/patterns/AuthorityGradient";
import { MemoryCommitmentInContextPanel } from "@/components/patterns/MemoryCommitmentReview";
import { PatternPanelCard } from "@/components/patterns/PatternPanelCard";
import {
  COGNITION_ENGINES,
  GUARDRAILS,
  INTENT_MET,
  SHARED_REASONING,
} from "./acme-renewal-data";

function IntentMetCard({ collapsed }: { collapsed?: boolean }) {
  return (
    <PatternPanelCard
      title="Intent met"
      statusTag="Converged"
      statusVariant="success"
      collapsed={collapsed}
    >
      <div className="acme-panel-card">
        <p className="acme-panel-card__headline">{INTENT_MET.headline}</p>
        <ul className="acme-panel-card__list">
          {INTENT_MET.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="acme-panel-card__progress">
          <div className="acme-panel-card__progress-label">
            <span>Intent convergence</span>
            <span>{INTENT_MET.convergence}%</span>
          </div>
          <div className="acme-panel-card__progress-track">
            <span
              className="acme-panel-card__progress-fill"
              style={{ width: `${INTENT_MET.convergence}%` }}
            />
          </div>
        </div>
      </div>
    </PatternPanelCard>
  );
}

function SharedReasoningCard({ collapsed }: { collapsed?: boolean }) {
  return (
    <PatternPanelCard
      title="Shared reasoning"
      statusTag="5 grounded"
      collapsed={collapsed}
    >
      <ul className="acme-reasoning">
        {SHARED_REASONING.map((item, index) => (
          <li key={`${item.agent}-${index}`} className="acme-reasoning__item">
            <span
              className={`acme-reasoning__dot acme-reasoning__dot--${item.tone}`}
              aria-hidden
            />
            <span className="acme-reasoning__agent">{item.agent}</span>
            <span className="acme-reasoning__text">{item.text}</span>
          </li>
        ))}
      </ul>
    </PatternPanelCard>
  );
}

function CognitionGuardrailsCard({ collapsed }: { collapsed?: boolean }) {
  return (
    <PatternPanelCard title="Cognition & guardrails" collapsed={collapsed}>
      <div className="acme-cognition">
        <section className="acme-cognition__col">
          <h4 className="acme-cognition__label">Cognition engines</h4>
          <div className="acme-cognition__pills">
            {COGNITION_ENGINES.map((pill) => (
              <span key={pill} className="acme-cognition__pill acme-cognition__pill--engine">
                {pill}
              </span>
            ))}
          </div>
        </section>
        <section className="acme-cognition__col">
          <h4 className="acme-cognition__label">Guardrails</h4>
          <div className="acme-cognition__pills">
            {GUARDRAILS.map((pill) => (
              <span key={pill} className="acme-cognition__pill acme-cognition__pill--guard">
                {pill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </PatternPanelCard>
  );
}

export function AcmeRenewalRightPanel({
  demoFocus = "authority-gradient",
}: {
  demoFocus?: "authority-gradient" | "memory-commitment";
}) {
  if (demoFocus === "memory-commitment") {
    return (
      <aside className="acme-right-panel" aria-label="Acme Renewal context">
        <div className="acme-right-panel__collapsed-stack">
          <IntentMetCard collapsed />
          <SharedReasoningCard collapsed />
          <CognitionGuardrailsCard collapsed />
        </div>
        <div className="acme-right-panel__featured">
          <MemoryCommitmentInContextPanel />
        </div>
      </aside>
    );
  }

  return (
    <aside className="acme-right-panel" aria-label="Acme Renewal context">
      <div className="acme-right-panel__collapsed-stack">
        <IntentMetCard collapsed />
        <SharedReasoningCard collapsed />
        <CognitionGuardrailsCard collapsed />
      </div>
      <div className="acme-right-panel__featured">
        <AuthorityGradientInContext />
      </div>
    </aside>
  );
}
