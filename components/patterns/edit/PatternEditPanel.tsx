"use client";

import "./edit-panel.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPattern } from "@/lib/patterns";
import { defaultWorkspaceForSlug, mergeWorkspaceForSlug } from "@/lib/workspace-defaults";
import { editableFieldsForSlug } from "@/lib/editable-fields";
import {
  validateEditPanelState,
  type EditPanelValidationErrors,
} from "@/lib/edit-panel-validation";
import {
  getPatternGuidanceMessages,
  validatePatternForm,
} from "@/lib/patterns/extraction-flow";
import { getFieldGuide } from "@/lib/patterns/loader";
import type { EditableField } from "@/lib/editable-fields";
import { PATTERN_INSTRUCTION_SLUGS } from "@/lib/patterns/loader";
import { EditFieldRenderer } from "./EditFieldRenderer";
import {
  workspaceFieldInputClass,
  workspaceFieldLabelClass,
} from "@/components/workspaces/shared";

export type PatternEditPanelProps = {
  patternSlug: string;
  instanceId: string;
  currentState: Record<string, unknown>;
  onSave: (state: Record<string, unknown>) => boolean | void | Promise<boolean | void>;
  isLoading?: boolean;
  hideFooter?: boolean;
  onClose?: () => void;
  /** When embedded in ActiveInstancePanel, split parameters/context callbacks. */
  embedded?: boolean;
  onParametersChange?: (parameters: Record<string, unknown>) => void;
  onContextChange?: (context: Record<string, string>) => void;
  onNameChange?: (name: string) => void;
  externalErrors?: EditPanelValidationErrors;
  onGuidanceChange?: (messages: string[]) => void;
};

function readContext(state: Record<string, unknown>): Record<string, string> {
  const raw = state.context;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).map(([key, value]) => [
      key,
      String(value ?? ""),
    ]),
  );
}

function mergeDefaults(
  slug: string,
  parameters: Record<string, unknown>,
): Record<string, unknown> {
  return mergeWorkspaceForSlug(slug, parameters);
}

export function PatternEditPanel({
  patternSlug,
  instanceId,
  currentState,
  onSave,
  isLoading = false,
  hideFooter = false,
  onClose,
  embedded = false,
  onParametersChange,
  onContextChange,
  onNameChange,
  externalErrors,
  onGuidanceChange,
}: PatternEditPanelProps) {
  const pattern = getPattern(patternSlug);
  const schema = editableFieldsForSlug(patternSlug);

  const [parameters, setParameters] = useState(() =>
    mergeDefaults(
      patternSlug,
      (currentState.workspace as Record<string, unknown>) ?? {},
    ),
  );
  const [context, setContext] = useState(() => readContext(currentState));
  const [name, setName] = useState(
    () => String(currentState.title ?? pattern?.title ?? patternSlug),
  );
  const [errors, setErrors] = useState<EditPanelValidationErrors>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [showInstructionValidation, setShowInstructionValidation] = useState(false);

  const hasInstructions = PATTERN_INSTRUCTION_SLUGS.includes(
    patternSlug as (typeof PATTERN_INSTRUCTION_SLUGS)[number],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInstructionValidation(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!onGuidanceChange || !hasInstructions || !showInstructionValidation) return;
    const timer = window.setTimeout(() => {
      onGuidanceChange(getPatternGuidanceMessages(patternSlug, parameters));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    parameters,
    hasInstructions,
    onGuidanceChange,
    patternSlug,
    showInstructionValidation,
  ]);

  const persistedRevision = useMemo(() => {
    const updatedAt = currentState.updatedAt;
    return typeof updatedAt === "string" ? updatedAt : instanceId;
  }, [currentState.updatedAt, instanceId]);

  useEffect(() => {
    setParameters(
      mergeDefaults(
        patternSlug,
        (currentState.workspace as Record<string, unknown>) ?? {},
      ),
    );
    setContext(readContext(currentState));
    setName(String(currentState.title ?? pattern?.title ?? patternSlug));
    setDirty(false);
    setErrors({});
  }, [instanceId, patternSlug, persistedRevision, pattern?.title]);

  const mergedErrors = useMemo(
    () => ({ ...errors, ...externalErrors }),
    [errors, externalErrors],
  );

  const updateParameters = useCallback(
    (next: Record<string, unknown>) => {
      setParameters(next);
      setDirty(true);
      onParametersChange?.(next);
    },
    [onParametersChange],
  );

  const updateContext = useCallback(
    (next: Record<string, string>) => {
      setContext(next);
      setDirty(true);
      onContextChange?.(next);
    },
    [onContextChange],
  );

  const setFieldValue = (section: "parameters" | "context", key: string, value: unknown) => {
    if (section === "parameters") {
      updateParameters({ ...parameters, [key]: value });
    } else {
      updateContext({ ...context, [key]: String(value ?? "") });
    }
  };

  const validate = (): EditPanelValidationErrors => {
    let nextErrors = validateEditPanelState(patternSlug, parameters, context);

    if (hasInstructions && showInstructionValidation) {
      const patternValidation = validatePatternForm(patternSlug, parameters);
      if (patternValidation) {
        nextErrors = { ...nextErrors, ...patternValidation.errors };
      }
    }

    return nextErrors;
  };

  const persist = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return false;

    const payload = {
      title: name,
      workspace: parameters,
      context,
      updatedAt: new Date().toISOString(),
    };

    const result = await onSave(payload);
    if (result === false) return false;

    setDirty(false);
    setSaveMessage("Saved");
    window.setTimeout(() => setSaveMessage(null), 2000);
    return true;
  };

  const handleBlurSave = async (section: "parameters" | "context", key: string) => {
    const nextErrors = validateEditPanelState(patternSlug, parameters, context);
    if (nextErrors[key]) {
      setErrors(nextErrors);
      return;
    }
    if (!embedded) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSaveMessage("Saved");
    window.setTimeout(() => setSaveMessage(null), 1500);
    onParametersChange?.(parameters);
    onContextChange?.(context);
    void section;
    void key;
  };

  const handleDone = async () => {
    const ok = await persist();
    if (ok) onClose?.();
  };

  const handleClose = () => {
    if (dirty) {
      const leave = window.confirm("You have unsaved changes. Close without saving?");
      if (!leave) return;
    }
    onClose?.();
  };

  const renderInstructionParameters = () => {
    const required = schema.parameters.filter((f) => f.group === "required" || f.required);
    const recommended = schema.parameters.filter((f) => f.group === "recommended");
    const optional = schema.parameters.filter((f) => f.group === "optional");

    const renderGroup = (title: string, fields: EditableField[]) =>
      fields.length > 0 ? (
        <div key={title} style={{ marginBottom: "1rem" }}>
          <h4 className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle">
            {title}
          </h4>
          {fields.map((field) => {
            const value = parameters[field.key];
            return (
              <div key={field.key}>
                <EditFieldRenderer
                  field={field}
                  value={value}
                  error={mergedErrors[field.key]}
                  onChange={(next) => setFieldValue("parameters", field.key, next)}
                  onBlur={() => void handleBlurSave("parameters", field.key)}
                />
                <FieldInstructionTip slug={patternSlug} field={field} />
              </div>
            );
          })}
        </div>
      ) : null;

    return (
      <section style={{ marginBottom: "1.25rem" }}>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-subtle">
          Parameters
        </h3>
        {renderGroup("Required", required)}
        {renderGroup("Recommended", recommended)}
        {renderGroup("Optional", optional)}
      </section>
    );
  };

  const renderSection = (
    title: string,
    fields: typeof schema.parameters,
    section: "parameters" | "context",
  ) => (
    <section style={{ marginBottom: "1.25rem" }}>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-subtle">{title}</h3>
      {fields.map((field) => {
        const value =
          section === "parameters"
            ? parameters[field.key]
            : context[field.key] ?? "";
        return (
          <div key={field.key}>
            <EditFieldRenderer
              field={field}
              value={value}
              error={mergedErrors[field.key]}
              onChange={(next) => setFieldValue(section, field.key, next)}
              onBlur={() => void handleBlurSave(section, field.key)}
            />
            {hasInstructions ? (
              <FieldInstructionTip slug={patternSlug} field={field} />
            ) : null}
          </div>
        );
      })}
    </section>
  );

  const readonlyFields = [
    currentState.createdAt
      ? {
          key: "createdAt",
          label: "Created",
          type: "readonly" as const,
          section: "parameters" as const,
          value: new Date(String(currentState.createdAt)).toLocaleString(),
        }
      : null,
    currentState.updatedAt
      ? {
          key: "updatedAt",
          label: "Last updated",
          type: "readonly" as const,
          section: "parameters" as const,
          value: new Date(String(currentState.updatedAt)).toLocaleString(),
        }
      : null,
  ].filter(Boolean);

  if (embedded) {
    return (
      <div className="pattern-edit-panel flex h-full min-h-0 flex-col bg-transparent">
        {Object.keys(mergedErrors).length > 0 ? (
          <div className="pattern-edit-panel__summary-error" role="alert">
            <strong>Fix these before saving:</strong>
            <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.25rem" }}>
              {Object.values(mergedErrors).map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="pattern-edit-panel__body pattern-edit-panel__body--form-only min-h-0 flex-1">
          <div className="pattern-edit-panel__form pb-4">
            <div className="pattern-edit-panel__field">
              <label htmlFor="edit-instance-name" className={workspaceFieldLabelClass}>
                Instance name
              </label>
              <input
                id="edit-instance-name"
                type="text"
                className={workspaceFieldInputClass}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setDirty(true);
                  onNameChange?.(event.target.value);
                }}
              />
            </div>
            {hasInstructions
              ? renderInstructionParameters()
              : renderSection("Parameters", schema.parameters, "parameters")}
            {renderSection("Context", schema.context, "context")}
            {readonlyFields.map((field) =>
              field ? (
                <EditFieldRenderer
                  key={field.key}
                  field={field}
                  value={field.value}
                  onChange={() => {}}
                />
              ) : null,
            )}
          </div>
        </div>

        {!hideFooter ? (
        <footer className="pattern-edit-panel__footer shrink-0 border-line bg-white">
          <button
            type="button"
            className="edit-panel-btn-primary pattern-edit-panel__btn-primary inline-flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || Object.keys(mergedErrors).length > 0}
            onClick={() => void persist()}
          >
            {isLoading ? "Saving…" : "Save"}
          </button>
          {onClose ? (
            <button
              type="button"
              className="pattern-edit-panel__btn-secondary inline-flex flex-1 items-center justify-center rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-hover"
              onClick={handleClose}
            >
              Cancel
            </button>
          ) : null}
          {saveMessage ? (
            <span className="pattern-edit-panel__saved text-success" aria-live="polite">
              {saveMessage}
            </span>
          ) : null}
        </footer>
        ) : null}
      </div>
    );
  }

  return (
    <div className="pattern-edit-panel">
      <header className="pattern-edit-panel__header">
        <div>
          <p className="pattern-edit-panel__title">Edit</p>
          <p className="pattern-edit-panel__subtitle">
            {pattern?.title ?? patternSlug}
          </p>
        </div>
        <div className="pattern-edit-panel__actions">
          <button
            type="button"
            className="pattern-edit-panel__btn-primary"
            disabled={isLoading || Object.keys(mergedErrors).length > 0}
            onClick={() => void handleDone()}
          >
            {isLoading ? "Saving…" : "Done"}
          </button>
          {onClose ? (
            <button
              type="button"
              className="pattern-edit-panel__btn-secondary"
              onClick={handleClose}
            >
              Close
            </button>
          ) : null}
        </div>
      </header>

      {Object.keys(mergedErrors).length > 0 ? (
        <div className="pattern-edit-panel__summary-error" role="alert">
          <strong>Fix these before saving:</strong>
          <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.25rem" }}>
            {Object.values(mergedErrors).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="pattern-edit-panel__body pattern-edit-panel__body--form-only">
        <div className="pattern-edit-panel__form">
          <div className="pattern-edit-panel__field">
            <label htmlFor="edit-instance-name-standalone" className={workspaceFieldLabelClass}>
              Instance name
            </label>
            <input
              id="edit-instance-name-standalone"
              type="text"
              className={workspaceFieldInputClass}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setDirty(true);
              }}
            />
          </div>
          {hasInstructions
            ? renderInstructionParameters()
            : renderSection("Parameters", schema.parameters, "parameters")}
          {renderSection("Context", schema.context, "context")}
          {readonlyFields.map((field) =>
            field ? (
              <EditFieldRenderer
                key={field.key}
                field={field}
                value={field.value}
                onChange={() => {}}
              />
            ) : null,
          )}
        </div>
      </div>

      <footer className="pattern-edit-panel__footer">
        <button
          type="button"
          className="pattern-edit-panel__btn-primary"
          disabled={isLoading || Object.keys(mergedErrors).length > 0}
          onClick={() => void persist()}
        >
          {isLoading ? "Saving…" : "Save"}
        </button>
        {onClose ? (
          <button
            type="button"
            className="pattern-edit-panel__btn-secondary"
            onClick={handleClose}
          >
            Cancel
          </button>
        ) : null}
        {saveMessage ? (
          <span className="pattern-edit-panel__saved" aria-live="polite">
            {saveMessage}
          </span>
        ) : null}
      </footer>
    </div>
  );
}

function FieldInstructionTip({
  slug,
  field,
}: {
  slug: string;
  field: EditableField;
}) {
  const tip =
    getFieldGuide(slug, field.key) ??
    field.description;

  if (!tip) return null;

  return (
    <p
      className="mt-1 text-[0.6875rem] leading-relaxed text-[var(--text-secondary,#666)]"
      id={`tip-${field.key}`}
    >
      {tip}
    </p>
  );
}
