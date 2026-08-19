"use client";

import { useMemo, useState } from "react";
import { InstanceForm } from "@/components/InstanceForm";
import type { InstanceFormData } from "@/components/InstanceForm";
import type { ComponentDefinition } from "@/lib/pattern-advisor";
import {
  extractNextSteps,
  getHowToUseText,
} from "@/lib/pattern-instance-content";

type PatternPreviewBaseProps = {
  component: ComponentDefinition;
  explanation: string;
  isTopRecommendation?: boolean;
};

type RecommendationPreviewProps = PatternPreviewBaseProps & {
  variant?: "recommendation";
  onInstantiate: () => void;
};

type ActivePreviewProps = PatternPreviewBaseProps & {
  variant: "active";
  instanceId: string;
  state: Record<string, unknown>;
  onEditState: (updates: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
  /** Hide the in-card banner when the sidebar already shows a section title */
  showBanner?: boolean;
};

export type PatternPreviewProps = RecommendationPreviewProps | ActivePreviewProps;

const DETAIL_SECTION_TITLES = new Set([
  "Pattern",
  "What it solves",
  "Interaction",
  "Example",
]);

const COLLAPSE_THRESHOLD = 280;

const CARD_RECOMMENDATION =
  "osh-card w-full max-w-[600px] overflow-hidden";

const CARD_ACTIVE =
  "osh-card w-full overflow-hidden ring-2 ring-[var(--color-tag-border)] shadow-glow";

const INFO_YELLOW = "osh-info-yellow px-3.5 py-3";

const INFO_SLATE = "osh-info-slate px-3.5 py-3";

const BTN_PRIMARY =
  "inline-flex flex-1 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-h disabled:cursor-not-allowed disabled:opacity-50";

const BTN_SECONDARY =
  "inline-flex flex-1 items-center justify-center rounded-lg border border-line-md bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-hover";

function briefExplanation(explanation: string): string {
  const sentences = explanation
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  const summary = sentences.slice(0, 2).join(" ");

  if (summary.length <= 200) {
    return summary;
  }

  return `${summary.slice(0, 197)}…`;
}

function toOneLine(text: string, maxLength = 72): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

function simplifyBenefit(sentence: string): string | null {
  let cleaned = sentence
    .trim()
    .replace(/^[-•*]\s*/, "")
    .replace(/\s+/g, " ");

  if (cleaned.length < 12) {
    return null;
  }

  cleaned = cleaned.replace(/^(When|If|The|A|An|Before|On commit|While)\s+/i, "");
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  if (!/[.!?]$/.test(cleaned) && cleaned.length > 40) {
    cleaned = cleaned.replace(/[,;:]+\s*[^,;:.]+$/, "");
  }

  cleaned = cleaned.replace(/[.!?]+$/, "");

  if (cleaned.length < 12 || cleaned.length > 120) {
    return null;
  }

  return cleaned;
}

function extractKeyBenefits(component: ComponentDefinition): string[] {
  const solves =
    component.ui.text.sections.find((section) => section.title === "What it solves")
      ?.content ?? "";
  const interaction =
    component.ui.text.sections.find((section) => section.title === "Interaction")
      ?.content ?? "";
  const description = component.metadata.description;

  const candidates: string[] = [];

  for (const source of [interaction, solves, description]) {
    for (const part of source.split(/(?<=[.!?])\s+|;\s+/)) {
      const benefit = simplifyBenefit(part);
      if (benefit && !candidates.some((existing) => existing === benefit)) {
        candidates.push(benefit);
      }
    }
  }

  if (candidates.length < 3) {
    for (const part of description.split(/,\s+/)) {
      const benefit = simplifyBenefit(part);
      if (benefit && !candidates.some((existing) => existing === benefit)) {
        candidates.push(benefit);
      }
    }
  }

  return candidates.slice(0, 3).map((benefit) => toOneLine(benefit));
}

function DetailSection({
  title,
  content,
  compact = false,
}: {
  title: string;
  content: string;
  compact?: boolean;
}) {
  const isLong = content.length > COLLAPSE_THRESHOLD;
  const [collapsed, setCollapsed] = useState(isLong && !compact);

  return (
    <section className={`${INFO_SLATE} p-3.5`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink">
          {title}
        </h4>
        {isLong && !compact ? (
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="shrink-0 text-[11px] font-semibold text-accent hover:underline"
          >
            {collapsed ? "Show more" : "Show less"}
          </button>
        ) : null}
      </div>
      <p
        className={`${compact ? "text-xs" : "text-sm"} leading-relaxed text-muted ${
          collapsed ? "line-clamp-4" : ""
        }`}
      >
        {content}
      </p>
    </section>
  );
}

function ActiveStateSection({
  instance,
  onEditState,
  showForm,
  onShowFormChange,
}: {
  instance: InstanceFormData;
  onEditState: (updates: Record<string, unknown>) => Promise<void>;
  showForm: boolean;
  onShowFormChange: (open: boolean) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const { state } = instance;

  const handleSave = async (updates: Record<string, unknown>) => {
    setIsSaving(true);
    try {
      await onEditState(updates);
      onShowFormChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={INFO_SLATE}>
      <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink">
          State
        </h4>
        {!showForm ? (
          <button
            type="button"
            onClick={() => onShowFormChange(true)}
            className="text-[11px] font-semibold text-accent hover:underline"
          >
            Edit
          </button>
        ) : null}
      </div>
      <div className="p-3.5">
        {showForm ? (
          <InstanceForm
            instance={instance}
            isLoading={isSaving}
            onCancel={() => onShowFormChange(false)}
            onSaveState={handleSave}
          />
        ) : (
          <pre className="max-h-40 overflow-auto rounded-lg border border-line bg-white p-3 font-mono text-[11px] leading-relaxed text-ink">
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </div>
    </section>
  );
}

export function PatternPreview(props: PatternPreviewProps) {
  const isActive = props.variant === "active";
  const [isExpanded, setIsExpanded] = useState(isActive);
  const [showStateForm, setShowStateForm] = useState(false);

  const { component, explanation, isTopRecommendation = false } = props;
  const { metadata, ui } = component;
  const evidenceCount = metadata.evidence_count ?? 0;
  const backing = metadata.backingStrength ?? "Unknown";

  const whyText = useMemo(() => briefExplanation(explanation), [explanation]);
  const keyBenefits = useMemo(() => extractKeyBenefits(component), [component]);
  const howToUse = useMemo(() => getHowToUseText(component), [component]);
  const nextSteps = useMemo(() => extractNextSteps(component), [component]);

  const detailSections = ui.text.sections.filter((section) =>
    DETAIL_SECTION_TITLES.has(section.title),
  );

  const showDetails = isActive || isExpanded;
  const cardClass = isActive ? CARD_ACTIVE : CARD_RECOMMENDATION;
  const bodyClass = isActive ? "space-y-3 p-3.5 sm:p-4" : "space-y-3.5 p-4";
  const showActiveBanner = isActive && props.showBanner !== false;

  return (
    <article className={isActive ? `${cardClass} flex flex-col` : cardClass}>
      {showActiveBanner ? (
        <div className="border-b border-[var(--color-tag-border)] bg-gradient-to-r from-[var(--color-tag-bg)] to-white px-4 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-h">
            Active instance
          </span>
        </div>
      ) : isTopRecommendation ? (
        <div className="border-b border-[var(--color-tag-border)] bg-[var(--color-tag-bg)] px-4 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-h">
            Top recommendation
          </span>
        </div>
      ) : null}

      <div className={bodyClass}>
        <header>
          <h3
            className={`font-bold leading-tight text-ink ${
              isActive ? "text-base" : "text-lg"
            }`}
          >
            {metadata.name}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {backing} backing · {evidenceCount} source
            {evidenceCount === 1 ? "" : "s"}
          </p>
          {isActive ? (
            <p className="mt-1.5 break-all font-mono text-[10px] text-subtle">
              {props.instanceId}
            </p>
          ) : null}
        </header>

        <div className={INFO_YELLOW}>
          <h4 className="text-xs font-semibold text-ink">
            {isActive ? "Why this pattern" : "Why this pattern"}
          </h4>
          <p className="mt-1 text-sm leading-snug text-muted">{whyText}</p>
        </div>

        {keyBenefits.length > 0 ? (
          <div className={INFO_SLATE}>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink">
              {isActive ? "What you get" : "Key benefits"}
            </h4>
            <ul className="mt-2 space-y-1.5">
              {keyBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex gap-2 text-sm leading-snug text-muted"
                >
                  <span className="font-bold text-accent" aria-hidden>
                    •
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {isActive ? (
          <>
            <DetailSection title="How to use" content={howToUse} compact />

            {nextSteps.length > 0 ? (
              <section className={INFO_SLATE}>
                <h4 className="px-3.5 pt-3.5 text-xs font-bold uppercase tracking-wide text-ink">
                  What to do next
                </h4>
                <ol className="space-y-2 px-3.5 pb-3.5 pt-2">
                  {nextSteps.map((step, index) => (
                    <li
                      key={step}
                      className="flex gap-2.5 text-sm leading-snug text-ink"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-white text-[10px] font-semibold text-muted">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            <div className="space-y-2">
              {detailSections.map((section) => (
                <DetailSection
                  key={`${metadata.slug}-${section.title}`}
                  title={section.title}
                  content={section.content}
                  compact
                />
              ))}
            </div>

            <ActiveStateSection
              instance={{
                instanceId: props.instanceId,
                slug: metadata.slug,
                component,
                state: props.state,
              }}
              onEditState={props.onEditState}
              showForm={showStateForm}
              onShowFormChange={setShowStateForm}
            />
          </>
        ) : null}

        {showDetails && !isActive ? (
          <div className="space-y-2 border-t border-line pt-3">
            {detailSections.map((section) => (
              <DetailSection
                key={`${metadata.slug}-${section.title}`}
                title={section.title}
                content={section.content}
              />
            ))}
          </div>
        ) : null}

        {!isActive ? (
          <footer className="flex flex-wrap gap-2 border-t border-line pt-3">
            <button
              type="button"
              onClick={props.onInstantiate}
              className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[var(--color-shadow)] transition hover:bg-accent-h"
            >
              Try this
            </button>
            {isExpanded ? (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-hover"
              >
                Hide details
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-hover"
              >
                Learn more
              </button>
            )}
          </footer>
        ) : null}
      </div>

      {isActive ? (
        <footer className="sticky bottom-0 z-10 flex shrink-0 gap-2 border-t border-line bg-white/95 px-3.5 py-3 backdrop-blur-sm sm:px-4">
          <button
            type="button"
            onClick={() => setShowStateForm(true)}
            className={BTN_PRIMARY}
          >
            Edit state
          </button>
          <button type="button" onClick={props.onClose} className={BTN_SECONDARY}>
            Close
          </button>
        </footer>
      ) : null}
    </article>
  );
}
