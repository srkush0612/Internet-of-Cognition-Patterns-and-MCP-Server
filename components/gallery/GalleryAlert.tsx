"use client";

import { useState } from "react";

type Variant = "info" | "warning" | "danger" | "success";

const MESSAGES: Record<Variant, string> = {
  info: "Pattern evidence from practitioner research.",
  warning: "Three patterns still have pending validation.",
  danger: "Quote attribution mismatch detected in one source.",
  success: "All modeled patterns passed review.",
};

export function GalleryAlert({ variant }: { variant: Variant }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={`gallery-alert gallery-alert--${variant}`} role="alert">
      <span className="gallery-alert__icon" aria-hidden />
      <div className="gallery-alert__content">
        <p className="gallery-alert__message">{MESSAGES[variant]}</p>
      </div>
      <button
        type="button"
        className="gallery-alert__dismiss"
        aria-label="Dismiss"
        onClick={() => setVisible(false)}
      >
        ×
      </button>
    </div>
  );
}

export function GalleryAlerts() {
  return (
    <div className="flex flex-col gap-3">
      <GalleryAlert variant="info" />
      <GalleryAlert variant="warning" />
      <GalleryAlert variant="danger" />
      <GalleryAlert variant="success" />
    </div>
  );
}
