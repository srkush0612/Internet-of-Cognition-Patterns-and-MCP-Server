import type { ChatRecommendation } from "@/lib/pattern-advisor";
import { extractAgents } from "@/components/patterns/edit/convergence-point-extractor";
import { getPattern } from "@/lib/patterns";

function countAgentsInInput(userInput: string): number {
  return extractAgents(userInput).length;
}

function sentenceBullets(text: string, max = 3): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 12)
    .slice(0, max);
}

/**
 * Build “Why this pattern?” bullets for the recommendation card.
 */
export function buildRecommendationReasons(
  userInput: string,
  recommendation: ChatRecommendation,
): string[] {
  const reasons: string[] = [];
  const agentCount = countAgentsInInput(userInput);
  const input = userInput.toLowerCase();

  if (agentCount >= 2) {
    reasons.push(
      `${agentCount} agents with different positions`,
    );
  }

  if (/\b(disagree|conflict|vs\.?|versus|debate|split|tension)\b/i.test(input)) {
    reasons.push("Clear disagreement detected");
  }

  if (
    /\b(decided|resolved|approved|converged|adopted|outcome|resolution)\b/i.test(
      input,
    )
  ) {
    reasons.push("Shows how conflict was resolved");
  }

  if (/\b(decision|reasoning|rationale|why we chose)\b/i.test(input)) {
    reasons.push("Captures decision reasoning for audit");
  }

  if (/\b(assumption|assume|believed|context missing)\b/i.test(input)) {
    reasons.push("Surfaces hidden assumptions behind disagreement");
  }

  if (/\b(credential|permission|scope|boundary|access)\b/i.test(input)) {
    reasons.push("Multi-agent setup implies capability boundaries");
  }

  if (recommendation.confidence === "high" && reasons.length < 3) {
    reasons.push("Strong match for your described scenario");
  }

  if (reasons.length < 2) {
    reasons.push(...sentenceBullets(recommendation.reason, 2));
  }

  if (reasons.length < 2) {
    reasons.push(...sentenceBullets(recommendation.explanation, 2));
  }

  const unique: string[] = [];
  for (const reason of reasons) {
    const normalized = reason.toLowerCase();
    if (!unique.some((existing) => existing.toLowerCase() === normalized)) {
      unique.push(reason);
    }
  }

  return unique.slice(0, 4);
}

/**
 * Practitioner quote for the recommendation card evidence block.
 */
export function buildRecommendationEvidence(slug: string): string {
  const pattern = getPattern(slug);
  if (!pattern) {
    return "Practitioners use this when the scenario needs structured visibility.";
  }

  const evidenceQuote = pattern.evidence?.[0]?.quote?.trim();
  if (evidenceQuote) {
    const trimmed =
      evidenceQuote.length > 160
        ? `${evidenceQuote.slice(0, 157)}…`
        : evidenceQuote;
    return trimmed;
  }

  if (pattern.example?.trim()) {
    return pattern.example.trim();
  }

  return pattern.oneliner || pattern.explanation;
}
