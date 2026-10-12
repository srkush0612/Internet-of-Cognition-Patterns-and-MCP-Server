"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LevelDots,
  SlotKey,
  SpecSentence,
} from "@/components/v2/primitives";
import { patterns } from "@/lib/v2/catalog";
import {
  AUDIENCE_LABEL,
  CHANNEL_FACING,
  CHANNEL_LABEL,
  LEVEL_LABEL,
  LEVEL_LONG,
  LEVEL_ORDER,
  audiencesForLevel,
  channelsForLevel,
} from "@/lib/v2/levels";
import { MODE_FAMILY_LABEL, MODE_LABEL, MODE_ORDER, getMode } from "@/lib/v2/modes";
import {
  EMPTY_SPEC,
  SPEC_SLOT_ORDER,
  type SpecDraft,
  composeSpec,
  instantiate,
  matchingPatterns,
  reconcile,
  specFromPattern,
} from "@/lib/v2/spec";
import type { Audience, Channel, Interaction, Level, Mode } from "@/lib/v2/types";

/** Every trigger in the catalog, offered as suggestions rather than invented. */
const TRIGGER_SUGGESTIONS = Array.from(
  new Set(patterns.flatMap((pattern) => pattern.triggers)),
).sort();

export function SpecBuilder() {
  const [draft, setDraft] = useState<SpecDraft>(EMPTY_SPEC);
  const [startedFrom, setStartedFrom] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);

  const { missing, sentence } = composeSpec(draft);
  const mode = draft.mode ? getMode(draft.mode) : null;

  const matches = useMemo(() => {
    // Nothing is filled in yet, so every pattern "matches", which tells the
    // reader nothing. Show the list only once the sentence has a shape.
    if (!draft.mode && !draft.level && !draft.channel && !draft.audience) {
      return null;
    }
    return matchingPatterns(draft, patterns);
  }, [draft]);

  function update(patch: Partial<SpecDraft>, changed: Parameters<typeof reconcile>[1]) {
    setDraft((current) => reconcile({ ...current, ...patch }, changed));
    setPicked(null);
    setInteraction(null);
  }

  function loadPattern(id: string) {
    const pattern = patterns.find((entry) => entry.id === id);
    if (!pattern) return;
    setDraft(specFromPattern(pattern));
    setStartedFrom(pattern.id);
    setPicked(null);
    setInteraction(null);
  }

  function clear() {
    setDraft(EMPTY_SPEC);
    setStartedFrom(null);
    setPicked(null);
    setInteraction(null);
  }

  function create() {
    const target = startedFrom ?? matches?.[0]?.id ?? "unspecified";
    const created = instantiate(target, draft);
    if (created) setInteraction(created);
  }

  function respond(value: string) {
    setPicked(value);
    if (!interaction) return;
    setInteraction({
      ...interaction,
      response: { value, by: "person:you", at: new Date().toISOString() },
    });
  }

  const levelChannels = draft.level ? channelsForLevel(draft.level) : null;
  const levelAudiences = draft.level ? audiencesForLevel(draft.level) : null;

  return (
    <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
      {/* ------------------------------------------------ the sentence */}
      <div>
        <div className="osh-card p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="v2-eyebrow">Behavior spec</p>
            {startedFrom ? (
              <span className="v2-tag">
                from {patterns.find((p) => p.id === startedFrom)?.name}
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            <SpecSentence draft={draft} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
            {SPEC_SLOT_ORDER.map((slot) => (
              <SlotKey key={slot} slot={slot} />
            ))}
          </div>

          {missing.length > 0 ? (
            <p className="mt-3 text-xs text-faint">
              {missing.length} slot{missing.length === 1 ? "" : "s"} still
              empty: {missing.join(", ")}.
            </p>
          ) : (
            <p className="mt-3 text-xs text-faint">
              Complete. This is a specification of behavior, not of a component.
            </p>
          )}
        </div>

        {/* ------------------------------------------------ the editors */}
        <div className="mt-5 flex flex-col gap-5">
          <Field slot="trigger" label="When…">
            <input
              className="v2-select w-full"
              list="v2-triggers"
              placeholder="the moment that sets it off"
              value={draft.trigger}
              onChange={(event) =>
                update({ trigger: event.target.value }, "trigger")
              }
            />
            <datalist id="v2-triggers">
              {TRIGGER_SUGGESTIONS.map((trigger) => (
                <option key={trigger} value={trigger} />
              ))}
            </datalist>
          </Field>

          <Field
            slot="mode"
            label="…the agent"
            note="Picking a mode sets the valid responses."
          >
            <div className="flex flex-wrap gap-2">
              {MODE_ORDER.map((id) => {
                const count = patterns.filter(
                  (p) => p.mode.primary === id,
                ).length;
                return (
                  <button
                    key={id}
                    type="button"
                    className="v2-resp"
                    data-tone={draft.mode === id ? "primary" : undefined}
                    aria-pressed={draft.mode === id}
                    style={count === 0 ? { borderStyle: "dashed" } : undefined}
                    onClick={() => update({ mode: id as Mode }, "mode")}
                  >
                    {MODE_LABEL[id]}
                    <span className="ml-1.5 opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
            {mode ? (
              <p className="mt-2.5 text-xs leading-relaxed text-faint">
                {MODE_FAMILY_LABEL[mode.family]} · {mode.definition}
              </p>
            ) : null}
          </Field>

          <Field
            slot="level"
            label="…in"
            note="Picking a level filters the audiences and the channels. An agents-only exchange has no person in it, so the human-facing channels go."
          >
            <div className="flex flex-wrap gap-2">
              {LEVEL_ORDER.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="v2-resp"
                  data-tone={draft.level === id ? "primary" : undefined}
                  aria-pressed={draft.level === id}
                  onClick={() => update({ level: id as Level }, "level")}
                >
                  <LevelDots level={id} />
                  <span className="ml-1.5">{LEVEL_LABEL[id]}</span>
                </button>
              ))}
            </div>
            {draft.level ? (
              <p className="mt-2.5 text-xs italic text-faint">
                {LEVEL_LONG[draft.level]}
              </p>
            ) : null}
          </Field>

          <Field slot="audience" label="…to">
            {levelAudiences ? (
              <div className="flex flex-wrap gap-2">
                {levelAudiences.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="v2-resp"
                    data-tone={draft.audience === id ? "primary" : undefined}
                    aria-pressed={draft.audience === id}
                    onClick={() =>
                      update({ audience: id as Audience }, "audience")
                    }
                  >
                    {AUDIENCE_LABEL[id]}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-faint">Pick a level first.</p>
            )}
          </Field>

          <Field slot="channel" label="…through">
            {levelChannels ? (
              <div className="flex flex-wrap gap-2">
                {levelChannels.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="v2-resp"
                    data-tone={draft.channel === id ? "primary" : undefined}
                    aria-pressed={draft.channel === id}
                    onClick={() => update({ channel: id as Channel }, "channel")}
                  >
                    {CHANNEL_LABEL[id]}
                    {CHANNEL_FACING[id] === "agent" ? (
                      <span className="ml-1.5 text-[0.65rem] uppercase opacity-60">
                        headless
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-faint">Pick a level first.</p>
            )}
          </Field>

          <Field
            slot="responses"
            label="…and expects"
            note="Defaults to the mode's valid responses. Narrow them if this pattern does not offer all of them."
          >
            {mode ? (
              <div className="flex flex-wrap gap-2">
                {mode.responses.map((response) => {
                  const on = draft.responses.includes(response);
                  return (
                    <button
                      key={response}
                      type="button"
                      className="v2-resp"
                      data-tone={on ? "primary" : undefined}
                      aria-pressed={on}
                      onClick={() =>
                        update(
                          {
                            responses: on
                              ? draft.responses.filter((r) => r !== response)
                              : [...draft.responses, response],
                          },
                          "responses",
                        )
                      }
                    >
                      {response}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-faint">Pick a mode first.</p>
            )}
          </Field>
        </div>
      </div>

      {/* --------------------------------------------- matches and output */}
      <div className="flex flex-col gap-5 lg:sticky lg:top-24">
        <div className="osh-card p-6">
          <p className="v2-eyebrow">Start from a pattern</p>
          <select
            className="v2-select mt-2 w-full"
            aria-label="Pre-fill from a pattern"
            value={startedFrom ?? ""}
            onChange={(event) =>
              event.target.value
                ? loadPattern(event.target.value)
                : clear()
            }
          >
            <option value="">Blank spec</option>
            {patterns.map((pattern) => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-relaxed text-faint">
            Choosing one fills every slot from the catalog. Editing from there
            does not change the catalog.
          </p>
        </div>

        <div className="osh-card p-6">
          <p className="v2-eyebrow">What this matches</p>

          {matches === null ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Pick a mode or a level and the catalog narrows here.
            </p>
          ) : matches.length === 0 ? (
            <div className="v2-gap mt-3">
              <p className="v2-gap__head">
                {draft.mode
                  ? `No ${MODE_LABEL[draft.mode]} pattern yet`
                  : "Nothing in the catalog matches"}
              </p>
              <p className="text-sm leading-relaxed">
                {draft.mode &&
                patterns.every((p) => p.mode.primary !== draft.mode)
                  ? "This mode is defined and has valid responses, and nothing has been designed to open with it. You are specifying a gap."
                  : "Every slot here is valid on its own; no pattern in the catalog combines them."}
              </p>
            </div>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {matches.map((pattern) => (
                <li key={pattern.id} className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/v2/patterns/${pattern.id}`}
                    className="text-sm font-medium text-ink underline-offset-2 hover:underline"
                  >
                    {pattern.name}
                  </Link>
                  <button
                    type="button"
                    className="v2-resp ml-auto"
                    onClick={() => loadPattern(pattern.id)}
                  >
                    load
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="osh-card p-6">
          <p className="v2-eyebrow">Create an interaction</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            A spec is a design. An interaction is one live occurrence of it,
            with a slot for the response.
          </p>
          <button
            type="button"
            className="v2-btn v2-btn--primary mt-3"
            disabled={missing.length > 0}
            onClick={create}
          >
            Instantiate
          </button>
          {missing.length > 0 ? (
            <p className="mt-2 text-xs text-faint">
              Fill every slot first. {missing.join(", ")} still missing.
            </p>
          ) : null}

          {interaction ? (
            <>
              <div className="mt-4">
                <p className="v2-eyebrow mb-2">Simulate the response</p>
                <div className="v2-responses">
                  {draft.responses.map((response) => (
                    <button
                      key={response}
                      type="button"
                      className="v2-resp"
                      data-picked={picked === response ? "true" : undefined}
                      onClick={() => respond(response)}
                    >
                      {response}
                    </button>
                  ))}
                </div>
              </div>
              <pre className="v2-code mt-4">
                <code>{JSON.stringify(interaction, null, 2)}</code>
              </pre>
              <p className="mt-2 text-xs leading-relaxed text-faint">
                This lives in the browser. Nothing is written to the MCP
                server&rsquo;s instance store from here yet.
              </p>
            </>
          ) : null}
        </div>

        {sentence ? (
          <div className="osh-card p-6">
            <p className="v2-eyebrow">Copy</p>
            <p className="mt-2 text-sm leading-relaxed text-subtle">
              {sentence}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  slot,
  label,
  note,
  children,
}: {
  slot: Parameters<typeof SlotKey>[0]["slot"];
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2.5">
        <SlotKey slot={slot} />
        <span className="text-sm font-medium text-subtle">{label}</span>
      </div>
      {note ? (
        <p className="mt-1 max-w-[58ch] text-xs leading-relaxed text-faint">
          {note}
        </p>
      ) : null}
      <div className="mt-2.5">{children}</div>
    </div>
  );
}
