"use client";

import { useState } from "react";
import { LiveProvider, LiveError, LivePreview } from "react-live";
import { getPattern } from "@/lib/patterns";
import { PATTERN_READY_SLUGS } from "@/lib/pattern-ready";
import { PATTERN_STANDALONE } from "@/components/patterns/pattern-registry";
import { resolveLivePreview } from "@/lib/pattern-live-preview";
import { toInstanceStateUpdate } from "@/lib/instance-edit-model";
import { buildPlaygroundCode } from "@/archive/playground/lib/playground-code-serializer";
import { applyPreset, presetAvailable, PRESETS, type PresetId } from "@/archive/playground/lib/playground-presets";

type Props = {
  initialSlug: string;
};

/**
 * A second, independent, view-only preview for side-by-side comparison — its
 * own pattern + preset, no Config/Code/Ask. Comparing two things is the job
 * here, not a second full editing surface.
 */
export function ComparePane({ initialSlug }: Props) {
  const [slug, setSlug] = useState(initialSlug);
  const [activePreset, setActivePreset] = useState<PresetId>("default");
  const [state, setState] = useState(() =>
    applyPreset(initialSlug, "default", { parameters: {}, context: {} }),
  );

  const pattern = getPattern(slug);
  const PatternComponent = PATTERN_STANDALONE[slug];
  const instanceState = toInstanceStateUpdate(slug, { name: pattern?.title ?? slug, ...state });
  const live = resolveLivePreview(slug, instanceState);
  const code = buildPlaygroundCode(live);

  function handleSelectPattern(nextSlug: string) {
    setSlug(nextSlug);
    setActivePreset("default");
    setState(applyPreset(nextSlug, "default", { parameters: {}, context: {} }));
  }

  function handlePreset(presetId: PresetId) {
    setActivePreset(presetId);
    setState((current) => applyPreset(slug, presetId, current));
  }

  return (
    <div className="compare-pane">
      <div className="compare-pane__head">
        <select value={slug} onChange={(event) => handleSelectPattern(event.target.value)}>
          {PATTERN_READY_SLUGS.map((s) => (
            <option key={s} value={s}>
              {getPattern(s)?.title ?? s}
            </option>
          ))}
        </select>
      </div>
      <div className="compare-pane__presets">
        {PRESETS.filter((p) => presetAvailable(slug, p.id)).map((p) => (
          <button
            key={p.id}
            type="button"
            className={`chip${activePreset === p.id ? " chip--active" : ""}`}
            onClick={() => handlePreset(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="compare-pane__body">
        <LiveProvider code={code} scope={{ Pattern: PatternComponent }} noInline={false}>
          <LiveError className="playground__live-error" />
          <LivePreview />
        </LiveProvider>
      </div>
    </div>
  );
}
