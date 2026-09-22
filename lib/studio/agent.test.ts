import { describe, expect, it } from "vitest";
import {
  agentScript,
  coverageAnswer,
  matchQuestion,
  refusalForElement,
  suggestionsFor,
} from "@/lib/studio/agent";
import { situations } from "@/lib/studio/content";
import type { AntiPattern, PatternElement, Shapeability } from "@/lib/studio/types";

const element: PatternElement = {
  id: "el-1",
  patternId: "some-pattern",
  label: "A way to correct the interpretation",
  hint: "Lets the person fix what the agent got wrong.",
  required: true,
  evidence: "Published interaction model: 'confirm, correct, or defer.'",
};

describe("matchQuestion", () => {
  it("matches on a keyword anywhere in the typed text", () => {
    expect(matchQuestion("which one should I do first?", [])?.id).toBe("first");
  });

  it("skips a question that has already been answered", () => {
    expect(matchQuestion("what should I do first", ["first"])).toBeNull();
  });

  it("returns null rather than guessing when nothing matches", () => {
    expect(matchQuestion("what is the weather like", [])).toBeNull();
  });

  it("has a fallback to use when it returns null", () => {
    expect(agentScript.fallback).toContain("scripted");
  });
});

describe("suggestionsFor", () => {
  it("offers scenario-wide questions when no situation is open", () => {
    const ids = suggestionsFor(null, []).map((question) => question.id);
    expect(ids).toContain("first");
    expect(ids).not.toContain("correction");
  });

  it("adds the open situation's own questions", () => {
    const ids = suggestionsFor("triage-proposes-before-touching", [], 10).map(
      (question) => question.id,
    );
    expect(ids).toContain("correction");
    expect(ids).toContain("first");
  });

  it("drops questions already asked", () => {
    const ids = suggestionsFor(null, ["first"]).map((question) => question.id);
    expect(ids).not.toContain("first");
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
});
