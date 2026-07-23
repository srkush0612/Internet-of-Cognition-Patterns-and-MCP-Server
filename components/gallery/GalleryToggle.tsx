"use client";

import { useState } from "react";

export function GalleryToggle({
  label = "Enable feature",
}: {
  label?: string;
}) {
  const [on, setOn] = useState(true);

  return (
    <button
      type="button"
      className="gallery-toggle"
      data-on={on ? "true" : "false"}
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
    >
      <span className="gallery-toggle__track" aria-hidden>
        <span className="gallery-toggle__thumb" />
      </span>
      <span>{label}</span>
    </button>
  );
}
