import globalFont from "./global-font.json";

export type ThemeTokens = {
  spacing: Record<string, number>;
  radius: Record<string, number>;
  type: {
    scale: number[];
    weight: Record<string, number>;
  };
  elevation: Record<string, string>;
  motion: Record<string, string>;
  color: Record<string, string>;
  font?: { family: string };
};

function usesPixelUnit(keyPath: string): boolean {
  return (
    keyPath.startsWith("spacing.") ||
    keyPath.startsWith("radius.") ||
    keyPath.startsWith("type.scale")
  );
}

function flattenTokens(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    const cssKey = prefix ? `${prefix}-${key}` : key;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        vars,
        flattenTokens(value as Record<string, unknown>, cssKey),
      );
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemPath = `${keyPath}.${index}`;
        vars[`--${cssKey}-${index}`] =
          typeof item === "number" && usesPixelUnit(itemPath)
            ? `${item}px`
            : String(item);
      });
    } else if (typeof value === "number") {
      vars[`--${cssKey}`] = usesPixelUnit(keyPath) ? `${value}px` : String(value);
    } else if (value !== undefined && value !== null) {
      vars[`--${cssKey}`] = String(value);
    }
  }

  return vars;
}

export function themeToCssVars(theme: ThemeTokens): Record<string, string> {
  const { font: _font, ...tokenGroups } = theme;
  return {
    ...flattenTokens(tokenGroups as Record<string, unknown>),
    "--font-family": `'${globalFont.family}', system-ui, sans-serif`,
  };
}

export function isFrostedSurface(theme: ThemeTokens): boolean {
  return /rgba?\(/i.test(theme.color?.surfaceRaised ?? "");
}
