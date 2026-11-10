"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NUCLEUX_CLUSTER_LABEL, type V3PatternCard } from "@/lib/v3/catalog";
import { DESIGN_NEEDS, getPatternNeeds, type DesignNeed } from "@/lib/v3/filter-taxonomy";
import { CHANNEL_LABEL, LEVEL_LABEL } from "@/lib/v2/levels";
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
  const [search, setSearch] = useState("");
  const [need, setNeed] = useState<"all" | DesignNeed>("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedDimension = params.get("dimension");
    const requestedNeed = params.get("need");
    const requestedSearch = params.get("search");
    if (DIMENSIONS.some((item) => item === requestedDimension)) setDimension(requestedDimension as DimensionFilter);
    if (DESIGN_NEEDS.some((item) => item.id === requestedNeed)) setNeed(requestedNeed as DesignNeed);
    if (requestedSearch) setSearch(requestedSearch);
    if (requestedSearch || requestedNeed) setView("all");
  }, []);

  const agenticCount = useMemo(() => patterns.filter((pattern) => pattern.category === "agentic").length, [patterns]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return patterns.filter((pattern) => {
      if (view === "agentic" && pattern.category !== "agentic") return false;
      if (view === "agentic" && dimension !== "all" && !pattern.dimensions?.includes(dimension)) return false;
      if (view === "all" && need !== "all" && !getPatternNeeds(pattern).includes(need)) return false;
      if (query && !`${pattern.name} ${pattern.summary} ${NUCLEUX_CLUSTER_LABEL[pattern.nucleuxCluster]}`.toLocaleLowerCase().includes(query)) return false;
      return true;
    });
  }, [patterns, view, dimension, need, search]);

  function changeView(next: View) {
    setView(next);
    setSearch("");
    setNeed("all");
    setDimension("all");
  }

  return (
    <section className="v3-section v3-section--patterns-body" aria-label="Browse patterns">
      <div className="v3-container">
        <div className="v3-patterns-toolbar">
          <div className="v3-patterns-switch" role="tablist" aria-label="Pattern view">
            <button type="button" role="tab" aria-selected={view === "agentic"} onClick={() => changeView("agentic")}>Agentic <span className="v3-patterns-switch__count">{agenticCount}</span></button>
            <button type="button" role="tab" aria-selected={view === "all"} onClick={() => changeView("all")}>All patterns <span className="v3-patterns-switch__count">{patterns.length}</span></button>
          </div>
          {view === "agentic" && <div className="v3-patterns-dimension" role="radiogroup" aria-label="Who is involved">
            {DIMENSIONS.map((item) => <button key={item} type="button" role="radio" aria-checked={dimension === item} onClick={() => setDimension(item)}>{DIMENSION_SHORT[item]}</button>)}
          </div>}
        </div>
        <div className="v3-patterns-search-row">
          <label className="v3-pattern-search"><span>Search {view === "agentic" ? "agentic patterns" : "all patterns"}</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or what you need" /></label>
          {view === "all" && <label className="v3-pattern-need">Design need<select value={need} onChange={(event) => setNeed(event.target.value as "all" | DesignNeed)}><option value="all">Every need</option>{DESIGN_NEEDS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>}
        </div>
        <div className="v3-pattern-results-heading"><p aria-live="polite">Showing {filtered.length} {view === "agentic" ? "agentic patterns" : `of ${patterns.length} patterns`}</p>{(search || need !== "all" || dimension !== "all") && <button type="button" onClick={() => { setSearch(""); setNeed("all"); setDimension("all"); }}>Clear filters</button>}</div>
        {filtered.length ? <div className="v3-patterns-grid">{filtered.map((pattern) => <PatternCard key={pattern.id} pattern={pattern} showAgenticChip={view === "all"} />)}</div> : <p className="v3-patterns-empty">No patterns match these filters. Try another search or clear the filters.</p>}
      </div>
    </section>
  );
}

function PatternCard({ pattern, showAgenticChip }: { pattern: V3PatternCard; showAgenticChip: boolean }) {
  return <Link href={pattern.href ?? "/v3/patterns"} className="v3-pattern-card v3-pattern-card--linked">
    <div className="v3-pattern-card__head"><span className="v3-pattern-card__cluster">{NUCLEUX_CLUSTER_LABEL[pattern.nucleuxCluster]}</span>{showAgenticChip && pattern.category === "agentic" && <span className="v3-pattern-card__badge">Agentic</span>}</div>
    <h3>{pattern.name}</h3>
    <p>{pattern.summary}</p>
    <div className="v3-pattern-card__meta"><span>{pattern.channels?.length ? pattern.channels.map((channel) => CHANNEL_LABEL[channel]).slice(0, 2).join(" · ") : ""}</span><span className="v3-pattern-card__link">Open pattern ↗</span></div>
  </Link>;
}
