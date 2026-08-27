import {
  createLocalInstance,
  discoverComponents,
  fetchComponent,
  mergeLocalInstanceState,
  postJson,
  type ComponentDefinition,
} from "@/lib/pattern-registry-core";

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

export function buildAiResponse(recommendations: ChatRecommendation[]): string {
  if (recommendations.length === 0) {
    return "I couldn't find a strong pattern match for that yet. Try describing the problem in more detail — for example, tracking decisions, surfacing assumptions, or resolving agent disagreement.";
  }

  const top = recommendations[0];
  return `I recommend ${top.pattern.name}. ${top.explanation} Below you can see the full pattern details and try it out.`;
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
  return discoverComponents(userInput);
}

async function fetchFullComponent(
  slug: string,
): Promise<ComponentDefinition | null> {
  return fetchComponent(slug);
}

async function buildRecommendation(
  userInput: string,
  result: DiscoverResult,
  index: number,
): Promise<PatternRecommendation | null> {
  const fullComponent = await fetchFullComponent(result.slug);
  if (!fullComponent) {
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
}

export async function instantiatePattern(
  slug: string,
  agentId: string,
  initialState: Record<string, unknown>,
): Promise<{ instanceId: string; instance: Record<string, unknown>; component: ComponentDefinition }> {
  const component = await fetchFullComponent(slug);
  if (!component) {
    throw new Error(`Pattern not found: ${slug}`);
  }

  if (typeof window !== "undefined") {
    const api = await postJson<{
      success?: boolean;
      instance?: { instanceId: string; state?: Record<string, unknown> };
    }>("/api/instances", {
      action: "instantiate",
      slug,
      initial_state: initialState,
      agent_id: agentId,
      persistent: true,
    });

    if (api.ok && api.data.success && api.data.instance) {
      return {
        instanceId: api.data.instance.instanceId,
        instance:
          (api.data.instance.state as Record<string, unknown>) ??
          (api.data.instance as unknown as Record<string, unknown>),
        component,
      };
    }
  }

  const local = createLocalInstance(slug, initialState);
  return { instanceId: local.instanceId, instance: local.state, component };
}

export async function updatePatternInstance(
  instanceId: string,
  currentState: Record<string, unknown>,
  updates: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (typeof window !== "undefined") {
    const api = await postJson<{
      success?: boolean;
      instance?: { state?: Record<string, unknown> };
    }>("/api/instances", {
      action: "update",
      instance_id: instanceId,
      updates,
    });

    if (api.ok && api.data.success && api.data.instance?.state) {
      return api.data.instance.state;
    }
  }

  return mergeLocalInstanceState(currentState, updates);
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
