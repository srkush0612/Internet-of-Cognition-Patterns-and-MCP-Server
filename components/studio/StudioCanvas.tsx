"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  BackingSignal,
  CategoryLabel,
  HeroOrbs,
} from "@/components/PatternTaxonomy";
import {
  PATTERN_INBOX,
  PATTERN_INBOX_LIVE,
} from "@/components/patterns/pattern-registry";
import {
  CarryNote,
  MakeItYoursPanel,
  RemovalNotes,
} from "@/components/studio/MakeItYours";
import { PatternEmbed } from "@/components/studio/PatternEmbed";
import {
  getPattern,
  PATTERN_CATEGORY_COLOR,
  type Pattern,
} from "@/lib/patterns";
import { isPatternReady } from "@/lib/pattern-ready";
import { resolveLivePreview } from "@/lib/pattern-live-preview";
import {
  answersFragment,
  displayNumber,
  elementsForPattern,
  entities,
  patternElements,
  notHereReason,
  situations,
  surfaceDefinitions,
  surfaceState,
  surfacesForPattern,
  visibleSituations,
} from "@/lib/studio/content";
import { findContinuityGaps } from "@/lib/studio/continuity";
import { whyThisPattern } from "@/lib/studio/agent";
import { shapeabilityOf } from "@/lib/studio/shapeability";
import type { CSSProperties } from "react";
import type {
  Decision,
  PatternElement,
  Scenario,
  Shapeability,
  Situation,
  SituationState,
  SituationTension,
  StudioSurface,
} from "@/lib/studio/types";

export type CanvasView =
  | { kind: "overview" }
  | { kind: "pattern"; situationId: string }
  | { kind: "record" };

export function situationState(
  situation: Situation,
  scenario: Scenario,
): SituationState {
  const decision = scenario.decisions.find(
    (candidate) => candidate.situationId === situation.id,
  );
  if (!decision) return "unanswered";
  return decision.state;
}

export function shapeabilityOfSituation(situation: Situation): Shapeability {
  const patternId = situation.patternIds[0];
  if (!patternId) return "matched_only";
  // The host component is what the canvas renders now, so that is what decides
  // whether there is anything here to shape.
  return shapeabilityOf(patternId, Boolean(PATTERN_INBOX[patternId]));
}

/** Only the tensions whose condition this scenario actually meets. */
export function activeTensionsFor(
  situation: Situation,
  scenario: Scenario,
): SituationTension[] {
  return (situation.tensions ?? []).filter((tension) => {
    if (
      tension.attendances &&
      !tension.attendances.includes(scenario.attendance)
    ) {
      return false;
    }
    if (
      tension.irreversibilities &&
      !tension.irreversibilities.includes(scenario.irreversibility)
    ) {
      return false;
    }
    if (tension.topologies && !tension.topologies.includes(scenario.topology)) {
      return false;
    }
    return true;
  });
}

/**
 * Progress and risk deliberately do not share a colour. The three progress
 * states run grey to green and differ in form as well as hue, so a gap is
 * still legible in grayscale; amber belongs to risk and to missing content,
 * and never to progress.
 */
function StateDot({ state }: { state: SituationState }) {
  return <span className="studio-dot" data-state={state} aria-hidden />;
}

function stateLabel(state: SituationState): string | null {
  if (state === "answered") return "answered";
  if (state === "answered_with_gap") return "answered, with a gap";
  return null;
}

function Bar({
  scenario,
  view,
  eyebrow,
  title,
  meta,
  controls,
  onGo,
}: {
  scenario: Scenario;
  view: CanvasView;
  eyebrow: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  controls?: React.ReactNode;
  onGo: (view: CanvasView) => void;
}) {
  const answered = scenario.decisions.length;

  const stepper = view.kind === "pattern";
  const index = stepper
    ? visibleSituations.findIndex((s) => s.id === view.situationId)
    : -1;

  function step(delta: number) {
    const next =
      visibleSituations[
        (index + delta + visibleSituations.length) % visibleSituations.length
      ];
    onGo({ kind: "pattern", situationId: next.id });
  }

  return (
    <header className="studio-bar osh-hero">
      <HeroOrbs />
      <div className="studio-bar__title">
        {/* Going back sits where the trail is, on the left, rather than as a
            control on the right next to the ones that act on this situation. */}
        <p className="studio-bar__trail">
          {view.kind === "overview" ? (
            <span className="studio-bar__here">{scenario.name}</span>
          ) : (
            <>
              <button
                type="button"
                className="studio-back"
                onClick={() => onGo({ kind: "overview" })}
              >
                <ArrowLeft aria-hidden />
                Overview
              </button>
              <span className="studio-bar__sep" aria-hidden>
                /
              </span>
              <span className="studio-bar__here">{eyebrow}</span>
            </>
          )}
        </p>
        {title}
        {meta ? <div className="studio-bar__meta">{meta}</div> : null}
      </div>

      <div className="studio-bar__ctrls">
        {controls}
        <div className="studio-steps">
          <button
            type="button"
            className="studio-nb studio-nb--sq"
            disabled={!stepper}
            aria-label="Previous situation"
            onClick={() => step(-1)}
          >
            <ChevronLeft aria-hidden />
          </button>
          <button
            type="button"
            className="studio-nb studio-nb--sq"
            disabled={!stepper}
            aria-label="Next situation"
            onClick={() => step(1)}
          >
            <ChevronRight aria-hidden />
          </button>
        </div>
        <span className="studio-count">
          {answered} of {visibleSituations.length}
        </span>
      </div>
    </header>
  );
}

/**
 * One situation, as a full-width row.
 *
 * Identical surface on every row: one subtle blue wash, no per-row colour, so
 * nothing looks like a signal that is not one. Status is a chip. Nothing
 * truncates; a row is as tall as its content.
 */
function SituationRow({
  situation,
  scenario,
  onOpen,
}: {
  situation: Situation;
  scenario: Scenario;
  onOpen: (situationId: string) => void;
}) {
  const pattern = getPattern(situation.patternIds[0] ?? "");
  const state = situationState(situation, scenario);
  const detailComing = shapeabilityOfSituation(situation) === "matched_only";
  const why = pattern ? whyThisPattern(situation, pattern) : null;

  return (
    <button
      type="button"
      className="studio-row"
      onClick={() => onOpen(situation.id)}
    >
      <span className="studio-row__head">
        <span className="studio-row__label">
          Situation {displayNumber(situation)}
        </span>
        <span className="studio-row__title">{situation.title}</span>
        <span className="studio-row__chips">
          {stateLabel(state) ? (
            <span className="studio-chipmark">{stateLabel(state)}</span>
          ) : null}
          {detailComing ? (
            <span className="studio-chipmark">detail coming</span>
          ) : null}
        </span>
      </span>

      {/* The fuller account of what happens, from the situation's own
          `example`. The `moment` field leads with a clock time, which is not
          what someone reading the list needs. */}
      <span className="studio-row__what">{situation.example}</span>

      <span className="studio-row__foot">
        <span className="studio-row__pattern">
          <span className="studio-row__patternlabel">Pattern</span>
          <span className="studio-row__patternname">
            {pattern ? pattern.title : "No pattern matched"}
          </span>
        </span>

        {/* The question, then the answer. The answer is the library's own
            statement of the problem the pattern solves, or, where the library
            has not written one, a line saying exactly that. Nothing here
            composes a rationale. */}
        <span className="studio-row__why">
          <span className="studio-row__question">
            {pattern
              ? `Why ${pattern.title} for this situation?`
              : "Why is nothing matched to this situation?"}
          </span>
          <span
            className="studio-row__reason"
            data-unsourced={why ? why.source === "none" : true}
          >
            {why
              ? why.text
              : "No pattern in the library has been mapped to it yet."}
          </span>
          <span className="studio-row__answers">
            What shaping it answers: {answersFragment(situation)}
          </span>
        </span>
      </span>
    </button>
  );
}

function Overview({
  scenario,
  onOpen,
}: {
  scenario: Scenario;
  onOpen: (situationId: string) => void;
}) {
  return (
    <div className="studio-overview">
      <p className="studio-overview__lede">
        Situations this system could run into, and the pattern that answers each
        one. They are candidates to check rather than a forecast.
      </p>

      <div className="studio-rows">
        {visibleSituations.map((situation) => (
          <SituationRow
            key={situation.id}
            situation={situation}
            scenario={scenario}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

function Record({ scenario }: { scenario: Scenario }) {
  const gaps = findContinuityGaps(
    entities,
    patternElements,
    scenario.decisions,
  );
  const open = visibleSituations.filter(
    (situation) => situationState(situation, scenario) === "unanswered",
  );

  return (
    <div className="studio-record">
      <section className="osh-group">
        <div
          className="osh-group-head"
          style={{ "--c": "var(--color-success)" } as CSSProperties}
        >
          <h2>Decided</h2>
          <span className="n">{scenario.decisions.length}</span>
        </div>
        {scenario.decisions.length === 0 ? (
          <p className="studio-muted">
            Nothing decided yet. Every decision here arrives from an option you
            picked, so this stays empty until you pick one.
          </p>
        ) : (
          scenario.decisions.map((decision) => {
            const situation = situations.find(
              (candidate) => candidate.id === decision.situationId,
            );
            const pattern = getPattern(decision.patternId);
            return (
              <article key={decision.situationId} className="studio-rrow">
                <b>
                  {situation ? displayNumber(situation) : ""} {situation?.title}
                </b>
                <p>{pattern?.title}</p>
                {decision.reasoning ? (
                  <p className="studio-rrow__why">{decision.reasoning}</p>
                ) : null}
                {Object.entries(decision.removedElementReasons ?? {}).map(
                  ([elementId, reason]) => {
                    const element = patternElements.find(
                      (candidate) => candidate.id === elementId,
                    );
                    return (
                      <p key={elementId} className="studio-rrow__gap">
                        <b>Gap accepted:</b> {element?.label ?? elementId}.{" "}
                        {reason}
                      </p>
                    );
                  },
                )}
              </article>
            );
          })
        )}
      </section>

      <section className="osh-group">
        <div
          className="osh-group-head"
          style={{ "--c": "var(--color-warning)" } as CSSProperties}
        >
          <h2>Does not carry across</h2>
          <span className="n">{gaps.length}</span>
        </div>
        {gaps.length === 0 ? (
          <p className="studio-muted">
            Nothing to check yet. This fills in once a situation whose elements
            carry something is answered.
          </p>
        ) : (
          gaps.map((gap) => {
            const entity = entities.find(
              (candidate) => candidate.id === gap.entityId,
            );
            const target = situations.find(
              (candidate) => candidate.id === gap.targetSituationId,
            );
            const source = situations.find(
              (candidate) => candidate.id === gap.sourceSituationId,
            );
            return (
              <article
                key={`${gap.entityId}-${gap.targetSituationId}`}
                className="studio-rrow"
              >
                <b>
                  {entity?.label} does not reach situation{" "}
                  {target ? displayNumber(target) : ""}{" "}
                  {target?.title}
                </b>
                <p>
                  {gap.kind === "not_designed"
                    ? `Written in situation ${source ? displayNumber(source) : ""}. Situation ${target ? displayNumber(target) : ""} has not been answered yet, so there is nothing for it to arrive in.`
                    : `Written in situation ${source ? displayNumber(source) : ""}. Situation ${target ? displayNumber(target) : ""} is answered, but none of its elements carry it, so it silently does not survive there.`}
                </p>
              </article>
            );
          })
        )}
      </section>

      <section className="osh-group">
        <div
          className="osh-group-head"
          style={{ "--c": "var(--color-border-medium)" } as CSSProperties}
        >
          <h2>Still open</h2>
          <span className="n">{open.length}</span>
        </div>
        {open.length === 0 ? (
          <p className="studio-muted">Every situation has been answered.</p>
        ) : (
          <ul className="studio-open">
            {open.map((situation) => (
              <li key={situation.id}>
                <b>
                  Situation {displayNumber(situation)}. {situation.title}
                </b>
                {/* Labelled, never run into a sentence: the fragments are not
                    one grammatical shape and any stem breaks most of them. */}
                <span>Has to answer: {answersFragment(situation)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/**
 * Where a pattern could show up, as a strip of surfaces above it.
 *
 * Every pattern has one host surface built today, and the other two say which
 * kind of absence they are: nothing built yet, or a decision that the pattern
 * does not belong there. The two read differently on purpose, because one is
 * a gap in the work and the other is a finding.
 */
function SurfaceStrip({
  patternId,
  current,
  hasInContext,
  onPick,
}: {
  patternId: string;
  current: StudioSurface;
  hasInContext: boolean;
  onPick: (surface: StudioSurface) => void;
}) {
  return (
    <div className="studio-surfaces" role="tablist" aria-label="Where it shows up">
      {surfaceDefinitions.map((surface) => {
        const state = surfaceState(patternId, surface.id, hasInContext);
        const reason = notHereReason(patternId, surface.id);
        return (
          <button
            key={surface.id}
            type="button"
            role="tab"
            className="studio-surface"
            aria-selected={current === surface.id}
            data-state={state}
            disabled={state !== "built"}
            title={reason ?? surface.blurb}
            onClick={() => onPick(surface.id)}
          >
            {surface.label}
          </button>
        );
      })}
    </div>
  );
}

function PatternBody({
  pattern,
  shapeability,
  draft,
  persisted,
  decision,
  customising,
  onOpenCustomise,
  onCloseCustomise,
  onDraftChange,
  onSave,
  onRemoveElement,
  onRestoreElement,
}: {
  pattern: Pattern;
  shapeability: Shapeability;
  /** What is being typed right now. Drives the component on the stage. */
  draft: Record<string, unknown>;
  /** What has been saved. Drives the editor's own state. */
  persisted: Record<string, unknown>;
  decision: Decision | undefined;
  customising: boolean;
  onOpenCustomise: () => void;
  onCloseCustomise: () => void;
  onDraftChange: (next: Record<string, unknown>) => void;
  onSave: (next: Record<string, unknown>) => Promise<void>;
  onRemoveElement: (element: PatternElement) => void;
  onRestoreElement: (element: PatternElement) => void;
}) {
  const InContext = PATTERN_INBOX[pattern.slug];
  const elements = elementsForPattern(pattern.slug);
  const removed = decision?.elementsRemoved ?? [];

  // Opens on the surface the pattern has a component for. There is no bare
  // view to fall back to, so a pattern with no in-context component has
  // nowhere to be shown, and says so.
  const inContextSurface = surfacesForPattern(pattern.slug)?.inContextSurface;
  const [surface, setSurface] = useState<StudioSurface>(
    inContextSurface ?? "thread",
  );

  // The three in-context variants that take no props render fixed content, so
  // an edit cannot reach them. Saying so beats an editor that looks connected.
  const surfaceTakesEdits = PATTERN_INBOX_LIVE.has(pattern.slug);

  // Nothing to shape is not the same as nothing to show. A pattern with no
  // element detail still has a reference design and still has somewhere it
  // shows up, and seeing that is most of what this view is for.
  const nothingToShape = shapeability === "matched_only";

  if (!InContext) {
    return (
      <div className="studio-stage">
        <div className="studio-empty">
          <b>The match stands. The detail does not.</b>
          <p>
            {pattern.title} is in the library with its write-up and its
            evidence, and it is the answer to this situation. What it does not
            have is a component showing it inside a host, so there is nowhere
            here to put it.
          </p>
          <p>
            What the library does say about it is worth reading before you build
            anything here.
          </p>
          <Link
            href={`/patterns/${pattern.slug}`}
            className="osh-cta-outline studio-empty__link"
          >
            Read {pattern.title}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="studio-stage">
        {/* The control that opens the shaping panel belongs with the thing it
            shapes, not up in the bar with identity and navigation. */}
        <SurfaceStrip
          patternId={pattern.slug}
          current={surface}
          hasInContext={Boolean(InContext)}
          onPick={setSurface}
        />

        {customising ? null : (
          <div className="studio-stage__top">
            <p>
              {nothingToShape
                ? "This is where it shows up. No element detail has been published for it, so there is nothing to fill in yet."
                : shapeability === "annotated"
                  ? "The elements this pattern requires are numbered on it."
                  : surfaceTakesEdits
                    ? "Fill in your own case and this updates as you type."
                    : "This host renders fixed content, so what you fill in is kept on the record but does not change what you see here."}
            </p>
            {nothingToShape ? (
              <Link
                href={`/patterns/${pattern.slug}`}
                className="osh-cta-outline studio-customise"
              >
                Read {pattern.title}
              </Link>
            ) : (
              <button
                type="button"
                className="osh-cta-solid studio-customise"
                aria-expanded={false}
                aria-controls="studio-make-it-yours"
                onClick={onOpenCustomise}
              >
                <SlidersHorizontal aria-hidden />
                Customise
              </button>
            )}
          </div>
        )}

        {/* Framed the way a gallery card is framed, in the pattern's own
            category colour. The component inside is untouched: the frame is a
            wrapper, never padding on the annotated embed, whose overlay is
            measured against the component's own box. */}
        <div
          className="studio-frame"
          style={
            { "--c": PATTERN_CATEGORY_COLOR[pattern.category] } as CSSProperties
          }
        >
          {/* The annotated overlay goes over the host component now that there
              is no bare view. Its markers are found by matching the text each
              element authored, which the host renders the same way. */}
          {shapeability === "annotated" ? (
            <PatternEmbed
              Component={InContext}
              elements={elements}
              removedElementIds={removed}
            />
          ) : (
            <InContext
              live={resolveLivePreview(pattern.slug, { workspace: draft })}
            />
          )}
        </div>

        <RemovalNotes decision={decision} />
        <CarryNote patternId={pattern.slug} />
      </div>

      {customising && !nothingToShape ? (
        <MakeItYoursPanel
          pattern={pattern}
          shapeability={shapeability as "editable" | "annotated"}
          persisted={persisted}
          decision={decision}
          onClose={onCloseCustomise}
          onDraftChange={onDraftChange}
          onSave={onSave}
          onRemoveElement={onRemoveElement}
          onRestoreElement={onRestoreElement}
        />
      ) : null}
    </>
  );
}

export function StudioCanvas({
  scenario,
  view,
  navOpen,
  workspaces,
  onGo,
  onToggleNav,
  onDraftChange,
  onSave,
  onRemoveElement,
  onRestoreElement,
}: {
  scenario: Scenario;
  view: CanvasView;
  navOpen: boolean;
  workspaces: Record<string, Record<string, unknown>>;
  onGo: (view: CanvasView) => void;
  onToggleNav: () => void;
  onDraftChange: (situationId: string, next: Record<string, unknown>) => void;
  onSave: (situationId: string, next: Record<string, unknown>) => Promise<void>;
  onRemoveElement: (situationId: string, element: PatternElement) => void;
  onRestoreElement: (situationId: string, element: PatternElement) => void;
}) {
  // Customise opens the shaping panel. It starts closed so the first thing on
  // the canvas is the pattern itself, and it closes again when the canvas
  // moves to another situation.
  const [customising, setCustomising] = useState(false);
  const openSituationId = view.kind === "pattern" ? view.situationId : null;

  useEffect(() => {
    setCustomising(false);
  }, [openSituationId]);

  if (view.kind === "overview") {
    return (
      <div className="studio-canvas">
        <Bar
          scenario={scenario}
          view={view}
          eyebrow={scenario.name}
          title={
            <h2>
              {visibleSituations.length} situations, each matched to a pattern
            </h2>
          }
          onGo={onGo}
        />
        <div className="studio-canvas__body">
          <Overview
            scenario={scenario}
            onOpen={(situationId) => onGo({ kind: "pattern", situationId })}
          />
        </div>
      </div>
    );
  }

  if (view.kind === "record") {
    return (
      <div className="studio-canvas">
        <Bar
          scenario={scenario}
          view={view}
          eyebrow="The record"
          title={<h2>The record</h2>}
          onGo={onGo}
        />
        <div className="studio-canvas__body">
          <Record scenario={scenario} />
        </div>
      </div>
    );
  }

  const situation = visibleSituations.find(
    (candidate) => candidate.id === view.situationId,
  );
  const pattern = situation ? getPattern(situation.patternIds[0] ?? "") : undefined;

  if (!situation || !pattern) {
    return (
      <div className="studio-canvas">
        <Bar
          scenario={scenario}
          view={view}
          eyebrow={scenario.name}
          title={<h2>Situation not found</h2>}
          onGo={onGo}
        />
        <div className="studio-canvas__body">
          <p className="studio-muted">
            That situation is either not in
            content/studio/situations.json, or it is one of the ones hidden
            while SHOW_NOT_READY_PATTERNS is off.
          </p>
        </div>
      </div>
    );
  }

  const shapeability = shapeabilityOfSituation(situation);
  const decision = scenario.decisions.find(
    (candidate) => candidate.situationId === situation.id,
  );
  const tensions = activeTensionsFor(situation, scenario);

  return (
    <div className="studio-canvas">
      <Bar
        scenario={scenario}
        view={view}
        eyebrow={`Situation ${displayNumber(situation)} · ${situation.title} · ${situation.moment}`}
        title={
          <button
            type="button"
            className="studio-switch"
            aria-expanded={navOpen}
            onClick={onToggleNav}
          >
            <h2>
              {pattern.title}
              <ChevronDown aria-hidden />
            </h2>
          </button>
        }
        meta={
          <>
            <CategoryLabel category={pattern.category} />
            <BackingSignal pattern={pattern} />
            <span
              className={`studio-flag${isPatternReady(pattern.slug) ? " studio-flag--ready" : ""}`}
              title="Readiness is the library's own flag for a vetted reference design. It is not the same as evidence strength, and not the same as whether a component exists."
            >
              {isPatternReady(pattern.slug)
                ? "ready in the library"
                : "not marked ready"}
            </span>
            {shapeability === "matched_only" ? (
              <span className="studio-flag studio-flag--warn">
                element detail not published
              </span>
            ) : null}
            {tensions.map((tension) => (
              <span
                key={tension.label}
                className="studio-flag studio-flag--warn"
                title={tension.cites}
              >
                {tension.label}
              </span>
            ))}
          </>
        }
        onGo={onGo}
      />

      {navOpen ? (
        <div className="studio-navdrop" role="listbox">
          {visibleSituations.map((candidate) => {
            const candidatePattern = getPattern(candidate.patternIds[0] ?? "");
            return (
              <button
                key={candidate.id}
                type="button"
                className="studio-navitem"
                aria-selected={candidate.id === situation.id}
                onClick={() => onGo({ kind: "pattern", situationId: candidate.id })}
              >
                <StateDot state={situationState(candidate, scenario)} />
                <span className="studio-navitem__title">
                  {displayNumber(candidate)}. {candidate.title}
                </span>
                <span className="studio-navitem__pattern">
                  {candidatePattern?.title ?? "No pattern matched"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="studio-canvas__body" data-side={customising}>
        <PatternBody
          pattern={pattern}
          shapeability={shapeability}
          draft={
            workspaces[situation.id] ??
            scenario.workspaces?.[situation.id] ??
            {}
          }
          persisted={scenario.workspaces?.[situation.id] ?? {}}
          decision={decision}
          customising={customising}
          onOpenCustomise={() => setCustomising(true)}
          onCloseCustomise={() => setCustomising(false)}
          onDraftChange={(next) => onDraftChange(situation.id, next)}
          onSave={(next) => onSave(situation.id, next)}
          onRemoveElement={(element) => onRemoveElement(situation.id, element)}
          onRestoreElement={(element) => onRestoreElement(situation.id, element)}
        />
      </div>
    </div>
  );
}
