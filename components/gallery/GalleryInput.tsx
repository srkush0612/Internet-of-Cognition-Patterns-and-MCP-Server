import type { InputHTMLAttributes } from "react";
import { GalleryField } from "./GalleryField";

type GalleryInputProps = {
  label: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  hint?: string;
  id: string;
  defaultValue?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
};

export function GalleryInput({
  label,
  type = "text",
  placeholder = "Type here…",
  hint,
  id,
  defaultValue,
  min,
  max,
  step,
}: GalleryInputProps) {
  return (
    <GalleryField label={label} typeLabel={type} hint={hint} htmlFor={id}>
      <input
        id={id}
        className="gallery-input__field gallery-surface-raised"
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
      />
    </GalleryField>
  );
}
