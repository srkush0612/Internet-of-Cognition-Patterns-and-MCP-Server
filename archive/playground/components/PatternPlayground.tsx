"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { getPattern } from "@/lib/patterns";
import { PATTERN_READY_SLUGS } from "@/lib/pattern-ready";
import { PATTERN_STANDALONE } from "@/components/patterns/pattern-registry";
import { resolveLivePreview } from "@/lib/pattern-live-preview";
import { toInstanceStateUpdate } from "@/lib/instance-edit-model";
import { buildPlaygroundCode } from "@/archive/playground/lib/playground-code-serializer";
import {
  applyPlaygroundInstruction,
  type PlaygroundEditableState,
} from "@/archive/playground/lib/playground-nl-interpreter";
import { applyPreset, presetAvailable, PRESETS, type PresetId } from "@/archive/playground/lib/playground-presets";
import { decodeScenario, type PlaygroundScenario } from "@/archive/playground/lib/playground-scenario-codec";
import { ConfigTab } from "./ConfigTab";
import { AskTab } from "./AskTab";
import { ScenarioBar } from "./ScenarioBar";
import { ComparePane } from "./ComparePane";
import "./playground.css";

type Tab = "config" | "code" | "ask";

const TABS: { id: Tab; label: string }[] = [
  { id: "config", label: "Config" },
  { id: "code", label: "Code" },
  { id: "ask", label: "Ask" },
];

function initialNameFor(slug: string): string {
  return getPattern(slug)?.title ?? slug;
}

function deriveCode(
  slug: string,
  name: string,
  parameters: Record<string, unknown>,
  context: Record<string, string>,
): string {
  const instanceState = toInstanceStateUpdate(slug, { name, parameters, context });
  const live = resolveLivePreview(slug, instanceState);
  return buildPlaygroundCode(live);
}

/** A valid, decoded scenario from the `?scenario=` URL param, or null. */
function sharedScenarioFromUrl(raw: string | null): PlaygroundScenario | null {
  if (!raw) return null;
  const decoded = decodeScenario(raw);
  if (!decoded || !PATTERN_READY_SLUGS.includes(decoded.slug as (typeof PATTERN_READY_SLUGS)[number])) {
    return null;
  }
  return decoded;
}

export function PatternPlayground() {
  const searchParams = useSearchParams();
  const shared = useMemo(
    () => sharedScenarioFromUrl(searchParams.get("scenario")),
    // Only ever read on first render — later edits shouldn't keep re-hydrating from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [slug, setSlug] = useState<string>(shared?.slug ?? PATTERN_READY_SLUGS[0]);
  const [name, setName] = useState(() => shared?.name ?? initialNameFor(slug));
  const [parameters, setParameters] = useState<Record<string, unknown>>(() => shared?.parameters ?? {});
  const [context, setContext] = useState<Record<string, string>>(() => shared?.context ?? {});
  const [code, setCode] = useState(() => deriveCode(slug, name, parameters, context));
  const [formRevision, setFormRevision] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("config");
  const [activePreset, setActivePreset] = useState<PresetId>("default");
  const [compareOn, setCompareOn] = useState(false);

  const pattern = getPattern(slug);
  const PatternComponent = PATTERN_STANDALONE[slug];
  const scope = useMemo(() => ({ Pattern: PatternComponent }), [PatternComponent]);

  const regenerate = useCallback(
    (nextName: string, nextParameters: Record<string, unknown>, nextContext: Record<string, string>) => {
      setCode(deriveCode(slug, nextName, nextParameters, nextContext));
    },
    [slug],
  );

  function handleSelectPattern(nextSlug: string) {
    const nextName = initialNameFor(nextSlug);
    setSlug(nextSlug);
    setName(nextName);
    setParameters({});
    setContext({});
    setActivePreset("default");
    setFormRevision((r) => r + 1);
    setCode(deriveCode(nextSlug, nextName, {}, {}));
  }

  function handleNameChange(nextName: string) {
    setName(nextName);
    regenerate(nextName, parameters, context);
  }

  function handleParametersChange(nextParameters: Record<string, unknown>) {
    setParameters(nextParameters);
    regenerate(name, nextParameters, context);
  }

  function handleContextChange(nextContext: Record<string, string>) {
    setContext(nextContext);
    regenerate(name, parameters, nextContext);
  }

  function handleApplyInstruction(instruction: string) {
    const current: PlaygroundEditableState = { name, parameters, context };
    const result = applyPlaygroundInstruction(slug, instruction, current);
    if (result.ok) {
      setName(result.state.name);
      setParameters(result.state.parameters);
      setContext(result.state.context);
      setFormRevision((r) => r + 1);
      regenerate(result.state.name, result.state.parameters, result.state.context);
    }
    return { ok: result.ok, message: result.message };
  }

  function handlePreset(presetId: PresetId) {
    setActivePreset(presetId);
    const next = applyPreset(slug, presetId, { parameters, context });
    setParameters(next.parameters);
    setContext(next.context);
    setFormRevision((r) => r + 1);
    regenerate(name, next.parameters, next.context);
  }

  function handleLoadScenario(scenario: PlaygroundScenario) {
    setSlug(scenario.slug);
    setName(scenario.name);
    setParameters(scenario.parameters);
    setContext(scenario.context);
    setActivePreset("default");
    setFormRevision((r) => r + 1);
    setCode(deriveCode(scenario.slug, scenario.name, scenario.parameters, scenario.context));
  }

  return (
    <div className="playground">
      <header className="playground__header">
        <div>
          <h1 className="playground__title">Pattern Playground</h1>
          <p className="playground__subtitle">
            The real reference-design UI for a pattern, live. Edit it with the Config form,
            hand-edit the code, or describe a change in plain language.
          </p>
        </div>
        <div className="playground__usecase">
          <label htmlFor="playground-pattern">Pattern</label>
          <select
            id="playground-pattern"
            value={slug}
            onChange={(event) => handleSelectPattern(event.target.value)}
          >
            {PATTERN_READY_SLUGS.map((s) => (
              <option key={s} value={s}>
                {getPattern(s)?.title ?? s}
              </option>
            ))}
          </select>
        </div>
      </header>

      <ScenarioBar current={{ slug, name, parameters, context }} onLoadScenario={handleLoadScenario} />

      <LiveProvider code={code} scope={scope} noInline={false}>
      <div className="playground__layout">
        <div className={`playground__previews${compareOn ? " playground__previews--split" : ""}`}>
          <div className="playground__preview">
            <div className="playground__preview-head">
              <div className="playground__preview-head-row">
                <span className="playground__preview-title">Live preview</span>
                <span className="playground__preview-tag">{pattern?.title ?? slug}</span>
                <button
                  type="button"
                  className={`playground__compare-btn${compareOn ? " playground__compare-btn--active" : ""}`}
                  onClick={() => setCompareOn((on) => !on)}
                >
                  <span aria-hidden>⇄</span> Compare
                </button>
              </div>
              <div className="chip-row chip-row--compact">
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
            </div>
            <div className="playground__preview-body">
              <LiveError className="playground__live-error" />
              <LivePreview />
            </div>
          </div>

          {compareOn && <ComparePane initialSlug={slug} />}
        </div>

        <div className="playground__tabs">
          <nav className="playground__tab-nav" aria-label="Edit mode">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`playground__tab-btn${activeTab === tab.id ? " playground__tab-btn--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="playground__tab-body">
            {activeTab === "config" && (
              <ConfigTab
                slug={slug}
                formKey={`${slug}::${formRevision}`}
                name={name}
                parameters={parameters}
                context={context}
                onNameChange={handleNameChange}
                onParametersChange={handleParametersChange}
                onContextChange={handleContextChange}
              />
            )}

            {activeTab === "code" && (
              <div className="playground__code">
                <p className="playground__code-note">
                  Editing here overrides Config/Ask until you change one of them again.
                </p>
                <LiveEditor className="playground__live-editor" />
                <LiveError className="playground__live-error" />
              </div>
            )}

            {activeTab === "ask" && <AskTab onApply={handleApplyInstruction} />}
          </div>
        </div>
      </div>
      </LiveProvider>
    </div>
  );
}
