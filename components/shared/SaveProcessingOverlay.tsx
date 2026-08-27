"use client";

import "./save-processing-overlay.css";

type SaveProcessingOverlayProps = {
  label?: string;
  compact?: boolean;
};

export function SaveProcessingOverlay({
  label = "Saving…",
  compact = false,
}: SaveProcessingOverlayProps) {
  return (
    <div
      className={`save-processing-overlay${compact ? " save-processing-overlay--compact" : ""}`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="save-processing-overlay__content">
        <span className="save-processing-overlay__spinner" aria-hidden />
        <span className="save-processing-overlay__label">{label}</span>
      </div>
    </div>
  );
}
