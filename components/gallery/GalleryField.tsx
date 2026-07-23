import type { ReactNode } from "react";

export function GalleryField({
  label,
  typeLabel,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  typeLabel?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="gallery-field">
      <div className="gallery-field__label-row">
        <label className="gallery-input__label" htmlFor={htmlFor}>
          {label}
        </label>
        {typeLabel ? (
          <span className="gallery-field__type">{typeLabel}</span>
        ) : null}
      </div>
      {children}
      {hint ? <span className="gallery-field__hint">{hint}</span> : null}
    </div>
  );
}
