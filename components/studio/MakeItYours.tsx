"use client";

import { PatternWorkspace } from "@/components/PatternWorkspace";
import { antiPatternsForElement, elementsForPattern, entities } from "@/lib/studio/content";
import type { Decision, Entity, PatternElement } from "@/lib/studio/types";
import type { Pattern } from "@/lib/patterns";
import { useMemo } from "react";
import { X } from "lucide-react";

const RULE = "The pattern decides which elements exist. You decide what they say.";

/**
 * The editable path: the pattern has a workspace in lib/editable-fields.ts, so
 * Studio hands the same PatternWorkspace the playground and the pattern pages
 * use, embedded, and streams its draft into the component beside it through
 * resolveLivePreview. Nothing about the editing surface is Studio's own.
 */
function EditableBody({
  pattern,
  persisted,
  onDraftChange,
  onSave,
}: {
  pattern: Pattern;
  /**
   * What is stored, not what is being typed. Feeding the live draft back in
   * here would make WorkspaceShell sync from a prop it is itself driving, and
   * the two would push each other forever. The draft goes to the live
   * component instead, and comes back only once it has been saved.
   */
  persisted: Record<string, unknown>;
  onDraftChange: (next: Record<string, unknown>) => void;
  onSave: (next: Record<string, unknown>) => Promise<void>;
}) {
  // Content-stable identity, so a re-render with the same stored values does
  // not look like a new `state` to WorkspaceShell.
  const persistedKey = JSON.stringify(persisted);
  const state = useMemo(
    () => ({ workspace: JSON.parse(persistedKey) as Record<string, unknown> }),
    [persistedKey],
  );

  return (
    <div className="studio-mine__fields">
      <PatternWorkspace
        slug={pattern.slug}
        patternName={pattern.title}
        state={state}
        embedded
        onDraftChange={onDraftChange}
        onSaveState={async (updates) => {
          const next = (updates as { workspace?: Record<string, unknown> })
            .workspace;
          if (next) await onSave(next);
        }}
      />
    </div>
  );
}

/**
 * The annotated path: element detail is authored for this pattern, but its
 * reference design does not read live input, so the elements are marked onto
 * the component rather than typed into. Saying that plainly beats a form whose
 * edits go nowhere.
 */
function AnnotatedBody({
  elements,
  decision,
  onRemove,
  onRestore,
  carriedInto,
}: {
  elements: PatternElement[];
  decision: Decision | undefined;
  onRemove: (element: PatternElement) => void;
  onRestore: (element: PatternElement) => void;
  carriedInto: Array<{ entity: Entity; element: PatternElement }>;
}) {
  const removed = decision?.elementsRemoved ?? [];

  return (
    <>
      <p className="studio-mine__caveat">
        This pattern&apos;s reference design does not take live input yet, so
        these elements are numbered on the component rather than typed into it.
        What you can decide here is which of them your build actually has.
      </p>

      <ul className="studio-els">
        {elements.map((element) => {
          const isRemoved = removed.includes(element.id);
          const reason = decision?.removedElementReasons?.[element.id];
          const carried = carriedInto.find(
            (item) => item.element.id === element.id,
          );

          return (
            <li
              key={element.id}
              className={`studio-el${isRemoved ? " studio-el--removed" : ""}`}
            >
              <div className="studio-el__top">
                <span className="studio-el__num">{element.markerNumber}</span>
                <span className="studio-el__label">{element.label}</span>
                {element.required ? (
                  <span className="studio-flag">required</span>
                ) : (
                  <span className="studio-flag studio-flag--quiet">optional</span>
                )}
                {carried ? (
                  <span className="studio-flag studio-flag--live">
                    carries {carried.entity.label.toLowerCase()}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="studio-el__act"
                  onClick={() =>
                    isRemoved ? onRestore(element) : onRemove(element)
                  }
                >
                  {isRemoved ? "Put it back" : "We do not have this"}
                </button>
              </div>

              <p className="studio-el__hint">{element.hint}</p>
              {element.evidence ? (
                <p className="studio-el__evidence">{element.evidence}</p>
              ) : null}
              {isRemoved && reason ? (
                <p className="studio-el__reason">
                  <b>Accepted gap.</b> {reason}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**
 * The shaping panel. It opens beside the pattern rather than under it, so the
 * component stays in view while a field is edited and the change can be seen
 * as it is typed.
 */
export function MakeItYoursPanel({
  pattern,
  shapeability,
  persisted,
  decision,
  onClose,
  onDraftChange,
  onSave,
  onRemoveElement,
  onRestoreElement,
}: {
  pattern: Pattern;
  shapeability: "editable" | "annotated";
  persisted: Record<string, unknown>;
  decision: Decision | undefined;
  onClose: () => void;
  onDraftChange: (next: Record<string, unknown>) => void;
  onSave: (next: Record<string, unknown>) => Promise<void>;
  onRemoveElement: (element: PatternElement) => void;
  onRestoreElement: (element: PatternElement) => void;
}) {
  const elements = elementsForPattern(pattern.slug);

  const carriedInto = elements
    .filter((element) => element.entityId)
    .map((element) => ({
      element,
      entity: entities.find((candidate) => candidate.id === element.entityId),
    }))
    .filter(
      (item): item is { element: PatternElement; entity: Entity } =>
        item.entity !== undefined,
    );

  return (
    <aside
      className="studio-side"
      id="studio-make-it-yours"
      aria-label="Make it yours"
    >
      <div className="studio-side__head">
        <div>
          <b>Make it yours</b>
          <i>{RULE}</i>
        </div>
        <button
          type="button"
          className="studio-side__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X aria-hidden />
        </button>
      </div>

      {shapeability === "editable" ? (
        <span className="studio-flag studio-flag--live studio-side__note">
          edits show live on the left
        </span>
      ) : null}

      <div className="studio-side__body">
        {shapeability === "editable" ? (
          <EditableBody
            pattern={pattern}
            persisted={persisted}
            onDraftChange={onDraftChange}
            onSave={onSave}
          />
        ) : (
          <AnnotatedBody
            elements={elements}
            decision={decision}
            onRemove={onRemoveElement}
            onRestore={onRestoreElement}
            carriedInto={carriedInto}
          />
        )}
      </div>
    </aside>
  );
}

/** The named failure modes a removal brought back, shown under the component. */
export function RemovalNotes({
  decision,
}: {
  decision: Decision | undefined;
}) {
  const removed = decision?.elementsRemoved ?? [];
  const antiPatterns = removed.flatMap((id) => antiPatternsForElement(id));

  return (
    <>
      {antiPatterns.map((antiPattern) => (
        <aside key={antiPattern.id} className="studio-anti">
          <b>{antiPattern.name}</b>
          <p>{antiPattern.description}</p>
          <p className="studio-anti__src">
            {antiPattern.status === "proposed"
              ? `Proposed name, not library vocabulary. ${antiPattern.evidence}`
              : antiPattern.evidence}
          </p>
        </aside>
      ))}
    </>
  );
}

/** What this situation writes that other situations are declared to need. */
export function CarryNote({ patternId }: { patternId: string }) {
  const carried = elementsForPattern(patternId)
    .filter((element) => element.entityId)
    .map((element) => entities.find((c) => c.id === element.entityId))
    .filter((entity): entity is Entity => entity !== undefined);

  if (carried.length === 0) return null;

  return (
    <aside className="studio-carry">
      <b>Carried out of this situation</b>
      {carried.map((entity) => (
        <p key={entity.id}>
          {entity.label} is declared to matter again in{" "}
          {entity.appearsInSituationIds.length - 1} other situation
          {entity.appearsInSituationIds.length - 1 === 1 ? "" : "s"}. The record
          says whether it survives there.
        </p>
      ))}
    </aside>
  );
}
