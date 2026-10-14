"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  AUDIENCE_LABEL,
  CHANNEL_LABEL,
  LEVEL_LABEL,
  LEVEL_ORDER,
  audiencesForLevel,
  channelsForLevel,
} from "@/lib/v2/levels";
import { MODE_LABEL, MODE_ORDER, MODE_PLAIN, getMode } from "@/lib/v2/modes";
import {
  SPEC_SLOT_ORDER,
  composeSpec,
  reconcile,
  type SpecDraft,
} from "@/lib/v2/spec";
import type { Audience, Channel, Level, Mode, SpecSlot } from "@/lib/v2/types";

type View = "flow" | "orbit";

export const INITIAL_DRAFT: SpecDraft = {
  trigger: "Before an irreversible step",
  mode: "propose",
  audience: "operator",
  level: "L3",
  channel: "chat_ui",
  responses: ["consent", "correct", "decline", "defer"],
};

const SHORT_LABEL: Record<SpecSlot, string> = {
  trigger: "When it happens",
  mode: "What the agent does",
  audience: "Who receives it",
  level: "Who is involved",
  channel: "Where it appears",
  responses: "What they can do",
};

const GUIDANCE: Record<SpecSlot, { question: string; why: string }> = {
  trigger: {
    question: "When should the agent start this interaction?",
    why: "Choose the moment that calls for a message or action. This helps Studio find patterns for the right situation.",
  },
  mode: {
    question: "What should the agent do at that moment?",
    why: "This is the kind of opening the agent makes. It also determines which responses make sense.",
  },
  audience: {
    question: "Who receives the agent’s opening?",
    why: "Pick the direct receiver. This is different from everyone involved in the wider exchange.",
  },
  level: {
    question: "Who is involved in the wider exchange?",
    why: "This tells Studio whether the behavior works with one agent, several agents, or people in the loop. It can change the available receivers and channels.",
  },
  channel: {
    question: "Where should the opening appear?",
    why: "Choose the surface that carries it: a conversation, settings, shared workspace, or agent-readable data.",
  },
  responses: {
    question: "What can the receiver do next?",
    why: "Keep the choices the receiver should actually have. The preview will let you try one of them.",
  },
};

export function StudioBehaviorMaps({
  draft,
  onDraftChange,
  matchCount,
  topMatch,
  description,
  onDescriptionChange,
  responseOptions,
  onResponseOptionsChange,
  exampleName,
  onExplore,
}: {
  draft: SpecDraft;
  onDraftChange: Dispatch<SetStateAction<SpecDraft>>;
  matchCount: number;
  topMatch?: string;
  description: string;
  onDescriptionChange: (value: string) => void;
  responseOptions: string[];
  onResponseOptionsChange: (value: string[]) => void;
  exampleName: string | null;
  onExplore: () => void;
}) {
  const [view, setView] = useState<View>("flow");
  const [selected, setSelected] = useState<SpecSlot>("trigger");
  const { sentence } = composeSpec(draft);
  const complete = Boolean(
    draft.trigger.trim() && draft.mode && draft.audience && draft.level &&
    draft.channel && draft.responses.length,
  );

  function update(patch: Partial<SpecDraft>, slot: SpecSlot) {
    onDraftChange((current) => reconcile({ ...current, ...patch }, slot));
  }

  const slotValue: Record<SpecSlot, string> = {
    trigger: draft.trigger || "Choose a moment",
    mode: draft.mode ? cap(MODE_PLAIN[draft.mode]) : "Choose an action",
    audience: draft.audience ? AUDIENCE_LABEL[draft.audience] : "Choose a recipient",
    level: draft.level ? LEVEL_LABEL[draft.level] : "Choose participants",
    channel: draft.channel ? CHANNEL_LABEL[draft.channel] : "Choose a channel",
    responses: draft.responses.length ? draft.responses.join(" · ") : "Choose responses",
  };

  function node(slot: SpecSlot, index?: number) {
    return (
      <button
        key={slot}
        type="button"
        className="v2-behavior-node"
        data-slot={slot}
        data-selected={selected === slot}
        aria-pressed={selected === slot}
        onClick={() => {
          setSelected(slot);
          document.getElementById(`studio-step-${slot}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      >
        <span className="v2-behavior-node__label">
          {index !== undefined ? `${String(index).padStart(2, "0")} · ` : ""}
          {SHORT_LABEL[slot]}
        </span>
        <span className="v2-behavior-node__value">{slotValue[slot]}</span>
        <span className="v2-behavior-node__edit">Edit step ↑</span>
      </button>
    );
  }

  const availableAudiences = draft.level
    ? audiencesForLevel(draft.level)
    : (["self", "peer_agent", "orchestrator", "operator", "team"] as Audience[]);
  const availableChannels = draft.level
    ? channelsForLevel(draft.level)
    : (["chat_ui", "settings_panel", "shared_ui", "agent_message", "shared_record", "state_signal"] as Channel[]);

  function choicesFor(slot: SpecSlot) {
    if (slot === "trigger") return (
      <input
        className="v2-select"
        aria-label="When should the agent start this interaction?"
        placeholder="For example, before changing production settings"
        value={draft.trigger}
        onChange={(event) => update({ trigger: event.target.value }, "trigger")}
      />
    );
    if (slot === "mode") return (
      <ChoiceGroup values={MODE_ORDER} selected={draft.mode} label={MODE_LABEL} onPick={(value) => { onResponseOptionsChange(getMode(value).responses); update({ mode: value }, "mode"); }} description={MODE_PLAIN} />
    );
    if (slot === "audience") return (
      <ChoiceGroup values={availableAudiences} selected={draft.audience} label={AUDIENCE_LABEL} onPick={(value) => update({ audience: value }, "audience")} />
    );
    if (slot === "level") return (
      <ChoiceGroup values={LEVEL_ORDER} selected={draft.level} label={LEVEL_LABEL} onPick={(value) => update({ level: value }, "level")} />
    );
    if (slot === "channel") return (
      <ChoiceGroup values={availableChannels} selected={draft.channel} label={CHANNEL_LABEL} onPick={(value) => update({ channel: value }, "channel")} />
    );
    return (
      <div className="v2-behavior-choices" role="group" aria-label="Available responses">
        {responseOptions.map((response) => (
          <button
            key={response}
            type="button"
            className="v2-resp v2-resp--sm"
            data-tone={draft.responses.includes(response) ? "primary" : undefined}
            aria-pressed={draft.responses.includes(response)}
            onClick={() => update({ responses: draft.responses.includes(response) ? draft.responses.filter((item) => item !== response) : [...draft.responses, response] }, "responses")}
          >
            {response}
          </button>
        ))}
      </div>
    );
  }

  return (
    <section className="v2-behavior-demo" aria-labelledby="behavior-demo-title">
      <div className="v2-behavior-demo__head">
        <div>
          <p className="v2-techlabel">{exampleName ? `Example · ${exampleName}` : "Your interaction"}</p>
          <h2 id="behavior-demo-title">Shape the interaction</h2>
          <p>{exampleName ? "This example is filled in. Open a step to change its choice." : "Open a step to choose what happens."}</p>
        </div>
      </div>

      <div className="v2-behavior-steps" aria-label="Six behavior choices">
        {SPEC_SLOT_ORDER.map((slot, index) => (
          <section key={slot} id={`studio-step-${slot}`} className="v2-behavior-step" data-slot={slot} data-open={selected === slot}>
            <button
              type="button"
              className="v2-behavior-step__summary"
              aria-expanded={selected === slot}
              aria-controls={`studio-step-options-${slot}`}
              onClick={() => setSelected(slot)}
            >
              <span className="v2-behavior-step__number">{String(index + 1).padStart(2, "0")}</span>
              <span className="v2-behavior-step__heading">
                <strong>{SHORT_LABEL[slot]}</strong>
                <span>{slotValue[slot]}</span>
              </span>
              <span className="v2-behavior-step__toggle" aria-hidden="true">{selected === slot ? "−" : "Change +"}</span>
            </button>
            {selected === slot ? (
              <div id={`studio-step-options-${slot}`} className="v2-behavior-step__options">
                <div className="v2-behavior-step__help">
                  <h3>{GUIDANCE[slot].question}</h3>
                  <p>{GUIDANCE[slot].why}</p>
                </div>
                <div className="v2-behavior-step__control">
                  {choicesFor(slot)}
                  {index < SPEC_SLOT_ORDER.length - 1 ? (
                    <button type="button" className="v2-behavior-step__next" onClick={() => setSelected(SPEC_SLOT_ORDER[index + 1])}>
                      Next: {SHORT_LABEL[SPEC_SLOT_ORDER[index + 1]]} →
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <details className="v2-behavior-map-details">
        <summary>See your choices as a map</summary>
        <p>The maps show the same six choices. Select one to edit its step above.</p>
        <div className="v2-behavior-views" role="group" aria-label="Behavior map layout">
          <button type="button" aria-pressed={view === "flow"} onClick={() => setView("flow")}>Interaction map</button>
          <button type="button" aria-pressed={view === "orbit"} onClick={() => setView("orbit")}>Radial map</button>
        </div>
        {view === "flow" ? (
          <div className="v2-behavior-flow" aria-label="Interaction map">
            {node("trigger", 1)}
            <span className="v2-behavior-arrow" aria-hidden="true">→</span>
            {node("mode", 2)}
            <span className="v2-behavior-arrow" aria-hidden="true">→</span>
            <div className="v2-behavior-flow__destination">
              {node("audience", 3)}
              <div className="v2-behavior-flow__context">
                {node("level", 4)}
                {node("channel", 5)}
              </div>
            </div>
            <div className="v2-behavior-flow__responses">{node("responses", 6)}</div>
          </div>
        ) : (
          <div className="v2-behavior-orbit" aria-label="Radial map">
            <div className="v2-behavior-orbit__center"><span className="v2-behavior-orbit__agent" aria-hidden="true">A</span><strong>Agent behavior</strong></div>
            {(["trigger", "mode", "audience", "level", "channel", "responses"] as SpecSlot[]).map((slot) => node(slot))}
          </div>
        )}
      </details>

      <details className="v2-behavior-wording">
        <summary>View spec wording</summary>
        <p>{sentence ?? "Choose the missing parts to complete the spec."}</p>
      </details>
      <div className="v2-behavior-context">
        <label htmlFor="studio-behavior-context" className="v2-techlabel">Tell us about your situation (optional)</label>
        <p>This helps order the matches; the six choices above define which patterns fit.</p>
        <textarea
          id="studio-behavior-context"
          className="v2-select"
          rows={2}
          placeholder="Describe the work or situation in your own words"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </div>
      <div className="v2-behavior-matchbar">
        <div aria-live="polite">
          <strong>{complete ? `Based on your choices, ${matchCount} pattern${matchCount === 1 ? "" : "s"} fit` : "Complete the six choices to find patterns"}</strong>
          {complete && topMatch ? <span>First match: {topMatch}. You can compare all matches next.</span> : null}
          {complete && matchCount === 0 ? <span>We&rsquo;ll show the closest patterns and what differs.</span> : null}
        </div>
        <button type="button" className="osh-cta-solid" disabled={!complete} onClick={onExplore}>
          Compare patterns →
        </button>
      </div>
    </section>
  );
}

function ChoiceGroup<T extends string>({
  values,
  selected,
  label,
  description,
  onPick,
}: {
  values: T[];
  selected: T | null;
  label: Record<T, string>;
  description?: Record<T, string>;
  onPick: (value: T) => void;
}) {
  return (
    <div className={`v2-behavior-choices${description ? " v2-behavior-choices--described" : ""}`}>
      {values.map((value) => (
        <button
          key={value}
          type="button"
          className={description ? "v2-behavior-choice-detail" : "v2-resp v2-resp--sm"}
          data-tone={selected === value ? "primary" : undefined}
          aria-pressed={selected === value}
          onClick={() => onPick(value)}
        >
          <span>{description ? cap(description[value]) : label[value]}</span>
          {description ? <small>{label[value]}</small> : null}
        </button>
      ))}
    </div>
  );
}

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
