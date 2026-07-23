"use client";

import { listThemes, type ThemeName } from "@/lib/design-tokens/themes";
import { useTheme } from "./ThemeProvider";

export function ThemeSwitcher() {
  const { themeName, setThemeName } = useTheme();
  const themes = listThemes();

  return (
    <div className="theme-switcher" role="group" aria-label="Visual theme">
      {themes.map((name) => {
        const active = themeName === name;

        return (
          <button
            key={name}
            type="button"
            className="theme-switcher__button"
            data-active={active ? "true" : undefined}
            aria-pressed={active}
            title={`Apply ${name} theme`}
            onClick={() => setThemeName(name as ThemeName)}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
