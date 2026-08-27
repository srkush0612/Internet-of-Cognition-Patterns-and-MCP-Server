import type { ExtractionResult } from "./types";
import "./conversation-edit-shared.css";

export type ExtractionSummaryProps = {
  confidence: number;
  found: string[];
  missing: string[];
};

function confidenceLevel(confidence: number): "high" | "medium" | "low" {
  if (confidence > 70) return "high";
  if (confidence >= 50) return "medium";
  return "low";
}

export function ExtractionSummary({
  confidence,
  found,
  missing,
}: ExtractionSummaryProps) {
  const level = confidenceLevel(confidence);
  const clamped = Math.max(0, Math.min(100, confidence));

  return (
    <div
      className={`conv-edit-summary conv-edit-summary--${level}`}
      role="status"
      aria-live="polite"
    >
      {found.length > 0 ? (
        <p className="conv-edit-summary__row">
          <span className="conv-edit-summary__label" aria-hidden>
            ✓
          </span>{" "}
          <span className="conv-edit-summary__found">
            Found: {found.join(", ")}
          </span>
        </p>
      ) : null}
      {missing.length > 0 ? (
        <p className="conv-edit-summary__row">
          <span className="conv-edit-summary__label" aria-hidden>
            ✗
          </span>{" "}
          <span className="conv-edit-summary__missing">
            Missing: {missing.join(", ")}
          </span>
        </p>
      ) : null}
      <p className="conv-edit-summary__confidence">
        <span>Confidence: {clamped}%</span>
        <span className="conv-edit-summary__bar" aria-hidden>
          <span
            className="conv-edit-summary__bar-fill"
            style={{ width: `${clamped}%` }}
          />
        </span>
      </p>
    </div>
  );
}
