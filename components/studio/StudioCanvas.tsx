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
import { PATTERN_STANDALONE } from "@/components/patterns/pattern-registry";
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
  elementsForPattern,
  entities,
  patternElements,
  situations,
  visibleSituations,
} from "@/lib/studio/content";
import { findContinuityGaps } from "@/lib/studio/continuity";
import { missingDetailReason, shapeabilityOf } from "@/lib/studio/shapeability";
import type { CSSProperties } from "react";
import type {
  Decision,
  PatternElement,
  Scenario,
  Shapeability,
  Situation,
  SituationState,
  SituationTension,
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
  return shapeabilityOf(patternId, Boolean(PATTERN_STANDALONE[patternId]));
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
 * A situation card.
 *
 * Every card is identical: same fields in the same order, one neutral surface,
 * no per-card tint. It used to take the tint from the pattern's category, which
 * meant one card was blue and the next purple for a reason the card no longer
 * showed anywhere. Status is carried in words, by the group it sits in and by
 * the chip in its footer.
 *
 * Nothing here truncates. The card grows to fit what it has to say, and hover
 * only lifts it, so no text appears or disappears under the pointer. The
 * surface is .osh-card, the site's own neutral card, rather than .osh-face,
 * whose crossfade and colour belong to a card that carries a taxonomy.
 */
function SituationCard({
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

  return (
    <button
      type="button"
      className="osh-card studio-card"
      onClick={() => onOpen(situation.id)}
    >
      <span className="studio-card__label">Situation {situation.number}</span>
      <h3 className="studio-card__title">{situation.title}</h3>
      <p className="studio-card__moment">{situation.moment}</p>

      <span className="studio-card__foot">
        <span className="studio-card__pattern">
          {pattern ? pattern.title : "No pattern matched"}
        </span>
        <span className="studio-card__chips">
          {state === "answered_with_gap" ? (
            <span className="studio-chipmark">with a gap</span>
          ) : null}
          {detailComing ? (
            <span className="studio-chipmark">detail coming</span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

/**
 * Grouped by how far the person has got, not by how far we have got.
 * Readiness was the old split, which made a fact about our own build queue
 * look like permanent structure and would leave a heading empty once every
 * pattern has its detail written. Progress stays meaningful either way.
 */
function Overview({
  scenario,
  onOpen,
}: {
  scenario: Scenario;
  onOpen: (situationId: string) => void;
}) {
  const groups = [
    {
      label: "Needs a decision",
      definition:
        "Nobody has chosen anything for these yet. They happen either way.",
      items: visibleSituations.filter(
        (situation) => situationState(situation, scenario) === "unanswered",
      ),
    },
    {
      label: "Decided",
      definition: null,
      items: visibleSituations.filter(
        (situation) => situationState(situation, scenario) !== "unanswered",
      ),
    },
  ];

  return (
    <>
      {groups.map((group) =>
        group.items.length === 0 ? null : (
          <section key={group.label} className="osh-group">
            <div className="osh-group-head studio-group-head">
              <h2>{group.label}</h2>
              <span className="n">{group.items.length}</span>
            </div>
            {group.definition ? (
              <p className="osh-group-def">{group.definition}</p>
            ) : null}

            <div className="osh-faces studio-cards">
              {group.items.map((situation) => (
                <SituationCard
                  key={situation.id}
                  situation={situation}
                  scenario={scenario}
                  onOpen={onOpen}
                />
              ))}
            </div>
          </section>
        ),
      )}
    </>
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
                  {situation?.number} {situation?.title}
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
                  {entity?.label} does not reach {target?.number}{" "}
                  {target?.title}
                </b>
                <p>
                  {gap.kind === "not_designed"
                    ? `Written in ${source?.number}. ${target?.number} has not been answered yet, so there is nothing for it to arrive in.`
                    : `Written in ${source?.number}. ${target?.number} is answered, but none of its elements carry it, so it silently does not survive there.`}
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
                  {situation.number} {situation.title}
                </b>{" "}
                {situation.answers}
              </li>
            ))}
          </ul>
        )}
      </section>
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
  const Component = PATTERN_STANDALONE[pattern.slug];
  const elements = elementsForPattern(pattern.slug);
  const removed = decision?.elementsRemoved ?? [];

  if (shapeability === "matched_only") {
    return (
      <div className="studio-stage">
        <div className="studio-empty">
          <b>The match stands. The detail does not.</b>
          <p>
            {pattern.title} is in the library with its write-up and its
            evidence, and it is the answer to this situation.{" "}
            {missingDetailReason(pattern.slug, Boolean(Component))}
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
        {customising ? null : (
          <div className="studio-stage__top">
            <p>
              {shapeability === "annotated"
                ? "The elements this pattern requires are numbered on it."
                : "Fill in your own case and this updates as you type."}
            </p>
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
          </div>
        )}

        {/* Framed the way a gallery card is framed, in the pattern's own
            category colour. The component inside is untouched: the frame is a
            wrapper, never padding on the annotated embed, whose overlay is
            measured against the component's own box. */}
        {Component ? (
          <div
            className="studio-frame"
            style={
              {
                "--c": PATTERN_CATEGORY_COLOR[pattern.category],
              } as CSSProperties
            }
          >
            {shapeability === "annotated" ? (
              <PatternEmbed
                Component={Component}
                elements={elements}
                removedElementIds={removed}
              />
            ) : (
              <Component
                live={resolveLivePreview(pattern.slug, { workspace: draft })}
              />
            )}
          </div>
        ) : null}

        <RemovalNotes decision={decision} />
        <CarryNote patternId={pattern.slug} />
      </div>

      {customising ? (
        <MakeItYoursPanel
          pattern={pattern}
          shapeability={shapeability}
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
        eyebrow={`${situation.number} ${situation.title} · ${situation.moment}`}
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
                  {candidate.number} {candidate.title}
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
