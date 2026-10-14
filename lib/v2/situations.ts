/**
 * A situation is the behaviour-spec sentence made concrete: a real moment where
 * the agent is making its opening in a pattern. It is also what Studio lists,
 * each situation mapped to the one pattern that answers it, the way v1's
 * overview read. The simulator opens on a situation and renders its scenario.
 *
 * Authored here for the demo, in the one INC-2231 world the rest of v2 uses.
 * Later a model produces exactly this shape from the user's own description, so
 * nothing downstream has to change, only where the strings come from.
 */

import { patterns } from "./catalog";
import type { Pattern } from "./types";

export type ExchangeParty = {
  name: string;
  claim: string;
  basis: string;
};

export type Situation = {
  id: string;
  order: number;
  /** Two-digit label, the way the list refers to it. */
  number: string;
  /** The pattern that answers this situation. */
  patternId: string;
  /** What the moment is, in a few words. */
  title: string;
  /** A fuller line of what happens, shown in the list. */
  example: string;

  /** The concrete trigger, fills [trigger]. */
  trigger: string;
  /** One line that sets the scene, in the agent's voice. */
  intro: string;

  /** Agents-only exchange (resolve / coordinate patterns). */
  partyA?: ExchangeParty;
  partyB?: ExchangeParty;
  adopt?: string;
  impasse?: string;

  /** Human-facing opening (the agent's actual words) and what the person decides. */
  opening?: string;
  waitingOn?: string;
};

export const SITUATIONS: Situation[] = [
  {
    id: "agents-disagree",
    order: 1,
    number: "01",
    patternId: "convergence-point",
    title: "Two agents read the incident differently",
    example:
      "Triage blames the retry loop; Deploy blames capacity. On-call needs to see how they settle it, not just the winner.",
    trigger: "payments-svc 5xx keeps climbing at 03:12",
    intro:
      "Two of us read the same incident and landed in different places. Here's where we diverge.",
    partyA: {
      name: "Triage agent",
      claim: "It's the checkout retry loop",
      basis: "error logs, 03:08-03:12",
    },
    partyB: {
      name: "Deploy agent",
      claim: "It's a capacity shortfall",
      basis: "the replica saturation dashboard",
    },
    adopt: "Adopted: pause the retry job first, reasoning attached",
    impasse: "Impasse: root cause unsettled, a person has to settle it",
  },
  {
    id: "about-to-act",
    order: 2,
    number: "02",
    patternId: "pre-action-handshake",
    title: "The agent is about to restart a service",
    example:
      "Before an irreversible restart, it states what it noticed and what it plans, and nothing happens until the person answers.",
    trigger: "triage is about to restart payments-svc",
    intro: "Before I touch anything, here's what I noticed and what I plan to do.",
    opening:
      "I noticed a 5xx spike that matches a retry storm. I plan to restart payments-svc to clear the stuck queue, it's reversible. Go ahead?",
    waitingOn: "You consent, correct the read, decline, or defer.",
  },
  {
    id: "why-this-output",
    order: 3,
    number: "03",
    patternId: "inline-rationale",
    title: "A recommendation lands without its why",
    example:
      "The agent hands over a restart recommendation; the reasoning and its sources sit right on the output, not in a separate trace.",
    trigger: "triage hands you a recommendation",
    intro: "Here's the recommendation, with the why attached to it.",
    opening:
      "Why I'm recommending a restart: the 5xx spike matches a retry storm (68% confidence), and a restart clears the stuck queue without a deploy, reversible.",
    waitingOn: "Read the reasoning, or open the full trace to check its sources.",
  },
  {
    id: "belief-changed",
    order: 4,
    number: "04",
    patternId: "memory-commitment-review",
    title: "A belief changed mid-incident",
    example:
      "The churn baseline moved from 12% to 41%. At session end, someone decides what reaches long-term memory, and what was left stale.",
    trigger: "the incident session is ending",
    intro:
      "Before this session's learning becomes long-term memory, review what I'm keeping.",
    opening:
      "Mid-session I updated the churn baseline from 12% to 41% after Customer Success validated it across 1,200 accounts. The 12% is now marked stale.",
    waitingOn: "Keep, restore, or revoke each belief before it is sealed.",
  },
];

/** The first situation that maps to this pattern (1:1 for the demo). */
export function situationFor(patternId: string): Situation | undefined {
  return SITUATIONS.find((s) => s.patternId === patternId);
}

export function situationById(id: string): Situation | undefined {
  return SITUATIONS.find((s) => s.id === id);
}

/** The v2 pattern a situation maps to. */
export function patternForSituation(situation: Situation): Pattern | undefined {
  return patterns.find((p) => p.id === situation.patternId);
}
