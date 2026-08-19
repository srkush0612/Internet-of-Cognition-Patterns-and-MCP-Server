import type { ComponentDefinition } from "@/lib/pattern-advisor";

const HOW_TO_USE_LIMIT = 280;

function getSectionContent(
  component: ComponentDefinition,
  title: string,
): string | undefined {
  return component.ui.text.sections.find((section) => section.title === title)
    ?.content;
}

function trimText(text: string, limit: number): string {
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit - 1)}…`;
}

export function getHowToUseText(component: ComponentDefinition): string {
  const interaction =
    getSectionContent(component, "Interaction") ??
    getSectionContent(component, "What it solves") ??
    component.metadata.description;

  return trimText(interaction.trim(), HOW_TO_USE_LIMIT);
}

function toActionItem(sentence: string): string | null {
  let cleaned = sentence
    .trim()
    .replace(/^[-•*\d.]+\s*/, "")
    .replace(/\s+/g, " ");

  if (cleaned.length < 15 || cleaned.length > 140) {
    return null;
  }

  cleaned = cleaned.replace(
    /^(Before an action commits,|When|If|The|On commit|While|Later readers)\s+/i,
    "",
  );

  if (/^the agent/i.test(cleaned)) {
    cleaned = cleaned.replace(/^the agent\s+/i, "Have the agent ");
  } else if (/^the operator/i.test(cleaned)) {
    cleaned = cleaned.replace(/^the operator\s+/i, "");
  } else if (/^users?/i.test(cleaned)) {
    cleaned = cleaned.replace(/^users?\s+/i, "");
  }

  cleaned = cleaned.replace(/[.!?]+$/, "");

  const imperative = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  if (imperative.length < 12 || imperative.length > 90) {
    return null;
  }

  return imperative;
}

export function extractNextSteps(component: ComponentDefinition): string[] {
  const interaction = getSectionContent(component, "Interaction") ?? "";
  const solves = getSectionContent(component, "What it solves") ?? "";
  const candidates: string[] = [];

  for (const source of [interaction, solves, component.metadata.description]) {
    for (const part of source.split(/(?<=[.!?])\s+|;\s+/)) {
      const action = toActionItem(part);
      if (action && !candidates.some((existing) => existing === action)) {
        candidates.push(action);
      }
    }
  }

  if (candidates.length < 3) {
    const slug = component.metadata.slug;
    const fallbacks: Record<string, string[]> = {
      "decision-ledger": [
        "Record the decision and rationale",
        "Add supporting evidence",
        "Capture alternatives considered",
        "Seal the record on commit",
      ],
      "convergence-point": [
        "Define agent positions",
        "Map evidence for each position",
        "Mark convergence points",
        "Document the adopted answer",
      ],
    };

    for (const item of fallbacks[slug] ?? []) {
      if (!candidates.includes(item)) {
        candidates.push(item);
      }
    }
  }

  return candidates.slice(0, 4);
}
