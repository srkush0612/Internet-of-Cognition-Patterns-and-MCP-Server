/**
 * IoC Pattern Library MCP Server (No Anthropic Dependency)
 * 
 * This is the pure registry and tool infrastructure.
 * No demo, no external dependencies, just the core.
 * 
 * Usage:
 * - Import these functions and registry
 * - Call the tools directly from agents/APIs
 * - Or wrap in Express/HTTP if you want a service
 */

import { patterns, type Pattern } from "../lib/patterns";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type BackingStrength = "Strong" | "Moderate" | "Thin" | "None";

interface ComponentMetadata {
  name: string;
  slug: string;
  version: string;
  triggers: string[];
  description: string;
  category?: string;
  backingStrength?: BackingStrength;
  participants?: string;
  evidence_count?: number;
}

interface ComponentDefinition {
  metadata: ComponentMetadata;
  behavior: {
    stateSchema: Record<string, unknown>;
    handlers: Array<{
      name: string;
      description: string;
    }>;
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
}

interface ComponentInstance {
  instanceId: string;
  slug: string;
  state: Record<string, unknown>;
  createdAt: string;
  lastModified: string;
  agentId?: string;
  persistent: boolean;
}

interface Installation {
  componentSlug: string;
  agentId: string;
  installedAt: string;
  instanceIds: string[];
  version: string;
}

// =============================================================================
// REGISTRY & STORAGE
// =============================================================================

const componentRegistry: Map<string, ComponentDefinition> = new Map();
const instances: Map<string, ComponentInstance> = new Map();
const installations: Map<string, Installation[]> = new Map();

// =============================================================================
// INITIALIZE REGISTRY (reads from lib/patterns.ts)
// =============================================================================

function initializeRegistry() {
  console.log("📚 Importing patterns from lib/patterns.ts...\n");

  for (const pattern of patterns) {
    // Generate triggers from slug, title, explanation
    const triggers = [
      pattern.slug.replace(/-/g, " "),
      pattern.title.toLowerCase(),
      pattern.explanation.split(" ").slice(0, 3).join(" ").toLowerCase(),
    ];

    const component: ComponentDefinition = {
      metadata: {
        name: pattern.title,
        slug: pattern.slug,
        version: "1.0.0",
        triggers,
        description: pattern.explanation,
        backingStrength: pattern.backingStrength,
        participants: pattern.participants,
        evidence_count: pattern.evidence?.length || 0,
      },
      behavior: {
        stateSchema: {
          pattern_slug: { type: "string", description: "Pattern identifier" },
          title: { type: "string", description: "What we are deciding/doing" },
          description: { type: "string", description: "Context and reasoning" },
          backingStrength: {
            type: "string",
            description: "Strong, Moderate, Thin, or None",
          },
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
          {
            name: "instantiate",
            description: "Create new instance of this pattern",
          },
          {
            name: "updateState",
            description: "Modify instance state",
          },
          {
            name: "handoffTo",
            description: "Transfer to another pattern/agent",
          },
        ],
      },
      ui: {
        text: {
          sections: [
            {
              title: "Pattern",
              content: pattern.title,
              type: "field",
            },
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
            {
              title: "Example",
              content: pattern.example,
              type: "field",
            },
            {
              title: "Backing",
              content: `${pattern.backingStrength || "Unknown"} (${pattern.participants || "Research"})`,
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

    componentRegistry.set(pattern.slug, component);
    console.log(`✓ Registered: ${pattern.title} (${pattern.slug})`);
  }

  console.log(
    `\n✅ Registry initialized with ${componentRegistry.size} patterns\n`
  );
}

// =============================================================================
// TOOL IMPLEMENTATIONS
// =============================================================================

export function discoverComponents(
  query: string,
  context?: Record<string, unknown>
): ComponentMetadata[] {
  const normalizedQuery = query.toLowerCase();
  const results: ComponentMetadata[] = [];

  for (const component of componentRegistry.values()) {
    let score = 0;

    // Exact trigger match
    if (
      component.metadata.triggers.some((t) =>
        normalizedQuery.includes(t.toLowerCase())
      )
    ) {
      score += 10;
    }

    // Partial trigger match
    if (
      component.metadata.triggers.some((t) =>
        t.toLowerCase().includes(normalizedQuery)
      )
    ) {
      score += 5;
    }

    // Name match
    if (component.metadata.name.toLowerCase().includes(normalizedQuery)) {
      score += 3;
    }

    // Description match
    if (
      component.metadata.description.toLowerCase().includes(normalizedQuery)
    ) {
      score += 1;
    }

    if (score > 0) {
      results.push({
        ...component.metadata,
        _score: score,
      } as any);
    }
  }

  return results
    .sort((a, b) => ((b as any)._score || 0) - ((a as any)._score || 0))
    .map((r) => {
      const { _score, ...rest } = r as any;
      return rest;
    });
}

export function fetchComponent(slug: string): ComponentDefinition | null {
  return componentRegistry.get(slug) || null;
}

export function instantiateComponent(
  slug: string,
  initialState: Record<string, unknown> = {},
  agentId?: string,
  persistent: boolean = false
): ComponentInstance | null {
  const component = componentRegistry.get(slug);
  if (!component) return null;

  const instanceId = `${slug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const instance: ComponentInstance = {
    instanceId,
    slug,
    state: {
      pattern_slug: slug,
      ...initialState,
      createdAt: now,
      updatedAt: now,
    },
    createdAt: now,
    lastModified: now,
    agentId,
    persistent,
  };

  instances.set(instanceId, instance);

  // Track installation
  if (agentId) {
    const key = `${slug}-${agentId}`;
    if (!installations.has(key)) {
      installations.set(key, []);
    }
    const inst = installations.get(key)!;
    if (
      !inst.find((i) => i.componentSlug === slug && i.agentId === agentId)
    ) {
      inst.push({
        componentSlug: slug,
        agentId,
        installedAt: now,
        instanceIds: [instanceId],
        version: component.metadata.version,
      });
    } else {
      inst.find((i) => i.componentSlug === slug && i.agentId === agentId)!
        .instanceIds.push(instanceId);
    }
  }

  return instance;
}

export function updateInstanceState(
  instanceId: string,
  updates: Record<string, unknown>
): ComponentInstance | null {
  const instance = instances.get(instanceId);
  if (!instance) return null;

  instance.state = { ...instance.state, ...updates };
  instance.lastModified = new Date().toISOString();
  instances.set(instanceId, instance);

  return instance;
}

export function getInstanceState(instanceId: string): ComponentInstance | null {
  return instances.get(instanceId) || null;
}

export function listInstallations(agentId?: string): Installation[] {
  if (agentId) {
    const results: Installation[] = [];
    for (const [key, inst] of installations.entries()) {
      if (key.includes(agentId)) {
        results.push(...inst);
      }
    }
    return results;
  }
  return Array.from(installations.values()).flat();
}

export function brokerStateHandoff(
  fromInstanceId: string,
  toComponentSlug: string,
  toAgentId: string,
  contextData?: Record<string, unknown>
): ComponentInstance | null {
  const fromInstance = instances.get(fromInstanceId);
  if (!fromInstance) return null;

  const inheritedState = {
    ...contextData,
    _handoffFrom: fromInstanceId,
    _handoffTimestamp: new Date().toISOString(),
  };

  const toInstance = instantiateComponent(
    toComponentSlug,
    inheritedState,
    toAgentId,
    true
  );

  if (toInstance) {
    console.log(
      `[HANDOFF] ${fromInstanceId} → ${toInstance.instanceId} (${toComponentSlug})`
    );
  }

  return toInstance;
}

// =============================================================================
// EXPORTS & SETUP
// =============================================================================

// Initialize registry on module load
initializeRegistry();

// Export everything for use
export {
  componentRegistry,
  instances,
  installations,
  type ComponentDefinition,
  type ComponentInstance,
  type ComponentMetadata,
  type Installation,
};

// =============================================================================
// EXAMPLE USAGE (uncomment to test)
// =============================================================================

/*

import {
  discoverComponents,
  fetchComponent,
  instantiateComponent,
  updateInstanceState,
  brokerStateHandoff,
  listInstallations,
} from "./mcp-server";

// Discover a pattern
const patterns = discoverComponents("record decision");
console.log("Discovered:", patterns);

// Fetch full definition
const component = fetchComponent("decision-ledger");
console.log("Component:", component?.metadata.name);

// Instantiate
const instance = instantiateComponent(
  "decision-ledger",
  {
    title: "OAuth vs API Keys",
    description: "Choosing auth strategy",
  },
  "agent-auth-team",
  true
);
console.log("Instance created:", instance?.instanceId);

// Update state
if (instance) {
  const updated = updateInstanceState(instance.instanceId, {
    evidence: ["RFC 6749", "internal audit"],
    backingStrength: "Strong",
  });
  console.log("Updated:", updated?.state);

  // Handoff
  const converged = brokerStateHandoff(
    instance.instanceId,
    "convergence-point",
    "agent-facilitator",
    { positions: [...] }
  );
  console.log("Handed off to:", converged?.instanceId);
}

// List installations for an agent
const agentInstances = listInstallations("agent-auth-team");
console.log("Agent's patterns:", agentInstances);

*/
