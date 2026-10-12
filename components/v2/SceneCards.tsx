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
} from "@/lib/v2/homepage";

/**
 * The same incident twice: once with no agreed way to talk, once with every
 * exchange following a named pattern.
 *
 * Both are monospace records rather than illustrations, because the thing
 * being shown is what the agents actually emit. Nothing here is measured, 
 * the footer lines count what is in the scene above them and nothing else.
 */

function SceneFrame({
  children,
  footer,
  tone,
}: {
  children: React.ReactNode;
  footer: string;
  tone: "problem" | "hax";
}) {
  return (
    <div className={`v2-scene v2-scene--${tone}`}>
      <div className="v2-scene__head">
        <span className="v2-scene__dot" />
        <span>{SCENE_HEADER.incident}</span>
        <span className="v2-scene__subject">{SCENE_HEADER.subject}</span>
      </div>
      <div className="v2-scene__body">{children}</div>
      <p className="v2-scene__foot">{footer}</p>
    </div>
  );
}

export function ProblemScene() {
  return (
    <SceneFrame footer={PROBLEM_FOOTER} tone="problem">
      {PROBLEM_SCENE.map((line) => (
        <div key={line.actor} className="v2-scene__row">
          <span className="v2-scene__actor">{line.actor}</span>
          <span className="v2-scene__action">{line.action}</span>
          {line.aside ? (
            <span className="v2-scene__aside">({line.aside})</span>
          ) : null}
        </div>
      ))}
    </SceneFrame>
  );
}

export function HaxScene() {
  const [picked, setPicked] = useState<string | null>(null);
  const outcome = CHIP_OUTCOMES.find((chip) => chip.label === picked);

  return (
    <SceneFrame footer={HAX_FOOTER} tone="hax">
      {HAX_SCENE.map((line) => {
        const pattern = line.patternId ? getV2Pattern(line.patternId) : null;
        const isHandshake = line.patternId === "pre-action-handshake";

        return (
          <div key={line.actor}>
            <div className="v2-scene__row">
              <span className="v2-scene__actor">{line.actor}</span>
              <span className="v2-scene__action">{line.action}</span>
              {pattern ? (
                <Link
                  href={`/v2/patterns/${pattern.id}`}
                  className="v2-scene__pattern"
                >
                  {pattern.name}
                </Link>
              ) : null}
            </div>

            {isHandshake ? (
              <div className="v2-scene__chips">
                {CHIP_OUTCOMES.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    className="v2-chip"
                    aria-pressed={picked === chip.label}
                    onClick={() =>
                      setPicked(picked === chip.label ? null : chip.label)
                    }
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}

      {outcome ? (
        <p className="v2-scene__outcome">
          <b>{outcome.label}</b> → {outcome.outcome}
        </p>
      ) : null}
    </SceneFrame>
  );
}
