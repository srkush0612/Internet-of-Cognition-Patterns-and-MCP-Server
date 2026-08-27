"use client";

import {
  FEATURED_SCENARIO_LANDING_PILLS,
  type ScenarioLandingPill,
} from "@/lib/scenario-landing-pills";
import "./advisor-landing.css";

type ScenarioQuestionPillsProps = {
  pills?: ScenarioLandingPill[];
  onSelect: (slug: string) => void;
  disabled?: boolean;
};

export function ScenarioQuestionPills({
  pills = FEATURED_SCENARIO_LANDING_PILLS,
  onSelect,
  disabled = false,
}: ScenarioQuestionPillsProps) {
  return (
    <div className="advisor-scenario-pills" aria-label="Example scenarios">
      {pills.map((pill) => (
        <button
          key={pill.slug}
          type="button"
          className="advisor-scenario-pill"
          disabled={disabled}
          onClick={() => onSelect(pill.slug)}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}

export { FEATURED_SCENARIO_LANDING_PILLS };
