/**
 * In-memory Scenario store for Studio.
 *
 * Kept separate from server/mcp-server.ts on purpose: scenarios aren't part
 * of the agent-facing MCP tool surface (discover/fetch/instantiate/...),
 * they're Studio's own state. Same in-memory-only shape as that file's
 * `instances`/`installations` maps — resets on dev-server restart, same
 * documented limitation, no new persistence model introduced.
 */
import "server-only";

import { deepMerge } from "@/lib/pattern-registry-core";
import { sampleScenario } from "@/lib/studio/content";
import type { Scenario } from "@/lib/studio/types";

/**
 * Next's dev server lazily compiles each route on first request, and doing
 * so can re-execute already-loaded server modules' top-level code — which
 * would silently reset a plain `new Map()` the first time a new Studio route
 * is hit. Backing it with `globalThis` (the standard fix for this class of
 * dev-mode issue) makes it survive that; only a real process restart clears
 * it, matching the in-memory-only behavior documented for mcp-server.ts's
 * instances/installations maps.
 */
const globalForStudio = globalThis as unknown as { __studioScenarios?: Map<string, Scenario> };
const scenarios: Map<string, Scenario> = globalForStudio.__studioScenarios ?? new Map();
globalForStudio.__studioScenarios = scenarios;

export function createScenario(
  input: Pick<Scenario, "name" | "description" | "topology" | "attendance" | "irreversibility">,
): Scenario {
  const now = new Date().toISOString();
  const scenario: Scenario = {
    id: `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...input,
    decisions: [],
    createdAt: now,
    updatedAt: now,
  };
  scenarios.set(scenario.id, scenario);
  return scenario;
}

export function getScenario(id: string): Scenario | null {
  return scenarios.get(id) ?? null;
}

export function listScenarios(): Scenario[] {
  return Array.from(scenarios.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function updateScenario(
  id: string,
  updates: Record<string, unknown>,
): Scenario | null {
  const existing = scenarios.get(id);
  if (!existing) return null;
  if (existing.readOnly) return null; // sample scenarios only change via "make a copy"

  const now = new Date().toISOString();
  const next = { ...deepMerge(existing as unknown as Record<string, unknown>, updates), updatedAt: now } as Scenario;
  scenarios.set(id, next);
  return next;
}

/** "Make a copy to edit" for a read-only (sample) scenario. */
export function copyScenario(id: string): Scenario | null {
  const existing = scenarios.get(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const copy: Scenario = {
    ...existing,
    id: `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: `${existing.name} (copy)`,
    isSample: false,
    readOnly: false,
    createdAt: now,
    updatedAt: now,
  };
  scenarios.set(copy.id, copy);
  return copy;
}

/** Seeds the read-only sample scenario from content/studio/sample-scenario.json, if authored. */
function seedSampleScenario(sample: Scenario | null) {
  if (!sample) return;
  scenarios.set(sample.id, { ...sample, isSample: true, readOnly: true });
}

seedSampleScenario(sampleScenario);

export { scenarios };
