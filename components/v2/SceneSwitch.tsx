"use client";

import { useState } from "react";
import Link from "next/link";
import { getV2Pattern } from "@/lib/v2/catalog";
import {
  CHIP_OUTCOMES,
  HAX_FOOTER,
  HAX_SCENE,
  PROBLEM_FOOTER,
  PROBLEM_SCENE,
  SCENE_HEADER,
  type SceneLine,
} from "@/lib/v2/homepage";

/**
 * One incident, two readings, switched in place.
 *
 * Showing them as one card that toggles rather than two cards stacked is the
 * whole point: the agents and the incident do not change, only whether each
 * exchange has a shape. Two cards would read as two different systems.
 */

type Key = "without" | "with";

const COPY: Record<Key, { title: string; turn: string; sub: string }> = {
  without: {
    title: "Three agents. One operator.",
    turn: "No shared way to coordinate.",
    sub: "Each agent acts on its own. Actions conflict, reasons go unexplained, and the operator has to piece together what happened.",
  },
  with: {
    title: "Same agents. Same incident.",
    turn: "Every exchange has a pattern.",
    sub: "Each exchange follows a named pattern, so agents know what to send and people know how to respond. Try a reply to @triage.",
  },
};

const REPLY_TONE: Record<string, "primary" | "negative" | undefined> = {
  consent: "primary",
  decline: "negative",
};

function Row({
  line,
  replies,
  picked,
  onPick,
}: {
  line: SceneLine;
  replies: boolean;
  picked: string | null;
  onPick: (label: string) => void;
}) {
  const pattern = line.patternId ? getV2Pattern(line.patternId) : null;
  const outcome = CHIP_OUTCOMES.find((chip) => chip.label === picked);
  const isPerson = line.actor === "operator";

  return (
    <div className="v2-row2">
      <span className={`v2-who${isPerson ? " v2-who--person" : ""}`}>
        {line.actor}
      </span>
      <span>{line.action}</span>

      {pattern ? (
        <Link href={`/v2/patterns/${pattern.id}`} className="v2-patlink">
          {pattern.name}
        </Link>
      ) : (
        <span className="v2-note">{line.aside ?? ""}</span>
      )}

      {replies ? (
        <>
          <div className="v2-replies" role="group" aria-label="Respond to @triage">
            {CHIP_OUTCOMES.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className={`v2-reply${
                  REPLY_TONE[chip.label] ? ` v2-reply--${REPLY_TONE[chip.label]}` : ""
                }`}
                aria-pressed={picked === chip.label}
                onClick={() => onPick(chip.label)}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <p className="v2-replyout">{outcome ? outcome.outcome : ""}</p>
        </>
      ) : null}
    </div>
  );
}

export function SceneSwitch() {
  const [key, setKey] = useState<Key>("without");
  const [picked, setPicked] = useState<string | null>(null);

  const copy = COPY[key];
  const rows = key === "with" ? HAX_SCENE : PROBLEM_SCENE;

  function choose(next: Key) {
    setKey(next);
    setPicked(null);
  }

  return (
    <div className="v2-scenegrid">
      <div>
        <h2 className="v2-h2">
          {copy.title}
          <span className="v2-turn">{copy.turn}</span>
        </h2>
        <p className="v2-sub">{copy.sub}</p>

        <div className="v2-seg" role="group" aria-label="Compare the incident">
          <button
            type="button"
            aria-pressed={key === "without"}
            onClick={() => choose("without")}
          >
            Without HAX
          </button>
          <button
            type="button"
            aria-pressed={key === "with"}
            onClick={() => choose("with")}
          >
            With HAX
          </button>
        </div>
      </div>

      <div>
        <div className="v2-log" data-state={key} aria-live="polite">
          <div className="v2-log__head">
            <span className="v2-log__live">{SCENE_HEADER.incident}</span>
            <span>{SCENE_HEADER.subject}</span>
          </div>

          <div className="v2-log__body">
            {rows.map((line) => (
              <Row
                key={line.actor}
                line={line}
                replies={key === "with" && line.patternId === "pre-action-handshake"}
                picked={picked}
                onPick={setPicked}
              />
            ))}
          </div>

          <p className="v2-log__foot">
            {key === "with" ? HAX_FOOTER : PROBLEM_FOOTER}
          </p>
        </div>
        <p className="v2-caption">
          {key === "with"
            ? "Example scenario. HAX patterns describe expected replies. The connected agent determines what happens next."
            : "Example scenario."}
        </p>
      </div>
    </div>
  );
}
