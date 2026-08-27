"use client";

import { useEffect, useMemo, useState } from "react";
import {
  draftHighlightsForSlug,
  workspaceFromInstanceState,
} from "@/lib/preview-state";

type DraftParameterSummaryProps = {
  patternSlug: string;
  parameters: Record<string, unknown>;
  debounceMs?: number;
  /** Bumps when instance is saved — flushes debounce immediately. */
  revision?: string;
};

/** Debounced summary of draft parameter values (used in the right preview panel). */
export function DraftParameterSummary({
  patternSlug,
  parameters,
  debounceMs = 300,
  revision,
}: DraftParameterSummaryProps) {
  const [debounced, setDebounced] = useState(parameters);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(parameters), debounceMs);
    return () => window.clearTimeout(timer);
  }, [parameters, debounceMs]);

  useEffect(() => {
    if (!revision) return;
    setDebounced(parameters);
  }, [revision, parameters]);

  const highlights = useMemo(
    () => draftHighlightsForSlug(patternSlug, debounced),
    [patternSlug, debounced],
  );

  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-line bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-subtle">
        Live parameters
      </p>
      <dl className="space-y-1.5">
        {highlights.map((item) => (
          <div key={item.label} className="text-sm leading-snug">
            <dt className="inline font-semibold text-ink">{item.label}: </dt>
            <dd className="inline text-muted">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** @deprecated Use DraftParameterSummary in PatternDesignPreview instead. */
export function EditPanelPreview({
  patternSlug,
  parameters,
  debounceMs = 300,
}: DraftParameterSummaryProps & { patternName?: string }) {
  return (
    <DraftParameterSummary
      patternSlug={patternSlug}
      parameters={parameters}
      debounceMs={debounceMs}
    />
  );
}
