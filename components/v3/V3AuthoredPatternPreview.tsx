"use client";

import { useState } from "react";
import { ChannelPreview } from "@/components/v2/ChannelPreview";
import type { Pattern } from "@/lib/v2/types";

type Theme = "shadcn" | "material";

/** The authored V2 preview remains the source of truth in both themes. */
export function V3AuthoredPatternPreview({ pattern }: { pattern: Pattern }) {
  const [theme, setTheme] = useState<Theme>("shadcn");

  return (
    <div className="v3-authored-preview" data-theme={theme}>
      <div className="v3-theme-toggle" role="radiogroup" aria-label="Preview theme">
        <button
          type="button"
          role="radio"
          aria-checked={theme === "shadcn"}
          onClick={() => setTheme("shadcn")}
        >
          shadcn
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={theme === "material"}
          onClick={() => setTheme("material")}
        >
          Material
        </button>
      </div>
      <ChannelPreview pattern={pattern} />
    </div>
  );
}
