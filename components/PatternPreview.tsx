"use client";

import { useMemo, useState } from "react";
import type { ComponentDefinition } from "@/lib/pattern-advisor";

export type PatternPreviewProps = {
  component: ComponentDefinition;
  explanation: string;
  isTopRecommendation?: boolean;
  onInstantiate: () => void;
};

const DETAIL_SECTION_TITLES = new Set([
  "Pattern",
  "What it solves",
  "Interaction",
  "Example",
]);

const COLLAPSE_THRESHOLD = 280;

const CARD = "osh-card w-full max-w-[600px] overflow-hidden";
const INFO_YELLOW = "osh-info-yellow px-3.5 py-3";
const INFO_SLATE = "osh-info-slate px-3.5 py-3";

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
}: {
  title: string;
  content: string;
}) {
  const isLong = content.length > COLLAPSE_THRESHOLD;
  const [collapsed, setCollapsed] = useState(isLong);

  return (
    <section className={`${INFO_SLATE} p-3.5`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink">
          {title}
        </h4>
        {isLong ? (
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
        className={`text-sm leading-relaxed text-muted ${
          collapsed ? "line-clamp-4" : ""
        }`}
      >
        {content}
      </p>
    </section>
  );
}

export function PatternPreview({
  component,
  explanation,
  isTopRecommendation = false,
  onInstantiate,
}: PatternPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { metadata, ui } = component;
  const evidenceCount = metadata.evidence_count ?? 0;
  const backing = metadata.backingStrength ?? "Unknown";

  const whyText = useMemo(() => briefExplanation(explanation), [explanation]);
  const keyBenefits = useMemo(() => extractKeyBenefits(component), [component]);

  const detailSections = ui.text.sections.filter((section) =>
    DETAIL_SECTION_TITLES.has(section.title),
  );

  return (
    <article className={CARD}>
      {isTopRecommendation ? (
        <div className="border-b border-[var(--color-tag-border)] bg-[var(--color-tag-bg)] px-4 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-h">
            Top recommendation
          </span>
        </div>
      ) : null}

      <div className="space-y-3.5 p-4">
        <header>
          <h3 className="text-lg font-bold leading-tight text-ink">
            {metadata.name}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {backing} backing · {evidenceCount} source
            {evidenceCount === 1 ? "" : "s"}
          </p>
        </header>

        <div className={INFO_YELLOW}>
          <h4 className="text-xs font-semibold text-ink">Why this pattern</h4>
          <p className="mt-1 text-sm leading-snug text-muted">{whyText}</p>
        </div>

        {keyBenefits.length > 0 ? (
          <div className={INFO_SLATE}>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink">
              Key benefits
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

        {isExpanded ? (
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

        <footer className="flex flex-wrap gap-2 border-t border-line pt-3">
          <button
            type="button"
            onClick={onInstantiate}
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
      </div>
    </article>
  );
}
