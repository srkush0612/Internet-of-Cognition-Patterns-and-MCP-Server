"use client";

import { useCallback, useMemo, useState } from "react";
import { ConvergencePointInContext } from "@/components/patterns/ConvergencePoint";
import { defaultWorkspaceForSlug } from "@/lib/workspace-defaults";
import { resolveLivePreview } from "@/lib/pattern-live-preview";
import {
  ConversationInput,
  RefinementChat,
  ScenarioPicker,
  SmartForm,
  parseRefinement,
  type RefinementMessage,
  type Scenario,
} from "./shared";
import {
  CONVERGENCE_FIELDS,
  CONVERGENCE_SCENARIOS,
  applyConvergenceRefinement,
  convergenceFormToWorkspace,
  extractConvergencePoint,
  extractFromFile,
  markAutoFilledFields,
  workspaceToConvergenceForm,
  type ConvergenceExtracted,
} from "./convergence-point-extractor";
import "./shared/conversation-edit-shared.css";

type PanelMode = "input" | "scenarios" | "form";

export type ConvergencePointConversationEditPanelProps = {
  instanceId: string;
  onSave: (state: Record<string, unknown>) => boolean | void | Promise<boolean | void>;
  currentState?: Record<string, unknown>;
  isLoading?: boolean;
};

function nextMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function initialFormState(currentState?: Record<string, unknown>): Record<string, unknown> {
  const workspace =
    currentState?.workspace && typeof currentState.workspace === "object"
      ? (currentState.workspace as Record<string, unknown>)
      : defaultWorkspaceForSlug("convergence-point");
  return workspaceToConvergenceForm(workspace);
}

export function ConvergencePointConversationEditPanel({
  instanceId,
  onSave,
  currentState,
  isLoading: externalLoading = false,
}: ConvergencePointConversationEditPanelProps) {
  const [mode, setMode] = useState<PanelMode>(() => {
    const initial = initialFormState(currentState);
    const hasData =
      (Array.isArray(initial.agentRoster) && initial.agentRoster.length > 0) ||
      String(initial.disagreementDimension ?? "").trim().length > 0;
    return hasData ? "form" : "input";
  });
  const [formState, setFormState] = useState<Record<string, unknown>>(() =>
    initialFormState(currentState),
  );
  const [extractionResult, setExtractionResult] = useState<{
    found: string[];
    missing: string[];
    confidence: number;
  } | null>(null);
  const [autoFilledKeys, setAutoFilledKeys] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<RefinementMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);

  const fields = useMemo(
    () => markAutoFilledFields(autoFilledKeys),
    [autoFilledKeys],
  );

  const livePreview = useMemo(() => {
    const workspace = {
      ...defaultWorkspaceForSlug("convergence-point"),
      ...convergenceFormToWorkspace(formState),
    };
    return resolveLivePreview("convergence-point", {
      ...currentState,
      workspace,
      title: typeof currentState?.title === "string" ? currentState.title : undefined,
    });
  }, [currentState, formState]);

  const pushAssistant = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: nextMessageId(), role: "assistant", text, timestamp: Date.now() },
    ]);
  }, []);

  const handleExtract = useCallback(
    (text: string) => {
      setIsLoading(true);
      const result = extractConvergencePoint(text);
      setAutoFilledKeys(new Set(Object.keys(result.extracted)));
      setFormState((prev) => ({ ...prev, ...result.extracted }));
      setExtractionResult({
        found: result.found,
        missing: result.missing,
        confidence: result.confidence,
      });

      if (result.confidence >= 70) {
        setMode("form");
        pushAssistant(
          `Found ${result.found.join(", ")} with ${result.confidence}% confidence. ` +
            `Missing: ${result.missing.join(", ") || "none"}. Edit the form below, or ask me to refine.`,
        );
      } else if (result.confidence >= 50) {
        setMode("form");
        setScenarioOpen(true);
        pushAssistant(
          `Partial extraction (${result.confidence}%). Pick a scenario to start, or edit the fields below.`,
        );
      } else {
        setMode("scenarios");
        setScenarioOpen(true);
        pushAssistant(
          "Couldn't fully parse that. Pick a scenario to start, or try describing differently.",
        );
      }

      setIsLoading(false);
    },
    [pushAssistant],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsLoading(true);
      const { text, error } = await extractFromFile(file);

      if (error) {
        pushAssistant(`Error reading file: ${error}`);
        setIsLoading(false);
        return;
      }

      const result = extractConvergencePoint(text);
      setAutoFilledKeys(new Set(Object.keys(result.extracted)));
      setFormState((prev) => ({ ...prev, ...result.extracted }));
      setExtractionResult({
        found: result.found,
        missing: result.missing,
        confidence: result.confidence,
      });
      setMode("form");

      pushAssistant(
        `Loaded ${file.name}. Found ${result.found.join(", ") || "limited detail"}. Edit below to refine.`,
      );
      setIsLoading(false);
    },
    [pushAssistant],
  );

  const handleScenarioSelect = useCallback(
    (scenario: Scenario) => {
      setFormState(scenario.template);
      setAutoFilledKeys(new Set(Object.keys(scenario.template)));
      setExtractionResult({
        found: ["Scenario template"],
        missing: [],
        confidence: 50,
      });
      setScenarioOpen(false);
      setMode("form");
      pushAssistant(
        `Loaded scenario: ${scenario.title}. Customize the fields below for your use case.`,
      );
    },
    [pushAssistant],
  );

  const handleRefinement = useCallback(
    (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: "user", text, timestamp: Date.now() },
      ]);

      const parsed = parseRefinement(text);
      if (parsed) {
        setFormState((prev) => applyConvergenceRefinement(prev, parsed));
        const fieldLabel =
          parsed.field === "roster" ? "agent roster" : parsed.field.replace(/_/g, " ");
        pushAssistant(`Updated ${fieldLabel}. Preview refreshed.`);
      } else {
        pushAssistant(
          "Couldn't parse that. Try: 'Add [agent]', 'Remove [agent]', 'Change outcome to [value]'",
        );
      }
    },
    [pushAssistant],
  );

  const handleSave = useCallback(
    (finalState: Record<string, unknown>) => {
      const workspace = {
        ...defaultWorkspaceForSlug("convergence-point"),
        ...convergenceFormToWorkspace(finalState),
      };
      void onSave({
        ...currentState,
        workspace,
      });
    },
    [currentState, onSave],
  );

  const busy = isLoading || externalLoading;

  return (
    <div className="conv-edit-panel" data-instance-id={instanceId}>
      <div className="conv-edit-panel__main">
        {(mode === "input" || mode === "form") && (
          <ConversationInput
            onSubmit={handleExtract}
            onFileUpload={(file) => void handleFileUpload(file)}
            isLoading={busy}
            placeholder="Describe the convergence: who disagreed, on what, and how it was resolved…"
            onOpenScenarios={() => {
              setMode("scenarios");
              setScenarioOpen(true);
            }}
          />
        )}

        {mode === "form" && (
          <>
            <SmartForm
              patternSlug="convergence-point"
              fields={fields}
              initialValues={formState}
              extractionResult={extractionResult ?? undefined}
              onSave={handleSave}
              isLoading={busy}
            />
            <RefinementChat
              messages={messages}
              onSendRefinement={handleRefinement}
              isLoading={busy}
              patternSlug="convergence-point"
            />
          </>
        )}
      </div>

      <aside className="conv-edit-panel__preview" aria-label="Live preview">
        <p className="conv-edit-panel__preview-label">Live preview</p>
        <ConvergencePointInContext live={livePreview} />
      </aside>

      <ScenarioPicker
        scenarios={CONVERGENCE_SCENARIOS}
        onSelect={handleScenarioSelect}
        isOpen={scenarioOpen || mode === "scenarios"}
        onDismiss={() => {
          setScenarioOpen(false);
          if (mode === "scenarios") {
            const hasPartial =
              (Array.isArray(formState.agentRoster) &&
                formState.agentRoster.length > 0) ||
              String(formState.disagreementDimension ?? "").trim().length > 0;
            setMode(hasPartial ? "form" : "input");
          }
        }}
      />
    </div>
  );
}

export default ConvergencePointConversationEditPanel;
