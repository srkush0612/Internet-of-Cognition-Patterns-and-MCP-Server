import {
  PATTERN_INBOX,
  PATTERN_STANDALONE,
} from "@/components/patterns/pattern-registry";
import { getV2Pattern } from "./catalog";

/**
 * The bridge from a v2 pattern to the designs already drawn for it.
 *
 * Nothing is rebuilt or moved: these are the same components the v1 pattern
 * pages, the design previews and Studio all render, looked up by the slugs
 * each v2 entry already records in `v1_slugs`. That field was added for
 * traceability and turns out to be exactly the old-id → new-id table this
 * needs, so there is no second mapping to keep in step.
 *
 *   signal-to-intent-handshake  → pre-action-handshake
 *   dependency-and-lineage-view → lineage-view
 *   background-work-ledger      → activity-record
 *   decision-ledger             → decision-record
 *   everything else             → the same kebab-case name
 */

export type Rendering = {
  /** The v1 slug this design was drawn as. */
  slug: string;
  /** How it was framed in v1: on its own, or inside a host surface. */
  kind: "standalone" | "in-context";
};

/** Every design drawn for this pattern, in the order they should be offered. */
export function renderingsFor(patternId: string): Rendering[] {
  const pattern = getV2Pattern(patternId);
  if (!pattern) return [];

  const found: Rendering[] = [];
  for (const slug of pattern.v1_slugs) {
    if (PATTERN_INBOX[slug]) found.push({ slug, kind: "in-context" });
    if (PATTERN_STANDALONE[slug]) found.push({ slug, kind: "standalone" });
  }
  return found;
}

/**
 * The design to show for a given channel.
 *
 * Chat is a thread, which is what the in-context hosts are, so it gets those.
 * Every other human-facing channel gets the standalone drawing. The headless
 * channels get nothing, there is no v1 design of an agent-to-agent payload,
 * and the structured message the preview already shows is the honest stand-in.
 *
 * TODO: the in-context hosts are all inbox or incident shells, so a pattern
 * whose real home is a settings panel is currently shown in the shell it was
 * drawn in rather than one built for that channel. Redrawing per channel is
 * section 11 of context.md, not this restore.
 */
export function renderingForChannel(
  patternId: string,
  channel: string,
): Rendering | null {
  const found = renderingsFor(patternId);
  if (found.length === 0) return null;

  if (channel === "chat_ui") {
    return found.find((r) => r.kind === "in-context") ?? found[0];
  }
  if (channel === "shared_ui" || channel === "settings_panel") {
    return found.find((r) => r.kind === "standalone") ?? found[0];
  }
  return null;
}

export function componentFor(rendering: Rendering) {
  return rendering.kind === "in-context"
    ? PATTERN_INBOX[rendering.slug]
    : PATTERN_STANDALONE[rendering.slug];
}

/**
 * The design filed under one v1 slug, framed for a channel. Used when a
 * variant names its own rendering rather than inheriting the pattern's.
 */
export function componentForSlug(
  slug: string,
  channel: string,
): Rendering | null {
  const wantsInContext = channel === "chat_ui";
  if (wantsInContext && PATTERN_INBOX[slug]) {
    return { slug, kind: "in-context" };
  }
  if (PATTERN_STANDALONE[slug]) return { slug, kind: "standalone" };
  if (PATTERN_INBOX[slug]) return { slug, kind: "in-context" };
  return null;
}
