import { AUDIENCE_LABEL, CHANNEL_LABEL, LEVEL_LABEL } from "./levels";
import { MODE_LABEL, getMode } from "./modes";
import { reachableLevels } from "./simulator";
import type { SpecDraft } from "./spec";
import type { Pattern } from "./types";

export type StudioMatch = {
  pattern: Pattern;
  score: number;
  differences: string[];
  reasons: string[];
};

const STOPWORDS = new Set([
  "about", "after", "agent", "agents", "before", "could", "from", "into",
  "need", "needs", "person", "something", "that", "their", "them", "this",
  "step", "steps", "task", "when", "with", "work", "working", "would",
]);

function words(value: string): string[] {
  return [...new Set(value.toLowerCase().match(/[a-z]{4,}/g) ?? [])]
    .filter((word) => !STOPWORDS.has(word));
}

/** Catalog matching for Studio. The trigger and description rank fits; they
 * never silently exclude a pattern because their wording is free form. */
export function rankStudioPatterns(
  draft: SpecDraft,
  catalog: Pattern[],
  description = "",
): { exact: StudioMatch[]; near: StudioMatch[] } {
  const query = words(`${draft.trigger} ${description}`);
  const ranked = catalog.map((pattern): StudioMatch => {
    const differences: string[] = [];
    const reasons: string[] = [];
    let score = 0;

    if (draft.mode) {
      if (pattern.mode.primary === draft.mode) {
        reasons.push(`${MODE_LABEL[draft.mode]} is its primary action`);
        score += 10;
      } else {
        differences.push(`uses ${MODE_LABEL[pattern.mode.primary].toLowerCase()} as its primary action`);
      }
    }
    if (draft.level) {
      if (reachableLevels(pattern).includes(draft.level)) {
        reasons.push(`works with ${LEVEL_LABEL[draft.level].toLowerCase()}`);
        score += pattern.level.primary === draft.level ? 8 : 6;
      } else {
        differences.push(`does not cover ${LEVEL_LABEL[draft.level].toLowerCase()}`);
      }
    }
    if (draft.audience) {
      if (pattern.audience.includes(draft.audience)) {
        reasons.push(`reaches ${AUDIENCE_LABEL[draft.audience].toLowerCase()}`);
        score += 7;
      } else {
        differences.push(`does not target ${AUDIENCE_LABEL[draft.audience].toLowerCase()}`);
      }
    }
    if (draft.channel) {
      if (pattern.channels.includes(draft.channel)) {
        reasons.push(`appears in ${CHANNEL_LABEL[draft.channel].toLowerCase()}`);
        score += 7;
      } else {
        differences.push(`does not use ${CHANNEL_LABEL[draft.channel].toLowerCase()}`);
      }
    }
    if (draft.responses.length) {
      const supported = pattern.responses ?? getMode(pattern.mode.primary).responses;
      const missing = draft.responses.filter((response) =>
        !supported.includes(response),
      );
      if (missing.length === 0) {
        reasons.push("supports your chosen responses");
        score += 7;
      } else {
        differences.push(`does not offer ${missing.join(", ")}`);
      }
    }

    const searchable = [
      pattern.name, pattern.summary, pattern.whatItSolves ?? "",
      pattern.example ?? "", ...pattern.triggers,
    ].join(" ").toLowerCase();
    const relevant = query.filter((word) => searchable.includes(word)).length;
    score += relevant * 2;
    if (relevant) reasons.push("speaks to your trigger or description");

    return { pattern, score, differences, reasons };
  });

  ranked.sort((a, b) =>
    a.differences.length - b.differences.length ||
    b.score - a.score ||
    a.pattern.name.localeCompare(b.pattern.name),
  );
  return {
    exact: ranked.filter((match) => match.differences.length === 0),
    near: ranked.filter((match) => match.differences.length > 0).slice(0, 3),
  };
}
