"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  NUCLEUX_CLUSTER_LABEL,
  NUCLEUX_STAGE_LABEL,
  NUCLEUX_STAGE_ORDER,
  NUCLEUX_STAGE_SUMMARY,
  type NucleuxCluster,
  type NucleuxStage,
  type PatternCategory,
  type V3PatternCard,
} from "@/lib/v3/catalog";
import { LEVEL_LABEL } from "@/lib/v2/levels";
import type { Level } from "@/lib/v2/types";

type View = "agentic" | "all";
type DimensionFilter = "all" | Level;

const DIMENSIONS: DimensionFilter[] = ["all", "L1", "L2", "L3", "L4"];
const DIMENSION_SHORT: Record<DimensionFilter, string> = {
  all: "Every dimension",
  L1: LEVEL_LABEL.L1,
  L2: LEVEL_LABEL.L2,
  L3: LEVEL_LABEL.L3,
  L4: LEVEL_LABEL.L4,
};

export function V3PatternBrowser({ patterns }: { patterns: V3PatternCard[] }) {
  const [view, setView] = useState<View>("agentic");
  const [dimension, setDimension] = useState<DimensionFilter>("all");

  const agentic = useMemo(
    () => patterns.filter((pattern) => pattern.category === "agentic"),
    [patterns],
  );

  const filteredAgentic = useMemo(
    () =>
      agentic.filter((pattern) => dimension === "all" || pattern.level === dimension),
    [agentic, dimension],
  );

  const counts = useMemo(() => {
    const byStage: Record<NucleuxStage, V3PatternCard[]> = {
      onboarding: [],
      initially: [],
      "during-interaction": [],
      "over-time": [],
    };
    for (const pattern of patterns) byStage[pattern.nucleuxStage].push(pattern);
    const byCategory: Record<PatternCategory, number> = {
      agentic: patterns.filter((pattern) => pattern.category === "agentic").length,
      general: patterns.filter((pattern) => pattern.category === "general").length,
    };
    return { byStage, byCategory };
  }, [patterns]);

  return (
    <section className="v3-section v3-section--patterns-body">
      <div className="v3-container">
        <div className="v3-patterns-toolbar" role="group" aria-label="Pattern view">
          <div className="v3-patterns-switch" role="tablist" aria-label="Which patterns">
            <button
              type="button"
              role="tab"
              aria-selected={view === "agentic"}
              onClick={() => setView("agentic")}
            >
              Agentic
              <span className="v3-patterns-switch__count">{counts.byCategory.agentic}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "all"}
              onClick={() => setView("all")}
            >
              All patterns
              <span className="v3-patterns-switch__count">
                {counts.byCategory.agentic + counts.byCategory.general}
              </span>
            </button>
          </div>
          {view === "agentic" && (
            <div className="v3-patterns-dimension" role="radiogroup" aria-label="Who is involved">
              {DIMENSIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={dimension === item}
                  onClick={() => setDimension(item)}
                >
                  {DIMENSION_SHORT[item]}
                </button>
              ))}
            </div>
          )}
        </div>

        {view === "agentic" ? (
          <AgenticGrid patterns={filteredAgentic} />
        ) : (
          <StagedLibrary patterns={patterns} />
        )}
      </div>
    </section>
  );
}

function AgenticGrid({ patterns }: { patterns: V3PatternCard[] }) {
  if (patterns.length === 0) {
    return (
      <p className="v3-patterns-empty">
        No agentic patterns match this filter yet.
      </p>
    );
  }
  return (
    <div className="v3-patterns-grid">
      {patterns.map((pattern) => (
        <AgenticCard key={pattern.id} pattern={pattern} />
      ))}
    </div>
  );
}

function AgenticCard({ pattern }: { pattern: V3PatternCard }) {
  const dimension = pattern.level ? LEVEL_LABEL[pattern.level] : null;
  const body = (
    <>
      <div className="v3-pattern-card__head">
        <span className="v3-pattern-card__cluster">
          {NUCLEUX_CLUSTER_LABEL[pattern.nucleuxCluster]}
        </span>
        <span className="v3-pattern-card__badge">Agentic</span>
      </div>
      <h3>{pattern.name}</h3>
      <p>{pattern.summary}</p>
      <div className="v3-pattern-card__meta">
        {dimension && <span>{dimension}</span>}
        {pattern.href && <span className="v3-pattern-card__link">Open pattern ↗</span>}
      </div>
    </>
  );
  if (pattern.href) {
    return (
      <Link
        href={pattern.href}
        className="v3-pattern-card v3-pattern-card--agentic v3-pattern-card--linked"
      >
        {body}
      </Link>
    );
  }
  return (
    <article className="v3-pattern-card v3-pattern-card--agentic">
      {body}
      <p className="v3-pattern-card__note">
        Full pattern page coming next. Behavior spec and 4 dimensions in the works.
      </p>
    </article>
  );
}

function StagedLibrary({ patterns }: { patterns: V3PatternCard[] }) {
  return (
    <div className="v3-patterns-stages">
      {NUCLEUX_STAGE_ORDER.map((stage) => {
        const stagePatterns = patterns.filter(
          (pattern) => pattern.nucleuxStage === stage,
        );
        if (stagePatterns.length === 0) return null;
        return (
          <StageBlock
            key={stage}
            stage={stage}
            patterns={stagePatterns}
          />
        );
      })}
    </div>
  );
}

function StageBlock({
  stage,
  patterns,
}: {
  stage: NucleuxStage;
  patterns: V3PatternCard[];
}) {
  const byCluster = useMemo(() => {
    const map = new Map<NucleuxCluster, V3PatternCard[]>();
    for (const pattern of patterns) {
      const list = map.get(pattern.nucleuxCluster) ?? [];
      list.push(pattern);
      map.set(pattern.nucleuxCluster, list);
    }
    return Array.from(map.entries());
  }, [patterns]);

  return (
    <section
      className="v3-pattern-stage"
      id={`stage-${stage}`}
      aria-labelledby={`stage-${stage}-title`}
    >
      <header>
        <p className="v3-eyebrow">Stage</p>
        <h2 id={`stage-${stage}-title`}>{NUCLEUX_STAGE_LABEL[stage]}</h2>
        <p>{NUCLEUX_STAGE_SUMMARY[stage]}</p>
        <span className="v3-pattern-stage__count">{patterns.length} patterns</span>
      </header>
      <div className="v3-pattern-stage__clusters">
        {byCluster.map(([cluster, clusterPatterns]) => (
          <div key={cluster} className="v3-pattern-cluster">
            <h3>{NUCLEUX_CLUSTER_LABEL[cluster]}</h3>
            <div className="v3-pattern-cluster__list">
              {clusterPatterns.map((pattern) => (
                <PatternChip key={pattern.id} pattern={pattern} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PatternChip({ pattern }: { pattern: V3PatternCard }) {
  const isAgentic = pattern.category === "agentic";
  const body = (
    <>
      <div className="v3-pattern-chip__row">
        <strong>{pattern.name}</strong>
        <span
          className={
            isAgentic
              ? "v3-pattern-chip__tag v3-pattern-chip__tag--agentic"
              : "v3-pattern-chip__tag"
          }
        >
          {isAgentic ? "Agentic" : "Reference"}
        </span>
      </div>
      <p>{pattern.summary}</p>
    </>
  );
  if (pattern.href) {
    return (
      <Link className="v3-pattern-chip v3-pattern-chip--linked" href={pattern.href}>
        {body}
      </Link>
    );
  }
  return <article className="v3-pattern-chip">{body}</article>;
}
