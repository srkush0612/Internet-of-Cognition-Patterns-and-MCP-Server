import { describe, expect, it } from "vitest";
import {
  agentScript,
  coverageAnswer,
  explainPattern,
  matchQuestion,
  openingLine,
  patternProblem,
  refusalForElement,
  whyThisPattern,
  suggestionsFor,
  usableQuestions,
} from "@/lib/studio/agent";
import {
  answersFragment,
  displayNumber,
  situations,
  visibleSituations,
} from "@/lib/studio/content";
import { anonymizeParticipants } from "@/lib/evidence-privacy";
import { getPattern } from "@/lib/patterns";
import { shapeabilityOf } from "@/lib/studio/shapeability";
import type { AntiPattern, PatternElement, Shapeability } from "@/lib/studio/types";

const element: PatternElement = {
  id: "el-1",
  patternId: "some-pattern",
  label: "A way to correct the interpretation",
  hint: "Lets the person fix what the agent got wrong.",
  required: true,
  evidence: "Published interaction model: 'confirm, correct, or defer.'",
};

const VISIBLE_SITUATION = visibleSituations[0].id;

describe("matchQuestion", () => {
  it("matches on a keyword anywhere in the typed text", () => {
    expect(matchQuestion("where does the library have a gap?", [])?.id).toBe(
      "coverage",
    );
  });

  it("skips a question that has already been answered", () => {
    expect(matchQuestion("where is the gap", ["coverage"])).toBeNull();
  });

  it("returns null rather than guessing when nothing matches", () => {
    expect(matchQuestion("what is the weather like", [])).toBeNull();
  });

  it("has a fallback to use when it returns null", () => {
    expect(agentScript.fallback).toContain("scripted");
  });

  it("never matches a question about a situation that is not on screen", () => {
    for (const question of agentScript.questions) {
      const hit = matchQuestion(question.keywords[0], []);
      if (!hit) continue;
      if (hit.scope !== "*") {
        expect(
          visibleSituations.some((s) => s.id === hit.scope),
          `${hit.id} is scoped to a hidden situation`,
        ).toBe(true);
      }
    }
  });
});

describe("usableQuestions", () => {
  it("retires a question whose copy names a hidden situation", () => {
    const usable = usableQuestions().map((question) => question.id);
    for (const question of agentScript.questions) {
      const referenced = [
        ...(question.mentions ?? []),
        ...(question.opens ? [question.opens] : []),
        ...(question.scope === "*" ? [] : [question.scope]),
      ];
      const allVisible = referenced.every((id) =>
        visibleSituations.some((situation) => situation.id === id),
      );
      expect(usable.includes(question.id), question.id).toBe(allVisible);
    }
  });

  it("keeps the computed coverage answer, which names no situation", () => {
    expect(usableQuestions().map((question) => question.id)).toContain(
      "coverage",
    );
  });
});

describe("suggestionsFor", () => {
  it("offers scenario-wide questions when no situation is open", () => {
    const ids = suggestionsFor(null, []).map((question) => question.id);
    expect(ids).toContain("coverage");
    expect(ids).not.toContain("oldbelief");
  });

  it("adds the open situation's own questions", () => {
    const scoped = usableQuestions().filter(
      (question) => question.scope === VISIBLE_SITUATION,
    );
    const ids = suggestionsFor(VISIBLE_SITUATION, [], 10).map(
      (question) => question.id,
    );
    for (const question of scoped) {
      expect(ids).toContain(question.id);
    }
  });

  it("drops questions already asked", () => {
    const ids = suggestionsFor(null, ["coverage"]).map(
      (question) => question.id,
    );
    expect(ids).not.toContain("coverage");
  });
});

describe("coverageAnswer", () => {
  it("counts what can be shaped instead of asserting a number", () => {
    const allEditable = () => "editable" as Shapeability;
    expect(coverageAnswer(situations, allEditable)).toContain(
      "Every one of them can be shaped here",
    );
  });

  it("reports the split when some patterns have no element detail", () => {
    let call = 0;
    const someMissing = (): Shapeability =>
      call++ < 2 ? "matched_only" : "editable";
    const answer = coverageAnswer(situations, someMissing);
    expect(answer).toContain(`${situations.length - 2} of ${situations.length}`);
    expect(answer).toContain("The other 2");
  });

  it("says where a situation has no pattern at all", () => {
    const answer = coverageAnswer(
      [{ ...situations[0], patternIds: [] }],
      () => "matched_only" as Shapeability,
    );
    expect(answer).toContain("no pattern matched to them");
  });
});

describe("refusalForElement", () => {
  it("is always about the element it was given", () => {
    const proposal = refusalForElement(element, "sit-1", []);
    expect(proposal.why).toContain(element.label);
    expect(proposal.cites).toBe(element.evidence);
  });

  it("names the failure mode when one has been proposed", () => {
    const antiPattern: AntiPattern = {
      id: "ap-1",
      name: "Rubber-stamp checkpoint",
      status: "proposed",
      description: "It becomes a confirm-or-ignore gate.",
      evidence: "Proposed during design exploration.",
      triggeredByElementIds: [element.id],
    };
    expect(refusalForElement(element, "sit-1", [antiPattern]).why).toContain(
      "Rubber-stamp checkpoint",
    );
  });

  it("says so plainly when no failure mode has been named", () => {
    expect(refusalForElement(element, "sit-1", []).why).toContain(
      "No failure mode has been named",
    );
  });

  it("makes the person write a reason before a gap can be accepted", () => {
    const [accept] = refusalForElement(element, "sit-1", []).options;
    expect(accept.reasonPrompt).toBeTruthy();
    expect(accept.applies).toEqual({
      kind: "acceptGapWithReason",
      elementId: element.id,
      situationId: "sit-1",
    });
  });

  it("never offers an option that carries out the removal quietly", () => {
    const kinds = refusalForElement(element, "sit-1", []).options.map(
      (option) => option.applies?.kind,
    );
    expect(kinds).not.toContain("acceptGap");
  });
});

describe("the script itself", () => {
  it("is marked unverified, because the copy is placeholder", () => {
    expect(agentScript.unverified).toBe(true);
  });

  it("gives every proposal exactly one recommended option", () => {
    for (const question of agentScript.questions) {
      const proposal = question.recommendation ?? question.refusal;
      if (!proposal) continue;
      expect(
        proposal.options.filter((option) => option.best).length,
        `${question.id} should mark one option as what the agent would do`,
      ).toBe(1);
    }
  });

  it("states what every option commits the person to", () => {
    for (const question of agentScript.questions) {
      const proposal = question.recommendation ?? question.refusal;
      if (!proposal) continue;
      for (const option of proposal.options) {
        expect(option.commits, `${question.id}: ${option.label}`).toBeTruthy();
      }
    }
  });

  it("scopes every question to a situation that exists, or to the scenario", () => {
    for (const question of agentScript.questions) {
      if (question.scope === "*") continue;
      expect(
        situations.some((situation) => situation.id === question.scope),
        `${question.id} is scoped to ${question.scope}`,
      ).toBe(true);
    }
  });

  it("points every mention at a situation that exists", () => {
    for (const question of agentScript.questions) {
      for (const id of question.mentions ?? []) {
        expect(
          situations.some((situation) => situation.id === id),
          `${question.id} mentions ${id}`,
        ).toBe(true);
      }
    }
  });
});

describe("explainPattern", () => {
  const situation = visibleSituations[0];
  const pattern = getPattern(situation.patternIds[0])!;

  const explain = (
    shapeability: Shapeability = "editable",
    tensions: { label: string; cites: string }[] = [],
  ) => explainPattern({ situation, pattern, shapeability, tensions });

  it("states the match in one line", () => {
    const { verdict } = explain();
    // The number the person sees is the position in the visible list, not the
    // label the content file authored.
    expect(verdict).toBe(
      `${pattern.title} is the match for situation ${displayNumber(situation)}.`,
    );
    expect(verdict.split(". ").length).toBe(1);
  });

  it("takes the why from the content, and never builds it from a fragment", () => {
    const { why } = explain();
    expect(why).toBe(whyThisPattern(situation, pattern).text);
    // The shipped bug: a fragment run into a stem.
    expect(why).not.toContain("has to when");
    expect(why).not.toContain("has to the agent");
    expect(why).not.toContain("has to a short");
  });

  it("keeps what-it-does to two sentences at most", () => {
    const { whatItDoes } = explain();
    expect(whatItDoes.match(/[^.!?]+[.!?]+/g)?.length ?? 1).toBeLessThanOrEqual(
      2,
    );
  });

  it("never puts a participant's name in the message", () => {
    const { verdict, why, whatItDoes, caveats, participants } = explain();
    const shown = [verdict, why, whatItDoes, ...caveats, participants ?? ""].join(
      " ",
    );
    for (const name of pattern.participants?.split(",") ?? []) {
      const bare = name.trim().split(" ")[0];
      if (!bare) continue;
      expect(shown, `leaked ${bare}`).not.toContain(bare);
    }
  });

  it("shows the participant count the way the pattern pages do", () => {
    expect(explain().participants).toBe(
      pattern.participants ? anonymizeParticipants(pattern.participants) : null,
    );
  });

  it("puts the caveat about the match last, always", () => {
    for (const shapeability of [
      "editable",
      "annotated",
      "matched_only",
    ] as Shapeability[]) {
      const { caveats } = explain(shapeability);
      expect(caveats[caveats.length - 1]).toContain("not research");
    }
  });

  it("says where the elements came from when it is not a published model", () => {
    const { caveats } = explain("editable");
    const expected = !pattern.interactionModel;
    expect(
      caveats.some((caveat) => caveat.includes("edit schema in the codebase")),
    ).toBe(expected);
  });

  it("says there is nothing to shape when there is not", () => {
    expect(
      explain("matched_only").caveats.some((caveat) =>
        caveat.includes("nothing to shape here yet"),
      ),
    ).toBe(true);
  });

  it("carries a tension into the caveats with its own citation", () => {
    const { caveats, cites } = explain("editable", [
      { label: "waits for a person", cites: "some.interactionModel" },
    ]);
    expect(caveats.some((caveat) => caveat.includes("waits for a person"))).toBe(
      true,
    );
    expect(cites).toContain("some.interactionModel");
  });

  it("keeps every caveat to one short line", () => {
    for (const caveat of explain("matched_only", [
      { label: "waits for a person", cites: "x" },
    ]).caveats) {
      expect(caveat.match(/[.!?]/g)?.length, caveat).toBe(1);
    }
  });

  it("cites the fields it used", () => {
    const { cites } = explain();
    expect(cites).toContain(pattern.slug);
    expect(cites).toContain(situation.id);
  });
});

describe("openingLine", () => {
  it("counts the situations on screen rather than asserting a number", () => {
    expect(openingLine()).toContain(`${visibleSituations.length} of them`);
  });

  it("says how many are held back, and why, when any are", () => {
    const hidden = situations.length - visibleSituations.length;
    if (hidden === 0) {
      expect(openingLine()).not.toContain("not shown");
      return;
    }
    expect(openingLine()).toContain(`${hidden} more`);
    expect(openingLine()).toContain("has not flagged");
  });

  it("keeps no number in the authored sentence", () => {
    expect(agentScript.opening).not.toMatch(/\b(nine|eight|seven|six|\d)\b/);
  });
});

describe("the answers fragment", () => {
  it("is handed over as written, with no stem attached", () => {
    for (const situation of visibleSituations) {
      expect(answersFragment(situation)).toBe(situation.answers);
    }
  });

  it("would break under a stem, which is why there is not one", () => {
    // Four of the six start with something no stem can precede: a conditional
    // clause, its own subject, or a noun phrase. This records why the helper
    // returns the fragment rather than a sentence.
    const unstemmable = visibleSituations.filter(
      (situation) => !/^[a-z]+(e|t|w|k)?\s/.test(situation.answers) ||
        /^(when|the|a|an)\b/.test(situation.answers),
    );
    expect(unstemmable.length).toBeGreaterThan(0);
  });
});

describe("patternProblem", () => {
  it("uses the library's own statement of the problem where there is one", () => {
    const pattern = getPattern("decision-ledger")!;
    const { text, sourced } = patternProblem(pattern);
    expect(sourced).toBe(true);
    expect(pattern.whatItSolves).toContain(text.replace(/\.$/, ""));
  });

  it("cuts on a sentence boundary, never mid-clause", () => {
    const pattern = getPattern("decision-ledger")!;
    expect(patternProblem(pattern, 1).text).toMatch(/[.!?]$/);
    expect(patternProblem(pattern, 2).text).toMatch(/[.!?]$/);
  });

  it("says the library has nothing rather than composing a reason", () => {
    const pattern = getPattern("convergence-point")!;
    expect(pattern.whatItSolves).toBeUndefined();
    const { text, sourced } = patternProblem(pattern);
    expect(sourced).toBe(false);
    expect(text).toContain("has not written up");
  });

  it("says both the match and its reason are seeded, when they are", () => {
    const seeded = visibleSituations.find((candidate) => candidate.reason)!;
    const { caveats } = explainPattern({
      situation: seeded,
      pattern: getPattern(seeded.patternIds[0])!,
      shapeability: "editable",
      tensions: [],
    });
    expect(caveats[caveats.length - 1]).toContain(
      "both seeded for the demo, not research",
    );
  });

  it("falls back to the library, then to saying nothing is on record", () => {
    const bare = visibleSituations.find(
      (candidate) => candidate.patternIds[0] === "convergence-point",
    )!;
    // Convergence Point has no whatItSolves, so with no seeded reason the
    // line has to say that rather than compose one.
    const { text, source } = whyThisPattern(
      { ...bare, reason: undefined },
      getPattern("convergence-point")!,
    );
    expect(source).toBe("none");
    expect(text).toContain("has not written up");

    const { text: fromLibrary, source: librarySource } = whyThisPattern(
      { ...bare, reason: undefined },
      getPattern("decision-ledger")!,
    );
    expect(librarySource).toBe("library");
    expect(getPattern("decision-ledger")!.whatItSolves).toContain(
      fromLibrary.replace(/\.$/, ""),
    );
  });
});

describe("the seeded reasons", () => {
  it("gives every situation a reason, so flipping the filter finds none missing", () => {
    for (const situation of situations) {
      expect(situation.reason, situation.id).toBeTruthy();
    }
  });

  it("answers the question the row asks, in at most two sentences", () => {
    for (const situation of situations) {
      const reason = situation.reason!;
      expect(reason.match(/[^.!?]+[.!?]/g)?.length, situation.id).toBeLessThanOrEqual(2);
      expect(reason, situation.id).not.toMatch(/[—–]/);
    }
  });

  it("names what the pattern does rather than restating the situation title", () => {
    for (const situation of situations) {
      expect(situation.reason, situation.id).toContain("This is the pattern that");
    }
  });
});
