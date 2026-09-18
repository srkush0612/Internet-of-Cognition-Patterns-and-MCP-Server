"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getPattern } from "@/lib/patterns";
import { PATTERN_STANDALONE } from "@/components/patterns/pattern-registry";
import {
  antiPatternsForElement,
  elementsForPattern,
  getEncounter,
} from "@/lib/studio/content";
import { acceptRemoval, restoreElement } from "@/lib/studio/pushback";
import type { Decision, Scenario } from "@/lib/studio/types";
import { PatternEmbed } from "./PatternEmbed";
import "./studio.css";

type Props = { scenarioId: string; encounterId: string };

async function saveDecision(scenarioId: string, decisions: Decision[]): Promise<Scenario | null> {
  const res = await fetch("/api/studio/scenarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", id: scenarioId, updates: { decisions } }),
  });
  const data = await res.json();
  return data.success ? (data.scenario as Scenario) : null;
}

export function EncounterCanvas({ scenarioId, encounterId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scenario, setScenario] = useState<Scenario | null | undefined>(undefined);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [reasonDraft, setReasonDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);

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

  const encounter = getEncounter(encounterId);
  const existingDecision = scenario?.decisions.find((d) => d.encounterId === encounterId);
  const patternId = existingDecision?.patternId ?? searchParams.get("pattern") ?? undefined;
  const pattern = patternId ? getPattern(patternId) : undefined;
  const elements = useMemo(() => (patternId ? elementsForPattern(patternId) : []), [patternId]);
  const Component = patternId ? PATTERN_STANDALONE[patternId] : undefined;

  // Seed the decision the first time this pattern is chosen for this encounter.
  useEffect(() => {
    if (!scenario || !patternId || existingDecision) return;
    const decision: Decision = {
      encounterId,
      patternId,
      elementsPresent: elements.map((el) => el.id),
      elementsRemoved: [],
      state: "answered",
    };
    const nextDecisions = [...scenario.decisions, decision];
    saveDecision(scenarioId, nextDecisions).then((updated) => {
      if (updated) setScenario(updated);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, patternId, existingDecision]);

  if (scenario === undefined) {
    return <div className="studio-canvas studio-muted">Loading…</div>;
  }

  if (scenario === null || !encounter) {
    return (
      <div className="studio-canvas">
        <p className="studio-empty-state">
          {scenario === null ? "Scenario not found." : "Encounter not found."}
        </p>
      </div>
    );
  }

  if (!patternId || !pattern) {
    return (
      <div className="studio-canvas">
        <p className="studio-empty-state">
          No pattern chosen yet.{" "}
          <Link href={`/studio/${scenarioId}/encounter/${encounterId}`}>
            Go back and choose one.
          </Link>
        </p>
      </div>
    );
  }

  const decision = existingDecision;
  const elementsRemoved = decision?.elementsRemoved ?? [];

  async function updateDecision(next: Decision) {
    if (!scenario) return;
    setSaving(true);
    const nextDecisions = scenario.decisions.map((d) =>
      d.encounterId === encounterId ? next : d,
    );
    const updated = await saveDecision(scenarioId, nextDecisions);
    if (updated) setScenario(updated);
    setSaving(false);
  }

  function requestRemoval(elementId: string) {
    setPendingRemovalId(elementId);
    setReasonDraft("");
  }

  async function confirmRemoval(elementId: string) {
    if (!decision || !reasonDraft.trim()) return;
    const next = acceptRemoval(decision, elementId, reasonDraft.trim());
    setPendingRemovalId(null);
    await updateDecision(next);
  }

  async function putBack(elementId: string) {
    if (!decision) return;
    const next = restoreElement(decision, elementId);
    await updateDecision(next);
  }

  async function copyAndEdit() {
    setCopying(true);
    const res = await fetch("/api/studio/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "copy", id: scenarioId }),
    });
    const data = await res.json();
    setCopying(false);
    if (data.success) {
      router.push(
        `/studio/${data.scenario.id}/encounter/${encounterId}/canvas?pattern=${encodeURIComponent(patternId ?? "")}`,
      );
    }
  }

  const locked = Boolean(scenario.readOnly);

  return (
    <div className="studio-canvas">
      <p className="studio-breadcrumb">
        <Link href="/studio">Studio</Link> /{" "}
        <Link href={`/studio/${scenarioId}`}>{scenario.name}</Link> /{" "}
        <Link href={`/studio/${scenarioId}/encounter/${encounterId}`}>{encounter.title}</Link> /{" "}
        {pattern.title}
      </p>
      {locked && (
        <div className="studio-notice studio-notice--gap">
          <strong>This is the read-only sample.</strong> Make a copy to change what is present or
          removed.{" "}
          <button
            type="button"
            className="studio-button studio-button--primary studio-button--small"
            disabled={copying}
            onClick={copyAndEdit}
          >
            {copying ? "Copying…" : "Make a copy to edit"}
          </button>
        </div>
      )}
      <h1 className="studio-map__title">{pattern.title}</h1>
      <p className="studio-muted">
        {elements.length === 0
          ? "No elements authored yet for this pattern — see content/studio/pattern-elements.json."
          : "Required elements are on by default. Removing one that is required needs a reason, and the encounter is marked answered with a gap."}
        {saving && " Saving…"}
      </p>

      <div className="studio-canvas__layout">
        <div>
          {Component ? (
            <PatternEmbed
              Component={Component}
              elements={elements}
              removedElementIds={elementsRemoved}
            />
          ) : (
            <div className="studio-empty-state">
              <strong>Not yet in the library.</strong> There is no live component to embed for{" "}
              {pattern.title} yet — see <code>components/patterns/pattern-registry.tsx</code>.
            </div>
          )}
        </div>

        <div className="studio-elements-panel">
          {elements.length === 0 && (
            <p className="studio-muted" title="Not yet in the library">
              not yet in the library
            </p>
          )}
          {elements.map((element) => {
            const removed = elementsRemoved.includes(element.id);
            const reason = decision?.removedElementReasons?.[element.id];
            const antiPatterns = antiPatternsForElement(element.id);

            return (
              <div
                key={element.id}
                className={`studio-element-row${removed ? " studio-element-row--removed" : ""}`}
              >
                <div className="studio-element-row__head">
                  <span className="studio-element-row__label">
                    {element.markerNumber && (
                      <span className="studio-element-row__number">{element.markerNumber}</span>
                    )}
                    {element.label}
                    {!element.required && (
                      <span className="studio-tag studio-tag--neutral">optional</span>
                    )}
                  </span>
                  {removed ? (
                    <button
                      type="button"
                      className="studio-button studio-button--ghost studio-button--small"
                      disabled={locked}
                      onClick={() => putBack(element.id)}
                    >
                      Put it back
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="studio-button studio-button--ghost studio-button--small"
                      disabled={locked}
                      onClick={() => requestRemoval(element.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="studio-element-row__hint">{element.hint}</p>
                {element.evidence && (
                  <p className="studio-element-row__evidence">{element.evidence}</p>
                )}
                {removed && reason && (
                  <p className="studio-element-row__reason">
                    <strong>Why it was removed:</strong> {reason}
                  </p>
                )}

                {pendingRemovalId === element.id && (
                  <div className="studio-pushback">
                    <p className="studio-pushback__title">
                      {element.required ? "This element is required." : "Removing this element"}
                    </p>
                    {antiPatterns.length > 0 ? (
                      antiPatterns.map((ap) => (
                        <p key={ap.id} className="studio-pushback__anti-pattern">
                          <strong>
                            {ap.name}
                            {ap.status === "proposed" ? " (proposed)" : ""}:
                          </strong>{" "}
                          {ap.description}{" "}
                          <span className="studio-muted">— {ap.evidence}</span>
                        </p>
                      ))
                    ) : (
                      <p className="studio-pushback__anti-pattern studio-muted">
                        Not yet in the library — no documented anti-pattern for removing this
                        element, but a reason is still required.
                      </p>
                    )}
                    <textarea
                      rows={2}
                      placeholder="Why are you removing it?"
                      value={reasonDraft}
                      onChange={(e) => setReasonDraft(e.target.value)}
                    />
                    <div className="studio-pushback__actions">
                      <button
                        type="button"
                        className="studio-button studio-button--primary studio-button--small"
                        disabled={!reasonDraft.trim()}
                        onClick={() => confirmRemoval(element.id)}
                      >
                        Confirm removal
                      </button>
                      <button
                        type="button"
                        className="studio-button studio-button--ghost studio-button--small"
                        onClick={() => setPendingRemovalId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="studio-muted" style={{ marginTop: "2rem" }}>
        <Link href={`/studio/${scenarioId}`}>Back to the encounter map</Link>
      </p>
    </div>
  );
}
