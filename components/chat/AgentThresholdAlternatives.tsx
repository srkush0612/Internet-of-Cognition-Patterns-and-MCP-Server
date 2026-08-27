"use client";

import { Network } from "lucide-react";
import { useEffect, useState } from "react";
import { AlternativePatternCard } from "@/components/chat/AlternativePatternCard";
import { AlternativesLoadingSkeleton } from "@/components/chat/AlternativesLoadingSkeleton";
import {
  getConflictVisibilityAlternatives,
  type ConflictVisibilityAlternative,
  type ConflictVisibilityViewId,
} from "@/lib/conflict-visibility-views";
import {
  CONVERGENCE_AGENT_THRESHOLD,
  type ConvergenceSaveRevealState,
} from "@/lib/convergence-save-reveal";

type AgentThresholdAlternativesProps = {
  saveReveal: ConvergenceSaveRevealState;
  enabled: boolean;
  isSaving?: boolean;
  onSelectView: (viewId: ConflictVisibilityViewId) => void;
};

export function AgentThresholdAlternatives({
  saveReveal,
  enabled,
  isSaving = false,
  onSelectView,
}: AgentThresholdAlternativesProps) {
  const [alternatives, setAlternatives] = useState<ConflictVisibilityAlternative[]>(
    [],
  );
  const [cardsVisible, setCardsVisible] = useState(false);

  const {
    isProcessing,
    processingAlternatives,
    showAlternatives,
    savedAgentCount,
    revealToken,
    activeView,
  } = saveReveal;

  const shouldOfferAlternatives =
    enabled &&
    showAlternatives &&
    savedAgentCount >= CONVERGENCE_AGENT_THRESHOLD;

  useEffect(() => {
    if (!shouldOfferAlternatives || revealToken === 0) {
      setCardsVisible(false);
      setAlternatives([]);
      return;
    }

    setCardsVisible(false);
    setAlternatives(getConflictVisibilityAlternatives());

    const revealTimer = window.setTimeout(() => {
      setCardsVisible(true);
    }, 100);

    return () => window.clearTimeout(revealTimer);
  }, [revealToken, shouldOfferAlternatives]);

  if (!enabled) {
    return null;
  }

  if (isSaving && enabled) {
    return <AlternativesLoadingSkeleton />;
  }

  if (isProcessing && processingAlternatives) {
    return <AlternativesLoadingSkeleton />;
  }

  if (!shouldOfferAlternatives || !cardsVisible || alternatives.length === 0) {
    return null;
  }

  return (
    <div className="agent-threshold-alt agent-threshold-alt--ready">
      <div className="agent-threshold-alt__header">
        <div className="agent-threshold-alt__heading-row">
          <Network
            className="agent-threshold-alt__heading-icon"
            size={16}
            aria-hidden
          />
          <h3 className="agent-threshold-alt__heading">
            Other ways to view this conflict
          </h3>
          <span className="agent-threshold-alt__badge">
            <span className="agent-threshold-alt__badge-dot" aria-hidden />
            New
          </span>
        </div>
        <p className="agent-threshold-alt__intro">
          Explore 3 alternative views to understand this conflict better — click
          a card to open it in the preview panel.
        </p>
      </div>
      <div className="agent-threshold-alt__grid">
        {alternatives.map((alternative, index) => (
          <AlternativePatternCard
            key={alternative.id}
            name={alternative.name}
            description={alternative.description}
            isActive={activeView === alternative.id}
            staggerIndex={index}
            onClick={() => onSelectView(alternative.id)}
          />
        ))}
      </div>
    </div>
  );
}
