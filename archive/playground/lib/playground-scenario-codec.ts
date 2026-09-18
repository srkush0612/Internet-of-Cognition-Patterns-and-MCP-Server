export type PlaygroundScenario = {
  slug: string;
  name: string;
  parameters: Record<string, unknown>;
  context: Record<string, string>;
};

/**
 * The whole point of a "shareable scenario" is that it renders identically
 * forever — so the state lives in the URL itself, not in a server-side store
 * that resets whenever the dev process restarts (see server/mcp-server.ts's
 * in-memory maps). No backend, nothing to keep alive.
 */
export function encodeScenario(scenario: PlaygroundScenario): string {
  return encodeURIComponent(JSON.stringify(scenario));
}

export function decodeScenario(raw: string): PlaygroundScenario | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.slug === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.parameters === "object" &&
      typeof parsed.context === "object"
    ) {
      return parsed as PlaygroundScenario;
    }
    return null;
  } catch {
    return null;
  }
}
