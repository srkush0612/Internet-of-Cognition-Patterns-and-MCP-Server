import type { PatternLivePreviewInput } from "@/lib/pattern-live-preview";

/**
 * Turns the pattern's live-preview input into an editable JSX snippet for the
 * Code tab. `Pattern` is provided via react-live's `scope` (the actual
 * reference-design component for the selected slug) — this is real code,
 * evaluated live, not a static string.
 */
export function buildPlaygroundCode(live: PatternLivePreviewInput): string {
  return `<Pattern live={${JSON.stringify(live, null, 2)}} />`;
}
