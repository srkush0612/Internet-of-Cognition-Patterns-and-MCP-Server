import { AUDIENCE_LABEL, CHANNEL_LABEL, LEVEL_LABEL } from "./levels";
import { MODE_PLAIN, getMode } from "./modes";
import type { Level, Pattern } from "./types";

/** Answers Studio questions from the selected catalog entry without changing it. */
export function answerStudioPatternQuestion(pattern: Pattern, question: string, fit?: {
  context: string;
  highlight: string;
  notice?: string;
}): string {
  const text = question.toLowerCase().trim();
  const responses = pattern.responses ?? getMode(pattern.mode.primary).responses;
  const triggers = pattern.triggers.join("; ");

  if (/\b(why|fit|relevant|recommend|suggest|match)\b/.test(text) && /\b(my|this|here|use case|situation|pattern)\b/.test(text)) {
    return fit?.context === "Chosen directly from the catalog"
      ? `You opened ${pattern.name} directly from the catalog, so I don't have a use case to compare. What it enables: ${fit.highlight} Its agent move is to ${MODE_PLAIN[pattern.mode.primary]}.`
      : `${pattern.name} was suggested for ${fit?.context ?? "your situation"}. ${fit?.highlight ?? pattern.whatItSolves ?? pattern.summary} ${fit?.notice ?? ""}`.trim();
  }

  if (/\b(when|trigger|timing|appear|show up|surface)\b/.test(text)) {
    return `It appears when ${triggers || "the situation described by the pattern occurs"}. The preview shows how the interaction sits in ${pattern.channels.map((channel) => CHANNEL_LABEL[channel]).join(" or ")}.`;
  }

  if (/\b(what can|choice|choices|option|respond|response|approve|reject|defer|undo)\b/.test(text)) {
    return `The catalog behavior lets the receiver ${naturalList(responses)}. The preview illustrates those options; any control shown there only acts if that preview implements it.`;
  }

  if (/\b(who|audience|person|people|agent|team|participant|receiver)\b/.test(text) && !/\b(what does the agent|agent do)\b/.test(text)) {
    const dimensions = (["L1", "L2", "L3", "L4"] as Level[])
      .filter((level) => level === pattern.level.primary || level in pattern.level.notes)
      .map((level) => `${LEVEL_LABEL[level]}: ${pattern.level.notes[level] ?? "applies"}`);
    return `The intended receiver is ${naturalList(pattern.audience.map((audience) => AUDIENCE_LABEL[audience].toLowerCase()))}. ${dimensions.join("; ")}.`;
  }

  if (/\b(where|channel|view|chat|settings|shared ui|record)\b/.test(text)) {
    return `The catalog shows this pattern in ${naturalList(pattern.channels.map((channel) => CHANNEL_LABEL[channel]))}. Each view places the behavior in its own surface.`;
  }

  if (/\b(how|work|sequence|step|agent do|behavior|interaction)\b/.test(text)) {
    if (pattern.interactionSteps?.length) {
      return pattern.interactionSteps.map((step, index) => `${index + 1}. ${step.title}: ${step.description}`).join("\n");
    }
    return pattern.interactionModel ?? pattern.spec;
  }

  if (/\b(example|scenario|sample)\b/.test(text)) {
    return pattern.example ?? `The canvas shows the catalog example for ${pattern.name}. Its authored trigger is ${triggers || "described in the behavior spec"}.`;
  }

  if (/\b(spec|sentence|definition|mean|solve|problem|purpose|why)\b/.test(text)) {
    return `${pattern.whatItSolves ?? pattern.summary}\n\nAuthored behavior: ${pattern.spec}`;
  }

  return `I can clarify when ${pattern.name} appears, how the interaction works, who receives it, what they can do, or why it fits your situation. Which part would you like to explore?`;
}

function naturalList(items: string[]): string {
  if (!items.length) return "the intended recipient";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

