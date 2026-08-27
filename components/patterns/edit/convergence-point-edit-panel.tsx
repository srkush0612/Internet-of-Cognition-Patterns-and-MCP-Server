"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { extractConvergencePoint } from "./convergence-point-extractor";
import { CONVERGENCE_FIELD_TIPS } from "@/lib/convergence-point-instructions";
import { getPatternGuidanceMessages } from "@/lib/patterns/extraction-flow";
import {
  validateConvergencePoint,
} from "@/lib/convergence-point-validation";
import "./convergence-point-edit-panel.css";

export type ConvergenceFormData = {
  agentRoster?: string[];
  disagreementDimension?: string;
  resolutionMechanism?: string;
  outcome?: string;
};

export type ConvergencePointEditPanelProps = {
  instanceId: string;
  currentData?: ConvergenceFormData;
  externalErrors?: Record<string, string>;
  isSaving?: boolean;
  hideFooter?: boolean;
  onSave: (data: {
    agentRoster: string[];
    disagreementDimension: string;
    resolutionMechanism?: string;
    outcome?: string;
  }) => void | Promise<boolean>;
  onCancel?: () => void;
  onChange?: (data: ConvergenceFormData) => void;
  /** Live tips/warnings for chat guidance (not blocking errors). */
  onGuidanceChange?: (messages: string[]) => void;
};

function mapExternalErrors(external?: Record<string, string>): Record<string, string> {
  if (!external) return {};
  const mapped: Record<string, string> = {};
  if (external.disagreement) mapped.disagreement = external.disagreement;
  if (external.decision) mapped.outcome = external.decision;
  if (external.agentRoster) mapped.agents = external.agentRoster;
  return mapped;
}

function rosterToText(roster?: string[]): string {
  return (roster ?? []).join(", ");
}

function textToRoster(text: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of text
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function ConvergencePointEditPanel({
  instanceId,
  currentData,
  externalErrors,
  isSaving = false,
  hideFooter = false,
  onSave,
  onCancel,
  onChange,
  onGuidanceChange,
}: ConvergencePointEditPanelProps) {
  const baseId = useId();
  const [description, setDescription] = useState("");
  const [agentsText, setAgentsText] = useState(() =>
    rosterToText(currentData?.agentRoster),
  );
  const [disagreement, setDisagreement] = useState(
    currentData?.disagreementDimension ?? "",
  );
  const [resolution, setResolution] = useState(
    currentData?.resolutionMechanism ?? "",
  );
  const [outcome, setOutcome] = useState(currentData?.outcome ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  const formState = useMemo<ConvergenceFormData>(
    () => ({
      agentRoster: textToRoster(agentsText),
      disagreementDimension: disagreement,
      resolutionMechanism: resolution,
      outcome,
    }),
    [agentsText, disagreement, resolution, outcome],
  );

  const validation = useMemo(
    () => validateConvergencePoint(formState),
    [formState],
  );

  const mergedErrors = {
    ...mapExternalErrors(externalErrors),
    ...(showValidation ? validation.errors : {}),
    ...fieldErrors,
  };

  const onChangeRef = useRef(onChange);
  const lastEmittedRef = useRef<string | null>(null);
  onChangeRef.current = onChange;

  useEffect(() => {
    const data = currentData ?? {};
    setAgentsText(rosterToText(data.agentRoster));
    setDisagreement(data.disagreementDimension ?? "");
    setResolution(data.resolutionMechanism ?? "");
    setOutcome(data.outcome ?? "");
    setDescription("");
    setFieldErrors({});
    setShowValidation(false);
    lastEmittedRef.current = null;
    // Reset form only when switching instances, not on every parent draft sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- currentData read at instance switch
  }, [instanceId]);

  useEffect(() => {
    const serialized = JSON.stringify(formState);
    if (serialized === lastEmittedRef.current) return;
    lastEmittedRef.current = serialized;
    onChangeRef.current?.(formState);
  }, [formState]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowValidation(true);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [formState]);

  const handleExtract = useCallback(() => {
    const trimmed = description.trim();
    if (!trimmed) return;

    const { extracted } = extractConvergencePoint(trimmed);
    if (extracted.agentRoster?.length) {
      setAgentsText(rosterToText(extracted.agentRoster));
    }
    if (extracted.disagreementDimension) {
      setDisagreement(extracted.disagreementDimension);
    }
    if (extracted.resolutionMechanism) {
      setResolution(extracted.resolutionMechanism);
    }
    if (extracted.outcome) {
      setOutcome(extracted.outcome);
    }
    setFieldErrors({});
    setShowValidation(true);
  }, [description]);

  const handleSave = useCallback(async () => {
    setShowValidation(true);
    const result = validateConvergencePoint(formState);
    setFieldErrors(result.errors);
    if (!result.canSave) return;

    await onSave({
      agentRoster: formState.agentRoster ?? [],
      disagreementDimension: formState.disagreementDimension!.trim(),
      resolutionMechanism: formState.resolutionMechanism?.trim() || undefined,
      outcome: formState.outcome?.trim() || undefined,
    });
  }, [formState, onSave]);

  useEffect(() => {
    if (!onGuidanceChange || !showValidation) return;
    const workspace = {
      agentRoster: formState.agentRoster,
      disagreement: formState.disagreementDimension,
      resolutionMechanism: formState.resolutionMechanism,
      decision: formState.outcome,
    };
    onGuidanceChange(getPatternGuidanceMessages("convergence-point", workspace));
  }, [formState, onGuidanceChange, showValidation]);

  return (
    <div className="cp-edit-panel" data-instance-id={instanceId}>
      <div className="cp-edit-panel__body">
        <div className="cp-edit-panel__field">
          <label htmlFor={`${baseId}-description`} className="cp-edit-panel__label">
            Description
          </label>
          <textarea
            id={`${baseId}-description`}
            className="cp-edit-panel__textarea"
            placeholder="Describe the scenario — agents, disagreement, how it was resolved…"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <p className="cp-edit-panel__tip">
            Paste a scenario or incident summary, then Extract to fill the fields below.
          </p>
          <div className="cp-edit-panel__actions">
            <button
              type="button"
              className="cp-edit-panel__btn cp-edit-panel__btn--primary"
              onClick={handleExtract}
              disabled={!description.trim()}
            >
              Extract
            </button>
          </div>
        </div>

        <div className="cp-edit-panel__field">
          <label
            htmlFor={`${baseId}-agents`}
            className="cp-edit-panel__label cp-edit-panel__label-required"
          >
            Agents
          </label>
          <input
            id={`${baseId}-agents`}
            type="text"
            className={`cp-edit-panel__input${
              mergedErrors.agents ? " cp-edit-panel__input--error" : ""
            }`}
            placeholder="policy, legal, comms"
            value={agentsText}
            onChange={(event) => setAgentsText(event.target.value)}
            aria-invalid={Boolean(mergedErrors.agents)}
            aria-describedby={`${baseId}-agents-tip`}
          />
          <p id={`${baseId}-agents-tip`} className="cp-edit-panel__tip">
            {CONVERGENCE_FIELD_TIPS.agents}
          </p>
          {mergedErrors.agents ? (
            <p className="cp-edit-panel__error" role="alert">
              {mergedErrors.agents}
            </p>
          ) : null}
        </div>

        <div className="cp-edit-panel__field">
          <label
            htmlFor={`${baseId}-disagreement`}
            className="cp-edit-panel__label cp-edit-panel__label-required"
          >
            Disagreement
          </label>
          <textarea
            id={`${baseId}-disagreement`}
            className={`cp-edit-panel__control${
              mergedErrors.disagreement ? " cp-edit-panel__control--error" : ""
            }`}
            placeholder="What are they disagreeing on?"
            value={disagreement}
            onChange={(event) => setDisagreement(event.target.value)}
            aria-invalid={Boolean(mergedErrors.disagreement)}
            aria-describedby={`${baseId}-disagreement-tip`}
          />
          <p id={`${baseId}-disagreement-tip`} className="cp-edit-panel__tip">
            {CONVERGENCE_FIELD_TIPS.disagreement}
          </p>
          {mergedErrors.disagreement ? (
            <p className="cp-edit-panel__error" role="alert">
              {mergedErrors.disagreement}
            </p>
          ) : null}
        </div>

        <div className="cp-edit-panel__field">
          <label htmlFor={`${baseId}-resolution`} className="cp-edit-panel__label">
            Resolution
          </label>
          <textarea
            id={`${baseId}-resolution`}
            className="cp-edit-panel__control"
            placeholder="How was it resolved? Who decided?"
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            aria-describedby={`${baseId}-resolution-tip`}
          />
          <p id={`${baseId}-resolution-tip`} className="cp-edit-panel__tip">
            {CONVERGENCE_FIELD_TIPS.resolution}
          </p>
        </div>

        <div className="cp-edit-panel__field">
          <label htmlFor={`${baseId}-outcome`} className="cp-edit-panel__label">
            Outcome
          </label>
          <textarea
            id={`${baseId}-outcome`}
            className={`cp-edit-panel__control${
              mergedErrors.outcome ? " cp-edit-panel__control--error" : ""
            }`}
            placeholder="Final decision or adopted answer"
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
            aria-invalid={Boolean(mergedErrors.outcome)}
            aria-describedby={`${baseId}-outcome-tip`}
          />
          <p id={`${baseId}-outcome-tip`} className="cp-edit-panel__tip">
            {CONVERGENCE_FIELD_TIPS.outcome}
          </p>
          {mergedErrors.outcome ? (
            <p className="cp-edit-panel__error" role="alert">
              {mergedErrors.outcome}
            </p>
          ) : null}
        </div>

        {!hideFooter ? (
          <div className="cp-edit-panel__footer">
            <button
              type="button"
              className="cp-edit-panel__btn cp-edit-panel__btn--primary"
              onClick={() => void handleSave()}
              disabled={isSaving || (showValidation && !validation.canSave)}
              aria-busy={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="cp-edit-panel__spinner" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </button>
            {onCancel ? (
              <button
                type="button"
                className="cp-edit-panel__btn cp-edit-panel__btn--secondary"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ConvergencePointEditPanel;
