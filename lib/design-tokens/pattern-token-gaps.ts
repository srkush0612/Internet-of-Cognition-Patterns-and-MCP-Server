/** Documented gaps between pattern UI needs and the design-token schema. */
export type PatternTokenGap = {
  id: string;
  label: string;
  detail: string;
  severity: "missing" | "composite" | "partial";
  workaround?: string;
};

export const PATTERN_TOKEN_GAPS: PatternTokenGap[] = [
  {
    id: "tabs",
    label: "Section tabs",
    detail: "No dedicated tab tokens in theme-schema.",
    severity: "composite",
    workaround:
      "Composed from --color-text, --color-textMuted, --color-accent, --color-border, --type-scale-1, --motion-fast.",
  },
  {
    id: "boundary",
    label: "color.boundary",
    detail: "Coral research accent for credential walls and label dots.",
    severity: "missing",
    workaround: "Themed preview maps to --color-danger until added.",
  },
  {
    id: "font-mono",
    label: "font.mono",
    detail: "Mono caps labels use global IBM Plex Mono, not per-theme.",
    severity: "partial",
    workaround: "Uses var(--font-mono) from root layout.",
  },
  {
    id: "card-radius",
    label: "radius.patternCard",
    detail: "Pattern cards use 18px chrome; schema stops at radius.lg.",
    severity: "partial",
    workaround: "Themed preview uses --radius-lg.",
  },
  {
    id: "page-shell",
    label: "color.pageShell",
    detail: "Detail header background is separate from color.surface on live pages.",
    severity: "partial",
    workaround: "Gallery maps detail-page-header to --color-surface.",
  },
];
