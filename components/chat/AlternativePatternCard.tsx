"use client";

import "./agent-threshold-alternatives.css";

export type AlternativePatternCardProps = {
  name: string;
  description: string;
  isActive?: boolean;
  staggerIndex?: number;
  onClick: () => void;
};

export function AlternativePatternCard({
  name,
  description,
  isActive = false,
  staggerIndex = 0,
  onClick,
}: AlternativePatternCardProps) {
  return (
    <button
      type="button"
      className={`agent-threshold-alt__card${isActive ? " agent-threshold-alt__card--active" : ""}`}
      style={{ animationDelay: `${staggerIndex * 50}ms` }}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <div className="agent-threshold-alt__card-name">
        {isActive ? (
          <span className="agent-threshold-alt__card-check" aria-hidden>
            ✓
          </span>
        ) : null}
        {name}
      </div>
      <p className="agent-threshold-alt__card-description">{description}</p>
      <div className="agent-threshold-alt__card-action">
        {isActive ? "View ✓" : "View →"}
      </div>
    </button>
  );
}
