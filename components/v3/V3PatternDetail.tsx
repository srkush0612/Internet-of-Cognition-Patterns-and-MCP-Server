"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AUDIENCE_LABEL,
  CHANNEL_LABEL,
  LEVEL_LABEL,
  LEVEL_ORDER,
  LEVEL_SHAPE,
} from "@/lib/v2/levels";
import type { Pattern } from "@/lib/v2/types";
import { getHaxPrinciple } from "@/lib/v2/principles";
import type { PatternPrinciples } from "@/lib/v2/principles";
import {
  NUCLEUX_CLUSTER_LABEL,
  NUCLEUX_STAGE_LABEL,
  type NucleuxCluster,
  type NucleuxStage,
} from "@/lib/v3/catalog";
import { getNewAgenticPreview } from "./NewAgenticPreviews";

type Theme = "shadcn" | "material";

type Props = {
  pattern: Pattern;
  stage: NucleuxStage;
  cluster: NucleuxCluster;
  principles?: PatternPrinciples;
};

export function V3PatternDetail({ pattern, stage, cluster, principles }: Props) {
  const [theme, setTheme] = useState<Theme>("shadcn");
  return (
    <div className="v3-pattern-detail">
      <Hero pattern={pattern} stage={stage} cluster={cluster} />
      {pattern.whatItSolves && (
        <Section id="what" title="What it solves">
          <p className="v3-pattern-detail__lede">{pattern.whatItSolves}</p>
        </Section>
      )}
      {pattern.interactionSteps && pattern.interactionSteps.length > 0 && (
        <Section id="interaction" title="How the interaction works">
          <ol className="v3-pattern-detail__steps">
            {pattern.interactionSteps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}
      <Section id="who" title="Who is involved">
        <DimensionTable pattern={pattern} />
      </Section>
      <Section id="spec" title="Behavior spec">
        <BehaviorSpec pattern={pattern} />
      </Section>
      {principles && (
        <Section id="principles" title="Principles at work">
          <PrinciplesCallout principles={principles} />
        </Section>
      )}
      <Section id="preview" title="How it looks">
        <ThemedPreview
          pattern={pattern}
          theme={theme}
          onChange={setTheme}
        />
      </Section>
    </div>
  );
}

function Hero({
  pattern,
  stage,
  cluster,
}: {
  pattern: Pattern;
  stage: NucleuxStage;
  cluster: NucleuxCluster;
}) {
  return (
    <header className="v3-pattern-detail__hero">
      <div className="v3-pattern-detail__crumb">
        <Link href="/v3/patterns">Pattern library</Link>
        <span aria-hidden="true">·</span>
        <span>{NUCLEUX_STAGE_LABEL[stage]}</span>
        <span aria-hidden="true">·</span>
        <span>{NUCLEUX_CLUSTER_LABEL[cluster]}</span>
      </div>
      <h1>{pattern.name}</h1>
      <p className="v3-pattern-detail__summary">{pattern.summary}</p>
      {pattern.factChips && pattern.factChips.length > 0 && (
        <ul className="v3-pattern-detail__chips">
          {pattern.factChips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
      )}
    </header>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="v3-pattern-detail__section"
      id={`pattern-${id}`}
      aria-labelledby={`pattern-${id}-title`}
    >
      <h2 id={`pattern-${id}-title`}>{title}</h2>
      {children}
    </section>
  );
}

function DimensionTable({ pattern }: { pattern: Pattern }) {
  return (
    <div className="v3-dimension-table" role="table">
      {LEVEL_ORDER.map((level) => {
        const note = pattern.level.notes[level];
        const isPrimary = pattern.level.primary === level;
        const shape = LEVEL_SHAPE[level];
        return (
          <div
            key={level}
            className="v3-dimension-table__row"
            data-active={note ? "true" : "false"}
            data-primary={isPrimary ? "true" : "false"}
            role="row"
          >
            <div className="v3-dimension-table__label" role="cell">
              <div className="v3-dimension-table__shape" aria-hidden="true">
                {Array.from({ length: shape.agents }).map((_, i) => (
                  <i key={`a${i}`} className="v3-agent" />
                ))}
                {Array.from({ length: shape.people }).map((_, i) => (
                  <i key={`p${i}`} className="v3-person" />
                ))}
              </div>
              <div>
                <strong>{LEVEL_LABEL[level]}</strong>
                {isPrimary && <span className="v3-dimension-table__tag">Primary</span>}
              </div>
            </div>
            <div className="v3-dimension-table__note" role="cell">
              {note ? <p>{note}</p> : <p className="v3-dimension-table__empty">Not applicable.</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BehaviorSpec({ pattern }: { pattern: Pattern }) {
  return (
    <div className="v3-pattern-spec">
      <p className="v3-pattern-spec__sentence">{pattern.spec}</p>
      <dl className="v3-pattern-spec__facts">
        {pattern.triggers.length > 0 && (
          <SpecFact label="When">
            <ul>
              {pattern.triggers.map((trigger) => (
                <li key={trigger}>{trigger}</li>
              ))}
            </ul>
          </SpecFact>
        )}
        <SpecFact label="Mode">
          <p>
            {pattern.mode.primary}
            {pattern.mode.secondary ? ` · also ${pattern.mode.secondary}` : ""}
          </p>
        </SpecFact>
        <SpecFact label="Audience">
          <p>
            {pattern.audience.map((item) => AUDIENCE_LABEL[item]).join(", ")}
          </p>
        </SpecFact>
        <SpecFact label="Channels">
          <p>
            {pattern.channels.map((item) => CHANNEL_LABEL[item]).join(", ")}
          </p>
        </SpecFact>
        {pattern.responses && pattern.responses.length > 0 && (
          <SpecFact label="Responses">
            <ul className="v3-pattern-spec__responses">
              {pattern.responses.map((reply) => (
                <li key={reply}>{reply}</li>
              ))}
            </ul>
          </SpecFact>
        )}
      </dl>
    </div>
  );
}

function SpecFact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="v3-pattern-spec__fact">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function PrinciplesCallout({ principles }: { principles: PatternPrinciples }) {
  const items = [
    { ...principles.primary, relation: "Primary" as const },
    ...(principles.secondary ? [{ ...principles.secondary, relation: "Also supports" as const }] : []),
  ];
  return (
    <div className="v3-pattern-principles">
      {items.map(({ id, why, relation }) => {
        const principle = getHaxPrinciple(id);
        return (
          <div className="v3-pattern-principles__row" key={id}>
            <span className="v3-pattern-principles__relation">{relation}</span>
            <div>
              <Link href={`/v3/principles/${id}`}>
                {principle.name} <span aria-hidden="true">↗</span>
              </Link>
              <p>{why}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ThemedPreview({
  pattern,
  theme,
  onChange,
}: {
  pattern: Pattern;
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  const authored = getNewAgenticPreview(pattern.id) !== null;
  return (
    <div className="v3-themed-preview">
      <div className="v3-theme-toggle" role="radiogroup" aria-label="Preview theme">
        <button
          type="button"
          role="radio"
          aria-checked={theme === "shadcn"}
          onClick={() => onChange("shadcn")}
        >
          shadcn
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={theme === "material"}
          onClick={() => onChange("material")}
        >
          Material
        </button>
      </div>
      <div className="v3-preview" data-theme={theme}>
        <PreviewFrame pattern={pattern} />
      </div>
      {!authored && (
        <p className="v3-pattern-detail__note">
          A generic preview rendered in two theme systems. A pattern-specific preview,
          with the authored UI for this exchange, is coming next.
        </p>
      )}
    </div>
  );
}

function PreviewFrame({ pattern }: { pattern: Pattern }) {
  const AuthoredPreview = getNewAgenticPreview(pattern.id);
  if (AuthoredPreview) {
    return (
      <div className="v3-preview__authored">
        <AuthoredPreview />
      </div>
    );
  }
  return (
    <div className="v3-preview__frame">
      <div className="v3-preview__bar">
        <span className="v3-preview__avatar">A</span>
        <strong>{pattern.name}</strong>
        <span className="v3-preview__status">active</span>
      </div>
      <div className="v3-preview__body">
        {pattern.example && (
          <div className="v3-preview__scene">
            <p className="v3-preview__kicker">Example moment</p>
            <p>{pattern.example}</p>
          </div>
        )}
        {pattern.responses && pattern.responses.length > 0 && (
          <div className="v3-preview__responses">
            <p className="v3-preview__kicker">What the receiver can do</p>
            <div>
              {pattern.responses.map((reply, index) => (
                <button type="button" key={reply} data-primary={index === 0}>
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
