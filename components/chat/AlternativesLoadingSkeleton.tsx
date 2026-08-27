"use client";

import "./agent-threshold-alternatives.css";

export function AlternativesLoadingSkeleton() {
  return (
    <div className="agent-threshold-alt agent-threshold-alt--loading">
      <div className="agent-threshold-alt__heading">Processing…</div>
      <div className="agent-threshold-alt__skeleton-list">
        {[1, 2, 3].map((index) => (
          <div key={index} className="agent-threshold-alt__skeleton-card">
            <div className="agent-threshold-alt__skeleton-line agent-threshold-alt__skeleton-line--title" />
            <div className="agent-threshold-alt__skeleton-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
