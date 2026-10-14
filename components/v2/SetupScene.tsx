"use client";

import { LazyMotion, domAnimation, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import type { Level } from "@/lib/v2/types";

/**
 * One drawing per setup, in the page's own vocabulary: circles are agents,
 * squares are people, a solid line is an exchange between agents and a dashed
 * one reaches a person.
 *
 * The nodes keep the agent / person pair rather than the hero's spectrum,
 * because here the shape and colour are the legend, the hero's field is
 * decorative and can carry the brand, these four say which setup is which.
 * What they borrow from the hero is the rest of it: the same soft round
 * nodes, the same slow drift, and the glow underneath.
 *
 * Drawn and transformed rather than simulated. Four more particle canvases
 * on one page costs real performance for an illustration nobody interacts
 * with, and a fixed composition says more than a random field, the single
 * agent inside a dashed boundary is the whole of "one agent", and no
 * simulation would reliably produce it.
 */

const AGENT = "var(--v2-agent)";
const PERSON = "var(--v2-person)";

/** The whole constellation breathes, so the links stay attached to it. */
const DRIFT = {
  animate: { x: [0, 3, -2, 0], y: [0, -3, 2, 0] },
  transition: { duration: 18, repeat: Infinity, ease: "easeInOut" as const },
};

/** And each node pulses on its own clock, which keeps it from looking rigid. */
function nodePulse(index: number) {
  return {
    animate: { opacity: [0.75, 1, 0.75], scale: [1, 1.12, 1] },
    transition: {
      duration: 4.5 + index * 0.7,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: index * 0.45,
    },
  };
}

type Pt = [number, number];

const SCENES: Record<
  Level,
  { agents: Pt[]; people: Pt[]; ring?: boolean }
> = {
  L1: { agents: [[100, 60]], people: [], ring: true },
  L2: { agents: [[60, 40], [140, 36], [100, 90]], people: [] },
  L3: { agents: [[52, 38], [112, 30], [84, 88]], people: [[156, 70]] },
  L4: {
    agents: [[70, 40], [124, 36], [96, 86]],
    people: [[30, 74], [170, 30], [160, 96]],
  },
};

export function SetupScene({ level }: { level: Level }) {
  const reduced = useReducedMotion();
  const { agents, people, ring } = SCENES[level];

  // Every agent links to every other; a person links to the nearest agent.
  const agentLinks: Array<[Pt, Pt]> = [];
  for (let i = 0; i < agents.length; i += 1) {
    for (let j = i + 1; j < agents.length; j += 1) {
      agentLinks.push([agents[i], agents[j]]);
    }
  }
  const personLinks: Array<[Pt, Pt]> = people.map((person, index) => [
    agents[index % agents.length],
    person,
  ]);

  const drift = reduced ? {} : DRIFT;

  return (
    <LazyMotion features={domAnimation} strict>
      <svg viewBox="0 0 200 120" aria-hidden="true" focusable="false">
        <defs>
          {/* The same soft bloom the hero's field has, so a node here reads
              as one of those rather than as a chart marker. */}
          <radialGradient id={`setup-glow-a-${level}`}>
            <stop offset="0%" stopColor={AGENT} stopOpacity="0.22" />
            <stop offset="100%" stopColor={AGENT} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`setup-glow-p-${level}`}>
            <stop offset="0%" stopColor={PERSON} stopOpacity="0.2" />
            <stop offset="100%" stopColor={PERSON} stopOpacity="0" />
          </radialGradient>
        </defs>

        <m.g {...drift}>
          {ring ? (
            <circle
              cx={100}
              cy={60}
              r={34}
              fill="none"
              stroke="var(--color-border-medium)"
              strokeDasharray="3 5"
            />
          ) : null}

          <g stroke={AGENT} strokeOpacity="0.4" strokeWidth="1.5">
            {agentLinks.map(([a, b], i) => (
              <line key={`al${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
            ))}
          </g>

          <g stroke={PERSON} strokeWidth="1.5" strokeDasharray="4 4">
            {personLinks.map(([a, b], i) => (
              <line key={`pl${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
            ))}
          </g>

          {agents.map(([cx, cy], i) => (
            <g key={`a${i}`}>
              <circle
                cx={cx}
                cy={cy}
                r={18}
                fill={`url(#setup-glow-a-${level})`}
              />
              <m.circle
                cx={cx}
                cy={cy}
                r={ring ? 9 : 8}
                fill={AGENT}
                style={{ originX: `${cx}px`, originY: `${cy}px` }}
                {...(reduced ? {} : nodePulse(i))}
              />
            </g>
          ))}

          {people.map(([cx, cy], i) => (
            <g key={`p${i}`}>
              <circle cx={cx} cy={cy} r={18} fill={`url(#setup-glow-p-${level})`} />
              <m.rect
                x={cx - 9}
                y={cy - 9}
                width={18}
                height={18}
                rx={3}
                fill={PERSON}
                style={{ originX: `${cx}px`, originY: `${cy}px` }}
                {...(reduced ? {} : nodePulse(i + agents.length))}
              />
            </g>
          ))}
        </m.g>
      </svg>
    </LazyMotion>
  );
}
