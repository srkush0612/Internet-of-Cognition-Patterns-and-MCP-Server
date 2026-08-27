/**
 * IoC Pattern Library MCP Server (No Anthropic Dependency)
 *
 * Registry logic lives in lib/pattern-registry-core.ts (shared with static/Reviewa).
 * This module adds in-memory instance storage for dev and API routes.
 */

import "server-only";

import {
  buildComponentFromPattern,
  discoverComponents as discoverFromCore,
  fetchComponent as fetchFromCore,
  getPatternRegistry,
  type ComponentDefinition,
  type ComponentMetadata,
} from "@/lib/pattern-registry-core";
import { patterns } from "@/lib/patterns";

export type { ComponentDefinition, ComponentMetadata } from "@/lib/pattern-registry-core";

export type Installation = {
  componentSlug: string;
  agentId: string;
  installedAt: string;
  instanceIds: string[];
  version: string;
};

interface ComponentInstanceInternal {
  instanceId: string;
  slug: string;
  state: Record<string, unknown>;
  createdAt: string;
  lastModified: string;
  agentId?: string;
  persistent: boolean;
}

export type { ComponentInstanceInternal as ComponentInstance };

const componentRegistry = getPatternRegistry();
const instances: Map<string, ComponentInstanceInternal> = new Map();
const installations: Map<string, Installation[]> = new Map();

function initializeRegistry() {
  console.log("📚 Importing patterns from lib/patterns.ts...\n");

  for (const pattern of patterns) {
    componentRegistry.set(pattern.slug, buildComponentFromPattern(pattern));
    console.log(`✓ Registered: ${pattern.title} (${pattern.slug})`);
  }

  console.log(
    `\n✅ Registry initialized with ${componentRegistry.size} patterns\n`,
  );
}

export function discoverComponents(
  query: string,
  _context?: Record<string, unknown>,
): ComponentMetadata[] {
  return discoverFromCore(query);
}

export function fetchComponent(slug: string): ComponentDefinition | null {
  return fetchFromCore(slug);
}

export function instantiateComponent(
  slug: string,
  initialState: Record<string, unknown> = {},
  agentId?: string,
  persistent: boolean = false,
): ComponentInstanceInternal | null {
  const component = componentRegistry.get(slug);
  if (!component) return null;

  const instanceId = `${slug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const instance: ComponentInstanceInternal = {
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

  if (agentId) {
    const key = `${slug}-${agentId}`;
    if (!installations.has(key)) {
      installations.set(key, []);
    }
    const inst = installations.get(key)!;
    const existing = inst.find(
      (i) => i.componentSlug === slug && i.agentId === agentId,
    );
    if (!existing) {
      inst.push({
        componentSlug: slug,
        agentId,
        installedAt: now,
        instanceIds: [instanceId],
        version: component.metadata.version,
      });
    } else {
      existing.instanceIds.push(instanceId);
    }
  }

  return instance;
}

export function updateInstanceState(
  instanceId: string,
  updates: Record<string, unknown>,
): ComponentInstanceInternal | null {
  const instance = instances.get(instanceId);
  if (!instance) return null;

  instance.state = { ...instance.state, ...updates };
  instance.lastModified = new Date().toISOString();
  instances.set(instanceId, instance);

  return instance;
}

export function getInstanceState(
  instanceId: string,
): ComponentInstanceInternal | null {
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
  contextData?: Record<string, unknown>,
): ComponentInstanceInternal | null {
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
    true,
  );

  if (toInstance) {
    console.log(
      `[HANDOFF] ${fromInstanceId} → ${toInstance.instanceId} (${toComponentSlug})`,
    );
  }

  return toInstance;
}

initializeRegistry();

export { componentRegistry, instances, installations };
