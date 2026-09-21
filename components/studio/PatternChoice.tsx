"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPattern } from "@/lib/patterns";
import { isPatternReady } from "@/lib/pattern-ready";
import { CategoryLabel, ReasoningTag } from "@/components/PatternTaxonomy";
import { PATTERN_STANDALONE } from "@/components/patterns/pattern-registry";
import { elementsForPattern, getSituation } from "@/lib/studio/content";
import type { Scenario } from "@/lib/studio/types";
import "./studio.css";

type Props = { scenarioId: string; situationId: string };

export function PatternChoice({ scenarioId, situationId }: Props) {
  const router = useRouter();
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

  const situation = getSituation(situationId);

  if (scenario === undefined) {
    return <div className="studio-map studio-muted">Loading…</div>;
  }

  if (scenario === null || !situation) {
    return (
      <div className="studio-map">
        <p className="studio-empty-state">
          {scenario === null ? "Scenario not found." : "Situation not found."}
        </p>
      </div>
    );
  }

  async function choosePattern(patternId: string) {
    router.push(
      `/studio/${scenarioId}/situation/${situationId}/canvas?pattern=${encodeURIComponent(patternId)}`,
    );
  }

  const patterns = situation.patternIds
    .map((id) => getPattern(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const singlePatternGap = situation.patternIds.length === 1;
  const allNotReady = patterns.length > 0 && patterns.every((p) => !isPatternReady(p.slug));

  return (
    <div className="studio-map">
      <p className="studio-breadcrumb">
        <Link href="/studio">Studio</Link> /{" "}
        <Link href={`/studio/${scenarioId}`}>{scenario.name}</Link> / {situation.title}
      </p>
      <h1 className="studio-map__title">{situation.title}</h1>
      <p className="studio-encounter-row__example" style={{ marginBottom: "1.5rem" }}>
        {situation.example}
      </p>

      {situation.patternIds.length === 0 && (
        <div className="studio-empty-state">
          <p>
            <strong>Not yet in the library.</strong> No pattern has been mapped to this situation
            yet — see <code>content/studio/situations.json</code>.
          </p>
        </div>
      )}

      {singlePatternGap && (
        <div className="studio-notice studio-notice--gap">
          <strong>Library gap.</strong> Only one pattern currently answers this situation — there
          is no comparison to make yet. This is itself a finding, not a resolved choice.
        </div>
      )}

      {allNotReady && (
        <div className="studio-notice studio-notice--not-ready">
          <strong>No ready pattern yet.</strong> Every pattern mapped to this situation is still
          unbuilt (see the readiness badge on each card below) — you can still open the canvas to
          see its elements, but there is no vetted reference design behind it.
        </div>
      )}

      <div className="studio-pattern-choice-list">
        {patterns.map((pattern) => {
          const ready = isPatternReady(pattern.slug);
          const elementCount = elementsForPattern(pattern.slug).length;
          const hasEmbed = Boolean(PATTERN_STANDALONE[pattern.slug]);

          return (
            <div key={pattern.slug} className="studio-card studio-pattern-card">
              <div className="studio-pattern-card__head">
                <div>
                  <CategoryLabel category={pattern.category} />
                  <h2 className="studio-pattern-card__title">{pattern.title}</h2>
                </div>
                <div className="studio-pattern-card__badges">
                  <ReasoningTag reasoning={pattern.reasoning} />
                  <span
                    className={`studio-badge studio-badge--${ready ? "ready" : "not-ready"}`}
                    title="Readiness: whether this pattern has a vetted reference design"
                  >
                    {ready ? "Ready" : "Not built yet"}
                  </span>
                  <span
                    className={`studio-badge studio-badge--evidence-${(pattern.backingStrength ?? "none").toLowerCase()}`}
                    title="Evidence strength: how much research backs this pattern"
                  >
                    {pattern.backingStrength ?? "Not rated"} evidence
                  </span>
                </div>
              </div>
              <p className="studio-pattern-card__oneliner">{pattern.oneliner}</p>

              <dl className="studio-pattern-card__meta">
                <div>
                  <dt>Participants</dt>
                  <dd>
                    {pattern.participants ?? (
                      <span className="studio-muted" title="Not yet in the library">
                        not yet in the library
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Commits you to</dt>
                  <dd>
                    <span className="studio-muted" title="Not yet in the library">
                      not yet in the library
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Composes with</dt>
                  <dd>
                    {pattern.composesWith?.length ? (
                      pattern.composesWith.join(", ")
                    ) : (
                      <span className="studio-muted" title="Not yet in the library">
                        not yet in the library
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="studio-pattern-card__footer">
                <span className="studio-muted">
                  {elementCount > 0
                    ? `${elementCount} element${elementCount === 1 ? "" : "s"} authored`
                    : "no elements authored yet"}
                  {!hasEmbed && " · no live component to embed yet"}
                </span>
                <button
                  type="button"
                  className="studio-button studio-button--primary"
                  onClick={() => choosePattern(pattern.slug)}
                >
                  Choose this pattern
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
