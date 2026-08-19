import type { ComponentDefinition } from "@/server/mcp-server";

export type { ComponentDefinition };

export type PatternRecommendation = {
  pattern: {
    name: string;
    slug: string;
    description: string;
  };
  reason: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
  fullComponent: ComponentDefinition;
};

export type ChatRecommendation = {
  pattern: {
    name: string;
    slug: string;
  };
  reason: string;
  confidence: "high" | "medium" | "low";
  explanation: string;
  fullComponent: ComponentDefinition;
  uiSections: ComponentDefinition["ui"]["text"]["sections"];
};

export function toChatRecommendation(
  recommendation: PatternRecommendation,
): ChatRecommendation {
  return {
    pattern: {
      name: recommendation.pattern.name,
      slug: recommendation.pattern.slug,
    },
    reason: recommendation.reason,
    confidence: recommendation.confidence,
    explanation: recommendation.explanation,
    fullComponent: recommendation.fullComponent,
    uiSections: recommendation.fullComponent.ui.text.sections,
  };
}

type DiscoverResult = {
  name: string;
  slug: string;
  description: string;
  backingStrength?: string;
};

export const PATTERN_FOLLOW_UPS: Record<string, string[]> = {
  "decision-ledger": [
    "What evidence supports this decision?",
    "Who are the stakeholders?",
    "What alternatives did you consider?",
  ],
  "assumption-surface": [
    "Which assumptions are shared vs. agent-specific?",
    "What context is each agent missing?",
    "Which assumption would change the outcome if corrected?",
  ],
  "convergence-point": [
    "Where do the agents disagree?",
    "What was adopted vs. flagged as impasse?",
    "Who needs to sign off on the resolution?",
  ],
  "background-work-ledger": [
    "What happened while you were away?",
    "Which steps were automated vs. human-approved?",
    "What assumptions did the agent make along the way?",
  ],
  "signal-to-intent-handshake": [
    "What signal triggered this interpretation?",
    "What would change your confidence level?",
    "What irreversible action is being proposed?",
  ],
  "presence-boundary": [
    "What is the agent allowed to touch right now?",
    "Should the agent pause or narrow its scope?",
    "What state is the agent in: idle, observing, or acting?",
  ],
};

function confidenceFromIndex(
  index: number,
  backingStrength?: string,
): PatternRecommendation["confidence"] {
  if (index === 0 && backingStrength === "Strong") return "high";
  if (index === 0) return "high";
  if (index <= 2) return "medium";
  return "low";
}

function getSectionContent(
  component: ComponentDefinition,
  title: string,
): string | undefined {
  return component.ui.text.sections.find((section) => section.title === title)
    ?.content;
}

function buildExplanation(
  userInput: string,
  component: ComponentDefinition,
): string {
  const need = userInput.trim();
  const solution = component.metadata.description;
  const keyFeatures =
    getSectionContent(component, "What it solves") ??
    getSectionContent(component, "Interaction") ??
    solution;
  const practicalUse =
    getSectionContent(component, "Example") ??
    getSectionContent(component, "Pattern") ??
    `apply ${component.metadata.name} in your agent workflow`;

  return [
    `This pattern helps because: "${need}" → ${component.metadata.name} addresses this by ${solution.charAt(0).toLowerCase()}${solution.slice(1)}`,
    `The pattern provides: ${keyFeatures}`,
    `Your team would use it to: ${practicalUse.charAt(0).toLowerCase()}${practicalUse.slice(1)}`,
  ].join(" ");
}

async function discoverPatternMetadata(
  userInput: string,
): Promise<DiscoverResult[]> {
  if (typeof window === "undefined") {
    const { discoverComponents } = await import("@/server/mcp-server");
    return discoverComponents(userInput);
  }

  const response = await fetch("/api/patterns/discover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: userInput }),
  });

  if (!response.ok) {
    throw new Error("Failed to discover patterns");
  }

  const data = (await response.json()) as { results: DiscoverResult[] };
  return data.results ?? [];
}

async function fetchFullComponent(
  slug: string,
): Promise<ComponentDefinition | null> {
  try {
    if (typeof window === "undefined") {
      const { fetchComponent } = await import("@/server/mcp-server");
      return fetchComponent(slug);
    }

    const response = await fetch(`/api/patterns/${slug}`);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      success?: boolean;
      component?: ComponentDefinition;
    };

    return data.component ?? null;
  } catch {
    return null;
  }
}

async function buildRecommendation(
  userInput: string,
  result: DiscoverResult,
  index: number,
): Promise<PatternRecommendation | null> {
  const fullComponent = await fetchFullComponent(result.slug);
  if (!fullComponent) {
    console.warn(`Human Agent IoC Patterns: failed to fetch full component for ${result.slug}`);
    return null;
  }

  const explanation = buildExplanation(userInput, fullComponent);

  return {
    pattern: {
      name: fullComponent.metadata.name,
      slug: fullComponent.metadata.slug,
      description: fullComponent.metadata.description,
    },
    reason: `This pattern solves: ${fullComponent.metadata.description}. It's a good fit for your use case.`,
    explanation,
    confidence: confidenceFromIndex(
      index,
      fullComponent.metadata.backingStrength,
    ),
    fullComponent,
  };
}

export async function recommendPatterns(
  userInput: string,
): Promise<PatternRecommendation[]> {
  try {
    const results = await discoverPatternMetadata(userInput);

    const recommendations = await Promise.all(
      results.map((result, index) =>
        buildRecommendation(userInput, result, index),
      ),
    );

    return recommendations.filter(
      (recommendation): recommendation is PatternRecommendation =>
        recommendation !== null,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to recommend patterns";
    throw new Error(message);
  }
}

export async function instantiateAndTrack(
  slug: string,
  agentId: string,
  initialState: Record<string, unknown>,
): Promise<{ instanceId: string; instance: Record<string, unknown> }> {
  const response = await fetch("/api/instances", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "instantiate",
      slug,
      initial_state: initialState,
      agent_id: agentId,
      persistent: true,
    }),
  });

  const data = (await response.json()) as {
    success?: boolean;
    instance?: { instanceId: string; state?: Record<string, unknown> };
    error?: string;
  };

  if (!response.ok || !data.success || !data.instance) {
    throw new Error(data.error ?? "Failed to instantiate pattern");
  }

  return {
    instanceId: data.instance.instanceId,
    instance: data.instance as Record<string, unknown>,
  };
}

export function suggestFollowUpQuestions(pattern: {
  name: string;
  slug: string;
}): string[] {
  return (
    PATTERN_FOLLOW_UPS[pattern.slug] ?? [
      `How would ${pattern.name} fit into your current workflow?`,
      "What outcome are you trying to achieve?",
      "Who else needs visibility into this?",
    ]
  );
}
