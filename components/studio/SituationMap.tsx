"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPattern } from "@/lib/patterns";
import { isPatternReady } from "@/lib/pattern-ready";
import { isAtRisk } from "@/lib/studio/risk";
import { situations } from "@/lib/studio/content";
import { TOPOLOGY_LABEL } from "@/lib/studio/types";
import type { Situation, SituationState, Scenario } from "@/lib/studio/types";
import "./studio.css";

/** True only when the situation has at least one mapped pattern and none of them are ready yet. */
function noReadyPattern(situation: Situation): boolean {
  return situation.patternIds.length > 0 && situation.patternIds.every((id) => !isPatternReady(id));
}

type Props = { scenarioId: string };

function stateFor(situationId: string, scenario: Scenario): SituationState {
  const decision = scenario.decisions.find((d) => d.situationId === situationId);
  if (!decision) return "unanswered";
  return decision.state;
}

const STATE_LABEL: Record<SituationState, string> = {
  unanswered: "unanswered",
  answered: "answered",
  answered_with_gap: "answered with a gap",
};

export function SituationMap({ scenarioId }: Props) {
  const [scenario, setScenario] = useState<Scenario | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/studio/scenarios?id=${encodeURIComponent(scenarioId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setScenario(data.success ? (data.scenario as Scenario) : null);
      })
      .catch(() => {
        if (!cancelled) setScenario(null);
      });
    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  if (scenario === undefined) {
    return <div className="studio-map studio-muted">Loading…</div>;
  }

  if (scenario === null) {
    return (
      <div className="studio-map">
        <p className="studio-empty-state">Scenario not found.</p>
      </div>
    );
  }

  const states = situations.map((s) => stateFor(s.id, scenario));
  const atRiskCount = situations.filter((s) => isAtRisk(s, scenario)).length;
  const gapCount = states.filter((s) => s === "answered_with_gap").length;
  const unansweredCount = states.filter((s) => s === "unanswered").length;
  const harderCount = situations.filter((s) => s.difficultyNotes?.[scenario.topology]).length;
  const noReadyPatternCount = situations.filter(noReadyPattern).length;

  return (
    <div className="studio-map">
      <p className="studio-breadcrumb">
        <Link href="/studio">Studio</Link> / {scenario.name}
      </p>
      <h1 className="studio-map__title">
        {situations.length > 0
          ? `${situations.length} situation${situations.length === 1 ? "" : "s"} this system will have`
          : "Situations"}
      </h1>

      {situations.length > 0 && (
        <div className="studio-map__stats">
          <span className="studio-tag studio-tag--risk">{atRiskCount} at risk</span>
          <span className="studio-tag studio-tag--gap">{gapCount} answered with a gap</span>
          <span className="studio-tag studio-tag--neutral">{unansweredCount} unanswered</span>
          <span className="studio-tag studio-tag--harder">
            {harderCount} harder with {TOPOLOGY_LABEL[scenario.topology].toLowerCase()}
          </span>
          {noReadyPatternCount > 0 && (
            <span className="studio-tag studio-tag--not-ready">
              {noReadyPatternCount} with no ready pattern yet
            </span>
          )}
        </div>
      )}

      {situations.length === 0 ? (
        <div className="studio-empty-state">
          <p>
            <strong>Not yet in the library.</strong> The fixed situation list hasn&apos;t been
            authored yet — see <code>content/studio/situations.json</code>. This screen will list
            every situation the research has identified once it is; nothing here is generated from
            your description.
          </p>
        </div>
      ) : (
        <ol className="studio-encounter-list">
          {situations.map((situation, index) => {
            const decision = scenario.decisions.find((d) => d.situationId === situation.id);
            const state = states[index];
            const atRisk = isAtRisk(situation, scenario);
            const harderNote = situation.difficultyNotes?.[scenario.topology];
            const chosenPattern = decision ? getPattern(decision.patternId) : undefined;
            const notReady = noReadyPattern(situation);

            return (
              <li key={situation.id}>
                <Link
                  href={`/studio/${scenarioId}/situation/${situation.id}`}
                  className="studio-encounter-row"
                >
                  <span className="studio-encounter-row__number">
                    {String(situation.order).padStart(2, "0")}
                  </span>
                  <div className="studio-encounter-row__main">
                    <div className="studio-encounter-row__title-line">
                      <span className="studio-encounter-row__title">{situation.title}</span>
                      {atRisk && <span className="studio-tag studio-tag--risk">at risk</span>}
                      {notReady && (
                        <span className="studio-tag studio-tag--not-ready">no ready pattern</span>
                      )}
                    </div>
                    <p className="studio-encounter-row__example">{situation.example}</p>
                    {harderNote && (
                      <p className="studio-encounter-row__harder">
                        <span className="studio-tag studio-tag--harder">harder</span> {harderNote}
                      </p>
                    )}
                  </div>
                  <div className="studio-encounter-row__pattern">
                    {chosenPattern ? (
                      <span>{chosenPattern.title}</span>
                    ) : situation.patternIds.length > 0 ? (
                      <span className="studio-muted">{situation.patternIds.length} patterns</span>
                    ) : (
                      <span className="studio-muted" title="Not yet in the library">
                        not yet in the library
                      </span>
                    )}
                  </div>
                  <span className={`studio-state-chip studio-state-chip--${state}`}>
                    {STATE_LABEL[state]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
