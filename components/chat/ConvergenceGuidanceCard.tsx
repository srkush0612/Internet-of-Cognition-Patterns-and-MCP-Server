"use client";

import "./convergence-guidance-card.css";

type PatternGuidanceCardProps = {
  messages: string[];
};

/** Chat guidance card for pattern validation tips and warnings */
export function PatternGuidanceCard({ messages }: PatternGuidanceCardProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      className="convergence-guidance-card"
      role="status"
      aria-label="Scenario guidance"
    >
      {messages.map((message) => (
        <p key={message} className="convergence-guidance-card__item">
          {message}
        </p>
      ))}
    </div>
  );
}

/** @deprecated Use PatternGuidanceCard */
export const ConvergenceGuidanceCard = PatternGuidanceCard;
