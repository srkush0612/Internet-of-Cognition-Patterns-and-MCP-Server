import agentScriptJson from "@/content/studio/agent-script.json";
import { anonymizeParticipants } from "@/lib/evidence-privacy";
import {
  displayNumber,
  situations,
  visibleSituations,
} from "@/lib/studio/content";
import type { Pattern } from "@/lib/patterns";
import type {
  AgentProposal,
  AgentScript,
  AgentScriptQuestion,
  AntiPattern,
  PatternElement,
  Shapeability,
  Situation,
  SituationTension,
} from "@/lib/studio/types";

/**
 * The agent pane, with no model behind it.
 *
 * Typed text is matched against the script's keywords. There is no ranking
 * cleverness on purpose: a keyword hit or an honest miss, so nothing in the
 * thread can be mistaken for a model having understood the question. When
 * model calls are added the rule is that a call may phrase, never adjudicate,
 * which means this matcher keeps deciding which entry applies.
 */
export const agentScript: AgentScript = agentScriptJson as AgentScript;

/**
 * A question is only usable when every situation it refers to is on screen.
 * Several of the scripted answers name situation 02 in their text and open it
 * at the end, so while 02 is hidden they would point at something that is not
 * there. Retiring them is honest; rewriting their copy to suit the filter
 * would be inventing content.
 */
function questionIsUsable(question: AgentScriptQuestion): boolean {
  const visible = (id: string) =>
    visibleSituations.some((situation) => situation.id === id);
  if (question.scope !== "*" && !visible(question.scope)) return false;
  if (question.opens && !visible(question.opens)) return false;
  if (question.mentions?.some((id) => !visible(id))) return false;
  for (const option of question.recommendation?.options ??
    question.refusal?.options ??
    []) {
    if (option.applies?.kind === "open" && !visible(option.applies.situationId)) {
      return false;
    }
  }
  return true;
}

export function usableQuestions(): AgentScriptQuestion[] {
  return agentScript.questions.filter(questionIsUsable);
}

/**
 * The opening message. The authored sentence carries no numbers, because the
 * numbers depend on what the filter is showing: it once said "nine
 * situations" and stayed saying it after three were hidden.
 */
export function openingLine(): string {
  const hidden = situations.length - visibleSituations.length;
  const shown = `There ${visibleSituations.length === 1 ? "is" : "are"} ${visibleSituations.length} of them.`;
  const withheld = hidden
    ? ` ${hidden} more ${hidden === 1 ? "is" : "are"} mapped but not shown, because the library has not flagged ${hidden === 1 ? "its pattern" : "their patterns"} ready yet.`
    : "";
  return `${agentScript.opening} ${shown}${withheld}`;
}

/** Scenario-wide questions plus the ones scoped to the open situation. */
export function questionsInScope(
  situationId: string | null,
): AgentScriptQuestion[] {
  return usableQuestions().filter(
    (question) => question.scope === "*" || question.scope === situationId,
  );
}

export function suggestionsFor(
  situationId: string | null,
  askedIds: string[],
  limit = 4,
): AgentScriptQuestion[] {
  return questionsInScope(situationId)
    .filter((question) => !askedIds.includes(question.id))
    .slice(0, limit);
}

/**
 * Keyword match over the whole script, not just what is in scope: asking
 * about situation 06 while 02 is open should answer and move the canvas,
 * not miss. Already-asked entries are skipped so a second ask does not
 * replay the same answer.
 */
export function matchQuestion(
  text: string,
  askedIds: string[],
): AgentScriptQuestion | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;

  return (
    usableQuestions().find(
      (question) =>
        !askedIds.includes(question.id) &&
        question.keywords.some((keyword) => normalized.includes(keyword)),
    ) ?? null
  );
}

export function getScriptQuestion(id: string): AgentScriptQuestion | undefined {
  return agentScript.questions.find((question) => question.id === id);
}

/**
 * The coverage answer is generated rather than authored, so it cannot claim
 * a number that stops being true when a pattern gains element detail or a
 * reference design.
 */
export function coverageAnswer(
  situations: Situation[],
  shapeabilityOfSituation: (situation: Situation) => Shapeability,
): string {
  const total = situations.length;
  const unmatched = situations.filter((s) => s.patternIds.length === 0);
  const groups = { editable: 0, annotated: 0, matched_only: 0 };
  for (const situation of situations) {
    groups[shapeabilityOfSituation(situation)] += 1;
  }

  const shapeable = groups.editable + groups.annotated;
  const matching =
    unmatched.length === 0
      ? `Nowhere on the matching. All ${total} have a pattern.`
      : `${unmatched.length} of ${total} have no pattern matched to them: ${unmatched
          .map((s) => displayNumber(s))
          .join(", ")}. That is a gap in the library, not in your system.`;

  const detail =
    groups.matched_only === 0
      ? `Every one of them can be shaped here.`
      : `${shapeable} of ${total} can be shaped here. The other ${groups.matched_only} are matched and you can read the pattern, but no element detail has been published for them yet, so there is nothing to fill in.`;

  return `${matching} ${detail}`;
}

/**
 * The refusal shown when someone tries to take out an element the pattern
 * requires. It is built from that element's own record rather than scripted,
 * so it is always about the element that was actually clicked and every
 * specific claim in it is a field someone authored: the element's label, its
 * `required` flag, the line from the library it was derived from, and the
 * named failure mode if one has been proposed for it.
 */
export function refusalForElement(
  element: PatternElement,
  situationId: string,
  antiPatterns: AntiPattern[],
): AgentProposal {
  const named = antiPatterns[0];

  const why = [
    `"${element.label}" is marked required on this pattern, which means the library treats it as part of what makes the pattern itself rather than a detail of one build.`,
    element.evidence ? `Where that comes from: ${element.evidence}` : null,
    named
      ? `Taking it out is the failure mode recorded as "${named.name}": ${named.description}`
      : `No failure mode has been named for removing it yet, so I cannot tell you what specifically goes wrong. That absence is worth knowing.`,
    `I will not drop it quietly. If your build does not have it, that is a gap with a reason on it, and the reason belongs on the record.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    head: "I am not going to take that out quietly.",
    why,
    cites: element.evidence,
    options: [
      {
        label: "Record it as an accepted gap",
        commits: "a written reason, and this situation reading as answered with a gap",
        best: true,
        reasonPrompt: "Why does your build not have it?",
        applies: {
          kind: "acceptGapWithReason",
          elementId: element.id,
          situationId,
        },
      },
      {
        label: "Leave it in place",
        commits: "nothing, the pattern keeps every element it requires",
        applies: { kind: "note" },
      },
    ],
  };
}


/**
 * What the agent says when a situation opens, in four parts rather than one
 * paragraph. Six kinds of claim used to be flattened into a single block in a
 * single voice, which made the caveats read like trivia when they are the most
 * important thing in it.
 *
 *   verdict     the match, one line, with the library's own backing chip
 *   why         one sentence, what this situation has to answer
 *   whatItDoes  reference, closed by default, because it is already on the
 *               pattern page and is not the argument
 *   caveats     one short line each, last, styled apart from the claims
 *
 * Every part is a field someone authored. Participant names never appear:
 * anonymizeParticipants gives the count, in the form the pattern pages use.
 */
export type PatternExplanation = {
  patternSlug: string;
  verdict: string;
  why: string;
  whatItDoes: string;
  /** Anonymised count, or null where the library records none. */
  participants: string | null;
  caveats: string[];
  cites: string;
};

/** At most N sentences, cut on a sentence boundary and never mid-clause. */
function firstSentences(text: string, limit: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!sentences || sentences.length <= limit) return text.trim();
  return sentences.slice(0, limit).join("").trim();
}

/**
 * Why this pattern answers this situation, with the source named.
 *
 *   "seeded"   the situation's own `reason`, hardcoded for the demo. The
 *              agent is to write this later.
 *   "library"  no reason is seeded, so the pattern's own `whatItSolves`, the
 *              field that states the problem it answers.
 *   "none"     neither exists, and the line says that rather than being given
 *              a rationale.
 */
export function whyThisPattern(
  situation: Situation,
  pattern: Pattern,
): { text: string; source: "seeded" | "library" | "none" } {
  if (situation.reason) {
    return { text: situation.reason, source: "seeded" };
  }
  const problem = patternProblem(pattern, 2);
  return {
    text: problem.text,
    source: problem.sourced ? "library" : "none",
  };
}

/**
 * Why a pattern is worth reaching for, in the library's own words: its
 * `whatItSolves`, which is the field that states the problem it answers.
 *
 * Three of the seventeen patterns have no `whatItSolves` written yet. Those
 * return `sourced: false` and a line that says so, because the alternative is
 * composing a rationale for a pattern match, which is the one thing this build
 * must not do.
 */
export function patternProblem(
  pattern: Pattern,
  sentences = 1,
): { text: string; sourced: boolean } {
  if (!pattern.whatItSolves) {
    return {
      text: `The library has not written up what ${pattern.title} solves, so there is nothing on record here that says why it fits.`,
      sourced: false,
    };
  }
  return { text: firstSentences(pattern.whatItSolves, sentences), sourced: true };
}

export function explainPattern({
  situation,
  pattern,
  shapeability,
  tensions,
}: {
  situation: Situation;
  pattern: Pattern;
  shapeability: Shapeability;
  tensions: SituationTension[];
}): PatternExplanation {
  const why = whyThisPattern(situation, pattern);
  const caveats: string[] = [];

  if (why.source === "none") {
    caveats.push(
      `Nothing in the library states what ${pattern.title} solves, so the fit is asserted rather than argued.`,
    );
  }

  if (shapeability === "matched_only") {
    caveats.push(
      "No element detail has been published for it, so there is nothing to shape here yet.",
    );
  } else if (!pattern.interactionModel) {
    caveats.push(
      "Its elements come from the edit schema in the codebase, not from a published interaction model.",
    );
  }

  for (const tension of tensions) {
    caveats.push(`Given your answers, it ${tension.label}.`);
  }

  caveats.push(
    why.source === "seeded"
      ? "The match and the reason for it are both seeded for the demo, not research."
      : "The match itself comes from the seeded situation list, not research.",
  );

  const cites = [
    `${pattern.slug}.oneliner, .backingStrength, .participants${
      why.source === "library" ? ", .whatItSolves" : ""
    }${pattern.interactionModel ? ", .interactionModel" : ""}`,
    `content/studio/situations.json: ${situation.id}${
      why.source === "seeded" ? ".reason, seeded for the demo" : ""
    } (unverified placeholder)`,
    ...tensions.map((tension) => tension.cites),
  ].join(" · ");

  return {
    patternSlug: pattern.slug,
    verdict: `${pattern.title} is the match for situation ${displayNumber(situation)}.`,
    why: why.text,
    whatItDoes: firstSentences(pattern.oneliner, 2),
    participants: pattern.participants
      ? anonymizeParticipants(pattern.participants)
      : null,
    caveats,
    cites,
  };
}
