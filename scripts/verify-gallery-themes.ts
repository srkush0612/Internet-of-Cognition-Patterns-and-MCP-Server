/**
 * Verifies all themes produce CSS variables required by gallery components.
 * Run: npx tsx scripts/verify-gallery-themes.ts
 */
import { getTheme, listThemes } from "../lib/design-tokens/themes";
import { themeToCssVars } from "../lib/design-tokens/theme-utils";

const REQUIRED_VARS = [
  "--color-surface",
  "--color-surfaceRaised",
  "--color-text",
  "--color-textMuted",
  "--color-accent",
  "--color-danger",
  "--color-success",
  "--color-warning",
  "--color-border",
  "--spacing-xs",
  "--spacing-sm",
  "--spacing-md",
  "--spacing-lg",
  "--spacing-xl",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-pill",
  "--type-scale-0",
  "--type-scale-1",
  "--type-scale-2",
  "--type-scale-3",
  "--type-weight-medium",
  "--type-weight-bold",
  "--elevation-0",
  "--elevation-1",
  "--elevation-2",
  "--motion-fast",
  "--motion-base",
  "--motion-slow",
  "--motion-easing",
  "--font-family",
];

let failed = false;

for (const name of listThemes()) {
  const vars = themeToCssVars(getTheme(name));
  const missing = REQUIRED_VARS.filter((key) => !vars[key]);
  if (missing.length) {
    console.error(`✗ ${name}: missing ${missing.join(", ")}`);
    failed = true;
  } else {
    console.log(`✓ ${name}: all ${REQUIRED_VARS.length} gallery tokens present`);
  }
}

if (failed) process.exit(1);
