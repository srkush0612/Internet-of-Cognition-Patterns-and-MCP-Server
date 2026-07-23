"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME,
  ENABLED_THEMES,
  getTheme,
  type ThemeName,
} from "@/lib/design-tokens/themes";
import { isFrostedSurface, themeToCssVars } from "@/lib/design-tokens/theme-utils";
import { isGalleryFadeEnabled } from "@/lib/gallery-fade-flag";

type ThemeContextValue = {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  themeSwitching: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "pattern-library-theme";

function isThemeName(value: string): value is ThemeName {
  return (
    value === "midnight" ||
    value === "slate" ||
    value === "signal" ||
    value === "glass" ||
    value === "mono"
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME);
  const [themeSwitching, setThemeSwitching] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isThemeName(stored) && ENABLED_THEMES.includes(stored)) {
      setThemeNameState(stored);
    }
  }, []);

  const setThemeName = useCallback(
    (name: ThemeName) => {
      if (!ENABLED_THEMES.includes(name) || name === themeName) return;

      const applyTheme = () => {
        setThemeNameState(name);
        localStorage.setItem(STORAGE_KEY, name);
      };

      if (typeof document !== "undefined" && isGalleryFadeEnabled()) {
        setThemeSwitching(true);
        window.setTimeout(() => {
          applyTheme();
          window.setTimeout(() => setThemeSwitching(false), 100);
        }, 100);
        return;
      }

      applyTheme();
    },
    [themeName],
  );

  const theme = useMemo(() => getTheme(themeName), [themeName]);
  const cssVars = useMemo(() => themeToCssVars(theme), [theme]);
  const frosted = isFrostedSurface(theme);

  const value = useMemo(
    () => ({ themeName, setThemeName, themeSwitching }),
    [themeName, setThemeName, themeSwitching],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className="theme-root min-h-screen"
        style={cssVars as CSSProperties}
        data-theme={themeName}
        data-frosted-surface={frosted ? "true" : undefined}
        data-theme-switching={themeSwitching ? "true" : undefined}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
