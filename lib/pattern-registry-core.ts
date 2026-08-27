import { patterns, type Pattern } from "@/lib/patterns";
import { anonymizeParticipants } from "@/lib/evidence-privacy";

export type BackingStrength = "Strong" | "Moderate" | "Thin" | "None";

export type ComponentMetadata = {
  name: string;
  slug: string;
  version: string;
  triggers: string[];
  description: string;
  category?: string;
  backingStrength?: BackingStrength;
  participants?: string;
  evidence_count?: number;
};

export type ComponentDefinition = {
  metadata: ComponentMetadata;
  behavior: {
    stateSchema: Record<string, unknown>;
    handlers: Array<{ name: string; description: string }>;
  };
  ui: {
    text: {
      sections: Array<{
        title: string;
        content: string;
        type: "field" | "status";
      }>;
    };
  };
};

export function buildComponentFromPattern(pattern: Pattern): ComponentDefinition {
  const triggers = [
    pattern.slug.replace(/-/g, " "),
    pattern.title.toLowerCase(),
    pattern.explanation.split(" ").slice(0, 3).join(" ").toLowerCase(),
  ];

  return {
    metadata: {
      name: pattern.title,
      slug: pattern.slug,
      version: "1.0.0",
      triggers,
      description: pattern.explanation,
      backingStrength: pattern.backingStrength,
      participants: pattern.participants
        ? anonymizeParticipants(pattern.participants)
        : undefined,
      evidence_count: pattern.evidence?.length || 0,
    },
    behavior: {
      stateSchema: {
        pattern_slug: { type: "string", description: "Pattern identifier" },
        title: { type: "string", description: "What we are deciding/doing" },
        description: { type: "string", description: "Context and reasoning" },
        evidence: {
          type: "array",
          description: "Supporting sources or quotes",
        },
        context: {
          type: "string",
          description: "Operator or participant context",
        },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
      },
      handlers: [
        { name: "instantiate", description: "Create new instance of this pattern" },
        { name: "updateState", description: "Modify instance state" },
        { name: "handoffTo", description: "Transfer to another pattern/agent" },
      ],
    },
    ui: {
      text: {
        sections: [
          { title: "Pattern", content: pattern.title, type: "field" },
          {
            title: "What it solves",
            content: pattern.whatItSolves || pattern.explanation,
            type: "field",
          },
          ...(pattern.interactionModel
            ? [
                {
                  title: "Interaction",
                  content: pattern.interactionModel,
                  type: "field" as const,
                },
              ]
            : []),
          { title: "Example", content: pattern.example, type: "field" },
          {
            title: "Backing",
            content: `${pattern.backingStrength || "Unknown"} (${pattern.participants ? anonymizeParticipants(pattern.participants) : "Research"})`,
            type: "status" as const,
          },
          {
            title: "Evidence",
            content: `${pattern.evidence?.length || 0} sources`,
            type: "status" as const,
          },
        ],
      },
    },
  };
}

let registryCache: Map<string, ComponentDefinition> | null = null;

export function getPatternRegistry(): Map<string, ComponentDefinition> {
  if (!registryCache) {
    registryCache = new Map(
      patterns.map((pattern) => [
        pattern.slug,
        buildComponentFromPattern(pattern),
      ]),
    );
  }
  return registryCache;
}

export function discoverComponents(query: string): ComponentMetadata[] {
  const normalizedQuery = query.toLowerCase();
  const results: Array<ComponentMetadata & { _score?: number }> = [];

  for (const component of getPatternRegistry().values()) {
    let score = 0;
    const { metadata } = component;

    if (
      metadata.triggers.some((trigger) =>
        normalizedQuery.includes(trigger.toLowerCase()),
      )
    ) {
      score += 10;
    }

    if (
      metadata.triggers.some((trigger) =>
        trigger.toLowerCase().includes(normalizedQuery),
      )
    ) {
      score += 5;
    }

    if (metadata.name.toLowerCase().includes(normalizedQuery)) {
      score += 3;
    }

    if (metadata.description.toLowerCase().includes(normalizedQuery)) {
      score += 1;
    }

    if (score > 0) {
      results.push({ ...metadata, _score: score });
    }
  }

  return results
    .sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
    .map(({ _score: _, ...rest }) => rest);
}

export function fetchComponent(slug: string): ComponentDefinition | null {
  return getPatternRegistry().get(slug) ?? null;
}

export function createLocalInstance(
  slug: string,
  initialState: Record<string, unknown> = {},
): { instanceId: string; state: Record<string, unknown> } {
  const now = new Date().toISOString();
  return {
    instanceId: `${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    state: {
      pattern_slug: slug,
      ...initialState,
      createdAt: now,
      updatedAt: now,
    },
  };
}

export function mergeLocalInstanceState(
  state: Record<string, unknown>,
  updates: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...state,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/** True when fetch returned HTML (static host) instead of JSON API. */
export function isHtmlResponse(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith("<!") || trimmed.startsWith("<html");
}

const FETCH_TIMEOUT_MS = 4000;

async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function postJson<T>(
  url: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false }> {
  if (typeof window === "undefined") {
    return { ok: false };
  }

  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    if (isHtmlResponse(text) || !response.ok) {
      return { ok: false };
    }
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false };
  }
}

export async function getJson<T>(
  url: string,
): Promise<{ ok: true; data: T } | { ok: false }> {
  if (typeof window === "undefined") {
    return { ok: false };
  }

  try {
    const response = await fetchWithTimeout(url);
    const text = await response.text();
    if (isHtmlResponse(text) || !response.ok) {
      return { ok: false };
    }
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false };
  }
}
