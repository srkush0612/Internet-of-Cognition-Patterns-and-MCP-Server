"use client";

import { useCallback, useEffect, useState } from "react";
import { getWorkspaceState, workspacePatch } from "@/lib/workspace-defaults";

export type WorkspaceBaseProps<T extends Record<string, unknown>> = {
  state: Record<string, unknown>;
  patternName: string;
  onSaveState: (updates: Record<string, unknown>) => Promise<void>;
  defaults: T;
  /** When true, hide Save/Clear and stream draft changes instead. */
  embedded?: boolean;
  onDraftChange?: (draft: T) => void;
  children: (ctx: {
    draft: T;
    setDraft: React.Dispatch<React.SetStateAction<T>>;
    updateField: <K extends keyof T>(key: K, value: T[K]) => void;
  }) => React.ReactNode;
};

const INPUT =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-[var(--color-tag-bg)]";

const TEXTAREA = `${INPUT} min-h-[88px] resize-y`;

const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink";

export const workspaceFieldInputClass = INPUT;
export const workspaceFieldTextareaClass = TEXTAREA;
export const workspaceFieldLabelClass = LABEL;
export const workspaceFieldSelectClass = INPUT;

const SECTION = "space-y-3 rounded-xl border border-line bg-white p-4";

const BTN_PRIMARY =
  "inline-flex flex-1 items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-h disabled:cursor-not-allowed disabled:opacity-50";

const BTN_SECONDARY =
  "inline-flex flex-1 items-center justify-center rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50";

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={LABEL}>
      {children}
    </label>
  );
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={INPUT}
    />
  );
}

export function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={TEXTAREA}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={INPUT}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={SECTION}>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-subtle">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function WorkspaceShell<T extends Record<string, unknown>>({
  state,
  patternName,
  onSaveState,
  defaults,
  embedded = false,
  onDraftChange,
  children,
}: WorkspaceBaseProps<T>) {
  const [draft, setDraft] = useState<T>(() =>
    getWorkspaceState(state, defaults),
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(getWorkspaceState(state, defaults));
  }, [state, defaults]);

  const updateField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      onDraftChange?.(next);
      return next;
    });
  }, [onDraftChange]);

  const save = async () => {
    setIsSaving(true);
    try {
      await onSaveState(workspacePatch(draft));
    } finally {
      setIsSaving(false);
    }
  };

  const clear = async () => {
    setDraft(defaults);
    onDraftChange?.(defaults);
    setIsSaving(true);
    try {
      await onSaveState(workspacePatch(defaults));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-4">
        {!embedded ? (
          <p className="text-sm font-medium text-muted">{patternName}</p>
        ) : null}
        {children({ draft, setDraft, updateField })}
      </div>
      {!embedded ? (
        <footer className="sticky bottom-0 flex shrink-0 gap-2 border-t border-line bg-white/95 py-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => void save()}
            disabled={isSaving}
            className={BTN_PRIMARY}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => void clear()}
            disabled={isSaving}
            className={BTN_SECONDARY}
          >
            Clear
          </button>
        </footer>
      ) : null}
    </div>
  );
}

export function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-semibold text-accent hover:text-accent-h"
    >
      + {label}
    </button>
  );
}

export function RemoveChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-hover px-2.5 py-1 text-xs text-ink">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-subtle hover:text-ink"
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}
