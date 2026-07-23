"use client";

import { useState } from "react";
import { GalleryField } from "./GalleryField";

const OPTIONS = ["Hypothesis", "Grounded", "Modeled"];

export function GallerySelect({
  label = "Maturity stage",
  typeLabel = "select (custom)",
}: {
  label?: string;
  typeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(OPTIONS[0]);
  const id = "gallery-select-custom";

  return (
    <GalleryField label={label} typeLabel={typeLabel} htmlFor={id}>
      <div className="gallery-select">
        <button
          id={id}
          type="button"
          className="gallery-select__trigger gallery-surface-raised"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{value}</span>
          <span aria-hidden>{open ? "▴" : "▾"}</span>
        </button>
        {open && (
          <ul
            className="gallery-select__menu gallery-surface-raised"
            role="listbox"
          >
            {OPTIONS.map((option) => (
              <li
                key={option}
                role="option"
                aria-selected={value === option}
                data-selected={value === option ? "true" : undefined}
                className="gallery-select__option"
                onClick={() => {
                  setValue(option);
                  setOpen(false);
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </GalleryField>
  );
}
