"use client";

import { useState } from "react";
import { PATTERN_SECTIONS } from "@/lib/pattern-sections";

export function GalleryPatternTabs() {
  const [active, setActive] = useState("about");

  return (
    <nav className="detail-page-nav" aria-label="Section tabs preview">
      {PATTERN_SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className="detail-page-nav__item"
          data-active={active === section.id ? "true" : undefined}
          aria-current={active === section.id ? "true" : undefined}
          onClick={() => setActive(section.id)}
        >
          {section.label}
          <span className="detail-page-nav__underline" aria-hidden />
        </button>
      ))}
    </nav>
  );
}
