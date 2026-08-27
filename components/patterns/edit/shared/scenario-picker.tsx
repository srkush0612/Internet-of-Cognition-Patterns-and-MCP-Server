"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Scenario } from "./types";
import "./conversation-edit-shared.css";

export type ScenarioPickerProps = {
  scenarios: Scenario[];
  onSelect: (scenario: Scenario) => void;
  isOpen: boolean;
  onDismiss: () => void;
  onFocusInput?: () => void;
  title?: string;
};

export function ScenarioPicker({
  scenarios,
  onSelect,
  isOpen,
  onDismiss,
  onFocusInput,
  title = "Couldn't fully parse that. Pick a scenario:",
}: ScenarioPickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLButtonElement>(null);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === overlayRef.current) onDismiss();
    },
    [onDismiss],
  );

  useEffect(() => {
    if (!isOpen) return;

    firstCardRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="conv-edit-scenario-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conv-edit-scenario-title"
      onClick={handleOverlayClick}
    >
      <div className="conv-edit-scenario">
        <h2 id="conv-edit-scenario-title" className="conv-edit-scenario__title">
          {title}
        </h2>
        <div className="conv-edit-scenario__grid">
          {scenarios.map((scenario, index) => (
            <button
              key={scenario.id}
              ref={index === 0 ? firstCardRef : undefined}
              type="button"
              className="conv-edit-scenario__card"
              onClick={() => onSelect(scenario)}
            >
              <p className="conv-edit-scenario__card-title">{scenario.title}</p>
              <p className="conv-edit-scenario__card-desc">{scenario.description}</p>
              <p className="conv-edit-scenario__card-action">→ Select</p>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="conv-edit-btn conv-edit-btn--ghost conv-edit-scenario__dismiss"
          onClick={() => {
            onDismiss();
            onFocusInput?.();
          }}
        >
          Try typing differently…
        </button>
      </div>
    </div>
  );
}
