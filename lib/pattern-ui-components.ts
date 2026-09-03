/**
 * Structured render spec for a pattern's reference component.
 *
 * `ui.text.sections` documents a pattern; `ui.component` describes the pattern's
 * standalone card as data a client can render generically (labelbar / header /
 * typed body blocks / footer). Authored per slug from the reference designs in
 * components/patterns/*.
 */

export type PatternUiBlock =
  | { type: "summary"; text: string; strong?: string }
  | {
      type: "timeline";
      entries: Array<{
        time: string;
        kind: string;
        kindLabel: string;
        text: string;
        meta?: string;
      }>;
    }
  | { type: "note"; label: string; text: string }
  | { type: "fields"; items: Array<{ label: string; value: string }> }
  | {
      type: "actions";
      items: Array<{
        label: string;
        variant?: "primary" | "default" | "ghost";
      }>;
    };

export type PatternUiComponent = {
  title: string;
  contextLabel: string;
  icon?: string;
  footer?: { left?: string; right?: string };
  blocks: PatternUiBlock[];
};

export const PATTERN_UI_COMPONENTS: Record<string, PatternUiComponent> = {
  "background-work-ledger": {
    title: "What happened while you were away",
    contextLabel: "Rollback agent",
    icon: "eye",
    footer: {
      left: "Nothing merged to prod yet · your review needed",
      right: "synced 1m ago",
    },
    blocks: [
      {
        type: "summary",
        text: "while you were away · 7 min · 1 open question",
        strong: "4 steps",
      },
      {
        type: "timeline",
        entries: [
          {
            time: "09:14",
            kind: "queried",
            kindLabel: "Queried",
            text: "Pulled 5xx logs for edge-router-7",
            meta: "tool · Loki",
          },
          {
            time: "09:16",
            kind: "assumed",
            kindLabel: "Assumed",
            text: "Treated the error spike as a cache miss, not a config regression",
          },
          {
            time: "09:18",
            kind: "acted",
            kindLabel: "Acted",
            text: "Opened a rollback PR draft to firmware 4.11",
            meta: "PR #4821 · draft",
          },
          {
            time: "09:21",
            kind: "result",
            kindLabel: "Result",
            text: "Staging health checks passed on the rollback build",
          },
        ],
      },
      {
        type: "note",
        label: "Open question",
        text: "Confirm the owning team for edge-router-7 before this rollback merges to prod?",
      },
      {
        type: "actions",
        items: [
          { label: "Approve all", variant: "primary" },
          { label: "Undo a step", variant: "default" },
          { label: "Answer question", variant: "ghost" },
        ],
      },
    ],
  },
};
