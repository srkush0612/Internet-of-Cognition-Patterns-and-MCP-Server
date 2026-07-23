import midnight from "./themes/midnight.json";
import slate from "./themes/slate.json";
import signal from "./themes/signal.json";
import glass from "./themes/glass.json";
import mono from "./themes/mono.json";
import globalFont from "./global-font.json";
import type { ThemeTokens } from "./theme-utils";

/** Mirrors list_themes() from the design-tokens MCP server. */
export const THEME_NAMES = [
  "midnight",
  "slate",
  "signal",
  "glass",
  "mono",
] as const;

export type ThemeName = (typeof THEME_NAMES)[number];

/** All themes available for switching. */
export const ENABLED_THEMES: ThemeName[] = [...THEME_NAMES];

export const DEFAULT_THEME: ThemeName = "slate";

const themes: Record<ThemeName, ThemeTokens> = {
  midnight: midnight as ThemeTokens,
  slate: slate as ThemeTokens,
  signal: signal as ThemeTokens,
  glass: glass as ThemeTokens,
  mono: mono as ThemeTokens,
};

/** Mirrors get_theme(name) from the design-tokens MCP server. */
export function getTheme(name: ThemeName): ThemeTokens {
  const theme = themes[name];
  if (!theme) {
    throw new Error(`Theme not found: ${name}`);
  }

  return {
    ...theme,
    font: { family: globalFont.family },
  };
}

export function listThemes(): ThemeName[] {
  return [...THEME_NAMES];
}
