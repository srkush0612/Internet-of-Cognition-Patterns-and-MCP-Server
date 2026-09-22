"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentPane } from "@/components/studio/AgentPane";
import {
  activeTensionsFor,
  shapeabilityOfSituation,
  StudioCanvas,
  type CanvasView,
} from "@/components/studio/StudioCanvas";
import { getPattern } from "@/lib/patterns";
import { SetupCard } from "@/components/studio/SetupCard";
import {
  agentScript,
  coverageAnswer,
  explainPattern,
  getScriptQuestion,
  openingLine,
  matchQuestion,
  refusalForElement,
} from "@/lib/studio/agent";
import {
  antiPatternsForElement,
  displayNumber,
  elementsForPattern,
  situations,
  visibleSituations,
} from "@/lib/studio/content";
import { acceptRemoval, restoreElement } from "@/lib/studio/pushback";
import { sampleScenario } from "@/lib/studio/content";
import type {
  AgentEffect,
  Decision,
  PatternElement,
  Scenario,
  ThreadMessage,
} from "@/lib/studio/types";
import "./studio.css";

type Draft = Record<string, Record<string, unknown>>;

/** Key order must not make an unchanged workspace look edited. */
function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, inner) =>
    inner && typeof inner === "object" && !Array.isArray(inner)
      ? Object.fromEntries(
          Object.entries(inner as Record<string, unknown>).sort(([a], [b]) =>
            a.localeCompare(b),
          ),
        )
      : inner,
  );
}

function labelForElement(situationId: string, elementId: string): string {
  const patternId =
    situations.find((candidate) => candidate.id === situationId)?.patternIds[0] ??
    "";
  return (
    elementsForPattern(patternId).find((element) => element.id === elementId)
      ?.label ?? elementId
  );
}

function decisionFor(situationId: string): Decision {
  const situation = situations.find((candidate) => candidate.id === situationId);
  const patternId = situation?.patternIds[0] ?? "";
  return {
    situationId,
    patternId,
    elementsPresent: elementsForPattern(patternId).map((element) => element.id),
    elementsRemoved: [],
    state: "answered",
  };
}

export function StudioApp({ scenarioId }: { scenarioId?: string }) {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [view, setView] = useState<CanvasView>({ kind: "overview" });
  const [navOpen, setNavOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft>({});
  const nextId = useRef(0);
  const saveTimers = useRef<Record<string, number>>({});
  /**
   * Read inside openSituation without making the callback change on every
   * write. The explanation has to be posted outside a state updater: React
   * calls an updater more than once in development, and a queued message in
   * there lands in the thread twice.
   */
  const scenarioRef = useRef<Scenario | null>(null);
  scenarioRef.current = scenario;
  const viewRef = useRef<CanvasView>({ kind: "overview" });
  viewRef.current = view;
  /**
   * Whether the scenario store answers. It does not on the static export,
   * which has no route handlers, and one failed write is enough to stop
   * asking: the scenario is then held here for the rest of the session.
   */
  const storeReachable = useRef(true);

  const newId = useCallback(() => {
    nextId.current += 1;
    return `m${nextId.current}`;
  }, []);

  /* ---------------------------------------------------------------- load */

  useEffect(() => {
    if (!scenarioId) return;
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/studio/scenarios?id=${encodeURIComponent(scenarioId as string)}`,
        );
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setLoadError(data.error ?? "Could not load that scenario.");
          return;
        }
        setScenario(data.scenario as Scenario);
        setDrafts((data.scenario as Scenario).workspaces ?? {});
      } catch {
        if (!cancelled) setLoadError("Could not reach the scenario store.");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  useEffect(() => {
    if (scenario && thread.length === 0) {
      setThread([
        {
          id: "opening",
          from: "agent",
          kind: "answer",
          text: openingLine(),
        },
      ]);
    }
  }, [scenario, thread.length]);

  /* ---------------------------------------------------------------- write */

  const patchScenario = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!scenario || scenario.readOnly) return;
      // On a static host there is no store, and every edit would otherwise
      // fire a request that fails. One is enough to learn that.
      if (!storeReachable.current) return;
      try {
        const response = await fetch("/api/studio/scenarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", id: scenario.id, updates }),
        });
        if (!response.ok) {
          storeReachable.current = false;
          return;
        }
        const data = await response.json();
        setScenario(data.scenario as Scenario);
      } catch {
        // The store is in memory and resets with the dev server. A failed
        // write leaves the local state alone rather than reverting the
        // person's work under them.
        storeReachable.current = false;
      }
    },
    [scenario],
  );

  /** deepMerge replaces arrays wholesale, so decisions go over as a full array. */
  const upsertDecision = useCallback(
    (situationId: string, change: (decision: Decision) => Decision) => {
      setScenario((current) => {
        if (!current) return current;
        const existing = current.decisions.find(
          (candidate) => candidate.situationId === situationId,
        );
        const next = change(existing ?? decisionFor(situationId));
        const decisions = existing
          ? current.decisions.map((candidate) =>
              candidate.situationId === situationId ? next : candidate,
            )
          : [...current.decisions, next];
        void patchScenario({ decisions });
        return { ...current, decisions };
      });
    },
    [patchScenario],
  );

  /* ------------------------------------------------------------- the agent */

  const say = useCallback((messages: ThreadMessage[]) => {
    setThread((current) => [...current, ...messages]);
  }, []);

  /**
   * Opening a situation is the agent recommending a pattern for it, so it says
   * why in the thread rather than leaving the canvas to speak for itself. The
   * reasoning is assembled from library fields with a citation, and it says
   * outright that the match itself is seeded rather than researched.
   */
  const openSituation = useCallback(
    (situationId: string) => {
      const current = viewRef.current;
      const alreadyOpen =
        current.kind === "pattern" && current.situationId === situationId;

      setView({ kind: "pattern", situationId });
      setNavOpen(false);
      if (alreadyOpen) return;

      const situation = visibleSituations.find(
        (candidate) => candidate.id === situationId,
      );
      const pattern = situation
        ? getPattern(situation.patternIds[0] ?? "")
        : undefined;
      const openScenario = scenarioRef.current;
      if (!situation || !pattern || !openScenario) return;

      const explanation = explainPattern({
        situation,
        pattern,
        shapeability: shapeabilityOfSituation(situation),
        tensions: activeTensionsFor(situation, openScenario),
      });

      say([{ id: newId(), from: "agent", kind: "explanation", explanation }]);
    },
    [newId, say],
  );

  const answerFor = useCallback((questionId: string): ThreadMessage => {
    const question = getScriptQuestion(questionId);
    if (!question) {
      return {
        id: newId(),
        from: "agent",
        kind: "answer",
        text: agentScript.fallback,
      };
    }

    if (question.recommendation || question.refusal) {
      return {
        id: newId(),
        from: "agent",
        kind: question.refusal ? "refusal" : "recommendation",
        questionId: question.id,
        proposal: (question.refusal ?? question.recommendation)!,
      };
    }

    const text =
      question.computed === "coverage"
        ? coverageAnswer(visibleSituations, shapeabilityOfSituation)
        : (question.answer ?? agentScript.fallback);

    return {
      id: newId(),
      from: "agent",
      kind: "answer",
      text,
      cites: question.cites,
      opens: question.opens,
    };
  }, [newId]);

  const ask = useCallback(
    (questionId: string) => {
      const question = getScriptQuestion(questionId);
      if (!question || askedIds.includes(questionId)) return;
      setAskedIds((current) => [...current, questionId]);
      say([
        { id: newId(), from: "person", text: question.question },
        answerFor(questionId),
      ]);
      if (question.scope !== "*") openSituation(question.scope);
    },
    [answerFor, askedIds, newId, openSituation, say],
  );

  const send = useCallback(
    (text: string) => {
      const hit = matchQuestion(text, askedIds);
      if (!hit) {
        say([
          { id: newId(), from: "person", text },
          {
            id: newId(),
            from: "agent",
            kind: "answer",
            text: agentScript.fallback,
          },
        ]);
        return;
      }
      setAskedIds((current) => [...current, hit.id]);
      say([{ id: newId(), from: "person", text }, answerFor(hit.id)]);
      if (hit.scope !== "*") openSituation(hit.scope);
    },
    [answerFor, askedIds, newId, openSituation, say],
  );

  /** Nothing here runs until the person picks an option. */
  const choose = useCallback(
    (messageId: string, index: number, reason?: string) => {
      const message = thread.find((candidate) => candidate.id === messageId);
      if (
        !message ||
        message.from !== "agent" ||
        (message.kind !== "recommendation" && message.kind !== "refusal") ||
        message.taken !== undefined
      ) {
        return;
      }

      const option = message.proposal.options[index];
      if (!option) return;

      setThread((current) =>
        current.map((candidate) =>
          candidate.id === messageId &&
          candidate.from === "agent" &&
          (candidate.kind === "recommendation" || candidate.kind === "refusal")
            ? { ...candidate, taken: index }
            : candidate,
        ),
      );

      const question = getScriptQuestion(message.questionId);
      const scopedSituationId =
        question && question.scope !== "*" ? question.scope : null;
      const effect: AgentEffect = option.applies ?? { kind: "note" };
      let confirmation = `${option.label}. Noted, nothing changed on the canvas.`;

      if (effect.kind === "open") {
        const target = situations.find(
          (candidate) => candidate.id === effect.situationId,
        );
        openSituation(effect.situationId);
        confirmation = target
          ? `Opened situation ${displayNumber(target)}, ${target.title}. Nothing else changed.`
          : confirmation;
      }

      if (effect.kind === "recordDecision" && scopedSituationId) {
        upsertDecision(scopedSituationId, (decision) => ({
          ...decision,
          reasoning: effect.note,
          state: decision.elementsRemoved.length > 0 ? "answered_with_gap" : "answered",
        }));
        confirmation = `${effect.note} It is on the record.`;
      }

      if (effect.kind === "acceptGap" && scopedSituationId) {
        upsertDecision(scopedSituationId, (decision) =>
          acceptRemoval(decision, effect.elementId, effect.reason),
        );
        confirmation = `Recorded as an accepted gap: ${labelForElement(scopedSituationId, effect.elementId)}. The situation now reads as answered with a gap, and the reason is on the record.`;
      }

      // The reason came from the person, not from a script.
      if (effect.kind === "acceptGapWithReason" && reason) {
        upsertDecision(effect.situationId, (decision) =>
          acceptRemoval(decision, effect.elementId, reason),
        );
        confirmation = `Recorded as an accepted gap: ${labelForElement(effect.situationId, effect.elementId)}. Your reason is on the record, and the situation reads as answered with a gap.`;
      }

      say([
        { id: newId(), from: "agent", kind: "confirmation", text: confirmation },
      ]);
    },
    [newId, openSituation, say, thread, upsertDecision],
  );

  /* ------------------------------------------------------- canvas editing */

  const onDraftChange = useCallback(
    (situationId: string, next: Record<string, unknown>) => {
      setDrafts((current) => ({ ...current, [situationId]: next }));

      // A draft that already matches what is stored is not a change, and
      // saving it would come back as a new scenario object and start the
      // round trip again.
      const stored = scenario?.workspaces?.[situationId] ?? {};
      if (stableJson(stored) === stableJson(next)) return;

      window.clearTimeout(saveTimers.current[situationId]);
      saveTimers.current[situationId] = window.setTimeout(() => {
        void patchScenario({ workspaces: { [situationId]: next } });
      }, 800);
    },
    [patchScenario, scenario],
  );

  const onSave = useCallback(
    async (situationId: string, next: Record<string, unknown>) => {
      setDrafts((current) => ({ ...current, [situationId]: next }));
      await patchScenario({ workspaces: { [situationId]: next } });
    },
    [patchScenario],
  );

  const onRemoveElement = useCallback(
    (situationId: string, element: PatternElement) => {
      // Removing a required element is never silent, and never a scripted
      // answer about some other element: the refusal is built from the record
      // of the element that was clicked.
      if (element.required) {
        say([
          {
            id: newId(),
            from: "person",
            text: `We do not have "${element.label}".`,
          },
          {
            id: newId(),
            from: "agent",
            kind: "refusal",
            questionId: `element:${element.id}`,
            proposal: refusalForElement(
              element,
              situationId,
              antiPatternsForElement(element.id),
            ),
          },
        ]);
        return;
      }

      upsertDecision(situationId, (decision) =>
        acceptRemoval(
          decision,
          element.id,
          "Optional element, left out. No reason required.",
        ),
      );
    },
    [newId, say, upsertDecision],
  );

  const onRestoreElement = useCallback(
    (situationId: string, element: PatternElement) => {
      upsertDecision(situationId, (decision) =>
        restoreElement(decision, element.id),
      );
    },
    [upsertDecision],
  );

  /* ---------------------------------------------------------------- setup */

  /**
   * Creates the scenario on the server where there is one, and in the browser
   * where there is not.
   *
   * The static export served to reviewers has no API routes at all, so the
   * POST cannot succeed there. Falling back to a scenario held in this
   * component loses nothing that was being kept: the server store is itself an
   * in-memory Map that empties on restart. What it costs is the URL, so a
   * reload starts again from the setup card.
   */
  async function createScenario(input: {
    name: string;
    description: string;
    topology: string;
    attendance: string;
    irreversibility: string;
  }) {
    try {
      const response = await fetch("/api/studio/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...input }),
      });
      if (response.ok) {
        const data = await response.json();
        router.push(`/studio/${data.scenario.id}`);
        return;
      }
    } catch {
      // No API here. Carry on in the browser.
    }

    storeReachable.current = false;
    const now = new Date().toISOString();
    setScenario({
      id: `local-${Date.now()}`,
      name: input.name,
      description: input.description,
      topology: input.topology as Scenario["topology"],
      attendance: input.attendance as Scenario["attendance"],
      irreversibility: input.irreversibility as Scenario["irreversibility"],
      decisions: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  /** The seeded example, opened in place rather than by its id. */
  function openSample() {
    if (!sampleScenario) return;
    // Read-only, so nothing here writes to the store either way.
    setScenario({ ...sampleScenario, isSample: true, readOnly: true });
    setDrafts(sampleScenario.workspaces ?? {});
  }

  const answeredCount = scenario?.decisions.length ?? 0;
  const openSituationId = view.kind === "pattern" ? view.situationId : null;

  const workspaces = useMemo(() => drafts, [drafts]);

  // The setup card shows until there is a scenario, whether it came from the
  // store or was made here.
  if (!scenarioId && !scenario) {
    return <SetupCard onSubmit={createScenario} onOpenSample={openSample} />;
  }

  if (loadError) {
    return (
      <div className="studio-loading">
        <p>{loadError}</p>
        <p className="studio-muted">
          Scenarios are held in memory and reset when the dev server restarts,
          which is the same limitation the pattern instances have.
        </p>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="studio-loading">
        <p>Loading the scenario…</p>
      </div>
    );
  }

  return (
    <div className="studio-shell">
      <AgentPane
        scenario={scenario}
        thread={thread}
        askedIds={askedIds}
        openSituationId={openSituationId}
        onAsk={ask}
        onSend={send}
        onChoose={choose}
        onOpen={openSituation}
        onEditScenario={(patch) => {
          setScenario((current) => (current ? { ...current, ...patch } : current));
          void patchScenario(patch as Record<string, unknown>);
        }}
      />

      <StudioCanvas
        scenario={scenario}
        view={view}
        navOpen={navOpen}
        workspaces={workspaces}
        onGo={(next) => {
          if (next.kind === "pattern") {
            openSituation(next.situationId);
            return;
          }
          setView(next);
          setNavOpen(false);
        }}
        onToggleNav={() => setNavOpen((open) => !open)}
        onDraftChange={onDraftChange}
        onSave={onSave}
        onRemoveElement={onRemoveElement}
        onRestoreElement={onRestoreElement}
      />

      <button
        type="button"
        className="studio-recordbtn"
        onClick={() => setView({ kind: "record" })}
      >
        Record {answeredCount}/{visibleSituations.length}
      </button>
    </div>
  );
}
