"use client";

import type { PatternSuggestion } from "@/lib/detect-applicable-patterns";
import "./pattern-chat-cards.css";

export type PatternSuggestionsCardProps = {
  suggestions: PatternSuggestion[];
  onSwitchPattern: (patternSlug: string) => void;
};

export function PatternSuggestionsCard({
  suggestions,
  onSwitchPattern,
}: PatternSuggestionsCardProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <article className="pattern-suggestions-card" aria-label="Other pattern suggestions">
      <div className="pattern-suggestions-card__title">✓ Instance saved</div>
      <div className="pattern-suggestions-card__subtitle">
        Other patterns that might help:
      </div>

      <div className="pattern-suggestions-card__grid">
        {suggestions.map((pattern, index) => (
          <button
            key={pattern.slug}
            type="button"
            className="pattern-suggestions-card__item"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onSwitchPattern(pattern.slug)}
          >
            <div className="pattern-suggestions-card__item-name">{pattern.name}</div>
            <div className="pattern-suggestions-card__item-desc">
              {pattern.description}
            </div>
            <div className="pattern-suggestions-card__item-cta">View →</div>
          </button>
        ))}
      </div>
    </article>
  );
}
