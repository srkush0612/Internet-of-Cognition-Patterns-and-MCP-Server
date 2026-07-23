import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

export function GalleryButton({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`gallery-button gallery-button--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
