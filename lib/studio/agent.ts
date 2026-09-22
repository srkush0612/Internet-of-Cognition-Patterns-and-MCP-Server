import agentScriptJson from "@/content/studio/agent-script.json";
import { situations, visibleSituations } from "@/lib/studio/content";
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
          .map((s) => s.number)
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
 * What the agent says when a situation opens: why this pattern is the answer
 * to it.
 *
 * Every clause is a field someone authored, and the closing line says which
 * of them is not research. Nothing here characterises a pattern in words of
 * its own: the summary is the library's `oneliner`, the strength and the
 * participant count are the library's, whether the parts are shapeable comes
 * from whether an interaction model was published, and the tension comes from
 * the situation's own content with a citation on it.
 */
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
}): { text: string; cites: string } {
  const strength = pattern.backingStrength ?? "not rated";
  const participants = pattern.participants
    ? `, from ${pattern.participants}`
    : "";

  const shapeLine =
    shapeability === "matched_only"
      ? "There is nothing to shape here yet: no element detail has been published for it, so you can read the pattern but not fill it in."
      : pattern.interactionModel
        ? "Its published interaction model names the parts it needs, which is what you can fill in on the right."
        : "Its parts come from the edit schema in the codebase rather than from a published interaction model, which is a weaker source than I would like.";

  const tensionLine = tensions.length
    ? ` One thing to watch, given your answers: it ${tensions
        .map((tension) => tension.label)
        .join(", and it ")}.`
    : "";

  const text = `${pattern.title} is the match for ${situation.number}, which is about ${situation.moment}. ${pattern.oneliner} Shaping it answers ${situation.answers}. The library rates the support for it ${strength.toLowerCase()}${participants}. ${shapeLine}${tensionLine} Worth knowing: the match itself is from the seeded situation list, not from research.`;

  const cites = [
    `${pattern.slug}.oneliner, .backingStrength, .participants${pattern.interactionModel ? ", .interactionModel" : ""}`,
    `content/studio/situations.json: ${situation.id} (unverified placeholder)`,
    ...tensions.map((tension) => tension.cites),
  ].join(" · ");

  return { text, cites };
}
