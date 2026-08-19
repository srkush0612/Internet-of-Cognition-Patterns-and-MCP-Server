"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentDefinition } from "@/lib/pattern-advisor";

export type InstanceFormData = {
  instanceId: string;
  slug: string;
  state: Record<string, unknown>;
  component: ComponentDefinition;
};

type InstanceFormProps = {
  instance: InstanceFormData;
  onSaveState: (updates: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
};

type SchemaField = {
  type?: string;
  description?: string;
};

const INTERNAL_FIELDS = new Set(["pattern_slug", "createdAt", "updatedAt"]);

const REQUIRED_FIELDS = new Set(["title", "description"]);

const TEXTAREA_FIELDS = new Set(["description", "context"]);

const ENUM_OPTIONS: Record<string, string[]> = {
  backingStrength: ["Strong", "Moderate", "Thin", "None"],
};

const FIELD_ORDER = [
  "title",
  "description",
  "backingStrength",
  "evidence",
  "context",
];

function schemaEntries(
  stateSchema: Record<string, unknown>,
): Array<[string, SchemaField]> {
  const entries = Object.entries(stateSchema).filter(
    ([name]) => !INTERNAL_FIELDS.has(name),
  ) as Array<[string, SchemaField]>;

  return entries.sort(([a], [b]) => {
    const indexA = FIELD_ORDER.indexOf(a);
    const indexB = FIELD_ORDER.indexOf(b);
    const rankA = indexA === -1 ? FIELD_ORDER.length : indexA;
    const rankB = indexB === -1 ? FIELD_ORDER.length : indexB;
    return rankA - rankB;
  });
}

function fieldLabel(name: string, description?: string): string {
  if (description && !description.includes(",") && description.length < 40) {
    return description.charAt(0).toUpperCase() + description.slice(1);
  }

  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function formatTimestamp(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function readString(state: Record<string, unknown>, key: string): string {
  const value = state[key];
  return value === undefined || value === null ? "" : String(value);
}

function readStringArray(state: Record<string, unknown>, key: string): string[] {
  const value = state[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item));
}

function buildFormState(state: Record<string, unknown>): Record<string, unknown> {
  return {
    title: readString(state, "title"),
    description: readString(state, "description"),
    backingStrength: readString(state, "backingStrength") || "Moderate",
    evidence: readStringArray(state, "evidence"),
    context: readString(state, "context"),
  };
}

function inputClassName(hasError = false): string {
  return [
    "w-full rounded-lg border px-3 py-2 text-sm text-ink placeholder:text-slate-400 outline-none transition",
    "focus:border-accent focus:ring-2 focus:ring-[var(--color-tag-bg)]",
    hasError
      ? "border-red-300 bg-red-50/50"
      : "border-line bg-white hover:border-line-md",
  ].join(" ");
}

const BTN_PRIMARY =
  "inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-h focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

const BTN_SECONDARY =
  "flex-1 rounded-lg border border-line-md bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-50";

const BTN_INLINE =
  "rounded-lg border border-line-md bg-white px-2.5 py-2 text-sm font-medium text-muted transition hover:bg-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-50";

export function InstanceForm({
  instance,
  onSaveState,
  onCancel,
  isLoading = false,
}: InstanceFormProps) {
  const { component, state } = instance;
  const stateSchema = component.behavior.stateSchema as Record<string, unknown>;
  const fields = useMemo(() => schemaEntries(stateSchema), [stateSchema]);

  const [formState, setFormState] = useState<Record<string, unknown>>(() =>
    buildFormState(state),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedMessage, setSavedMessage] = useState(false);
  const firstFieldId = fields[0]?.[0]
    ? `instance-field-${fields[0][0]}`
    : undefined;

  useEffect(() => {
    setFormState(buildFormState(state));
    setErrors({});
  }, [instance.instanceId, state]);

  useEffect(() => {
    if (!firstFieldId) {
      return;
    }

    document.getElementById(firstFieldId)?.focus();
  }, [instance.instanceId, firstFieldId]);

  useEffect(() => {
    if (!savedMessage) {
      return;
    }

    const timer = window.setTimeout(() => setSavedMessage(false), 2500);
    return () => window.clearTimeout(timer);
  }, [savedMessage]);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setFormState((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const nextErrors: Record<string, string> = {};

    for (const fieldName of REQUIRED_FIELDS) {
      const value = formState[fieldName];
      if (typeof value !== "string" || value.trim().length === 0) {
        nextErrors[fieldName] = "This field is required";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formState]);

  const handleCancel = () => {
    setFormState(buildFormState(state));
    setErrors({});
    setSavedMessage(false);
    onCancel?.();
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    const updates: Record<string, unknown> = {};

    for (const [name] of fields) {
      const value = formState[name];

      if (name === "evidence" && Array.isArray(value)) {
        updates[name] = value
          .map((item) => String(item).trim())
          .filter(Boolean);
        continue;
      }

      if (typeof value === "string") {
        updates[name] = value.trim();
      } else if (value !== undefined) {
        updates[name] = value;
      }
    }

    await onSaveState(updates);
    setSavedMessage(true);
  };

  const renderStringField = (name: string, schema: SchemaField) => {
    const label = fieldLabel(name, schema.description);
    const isRequired = REQUIRED_FIELDS.has(name);
    const isOptional = !isRequired;
    const value = readString(formState, name);
    const placeholder = schema.description ?? label;
    const useTextarea = TEXTAREA_FIELDS.has(name);
    const sharedProps = {
      id: `instance-field-${name}`,
      value,
      disabled: isLoading,
      placeholder,
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setFieldValue(name, event.target.value),
      className: inputClassName(Boolean(errors[name])),
    };

    return (
      <div key={name} className="space-y-1.5">
        <label
          htmlFor={sharedProps.id}
          className="block text-sm font-medium text-ink"
        >
          {label}
          {isRequired ? (
            <span className="text-accent"> *</span>
          ) : null}
          {isOptional ? (
            <span className="font-normal text-subtle"> (optional)</span>
          ) : null}
        </label>

        {useTextarea ? (
          <textarea
            {...sharedProps}
            rows={name === "description" ? 4 : 3}
            spellCheck
          />
        ) : (
          <input {...sharedProps} type="text" />
        )}

        {name === "description" ? (
          <p className="text-[11px] text-subtle">Markdown supported</p>
        ) : null}

        {errors[name] ? (
          <p className="text-xs text-red-600">{errors[name]}</p>
        ) : null}
      </div>
    );
  };

  const renderEnumField = (name: string, schema: SchemaField) => {
    const label = fieldLabel(name, schema.description);
    const options = ENUM_OPTIONS[name] ?? ["Strong", "Moderate", "Thin", "None"];
    const value = readString(formState, name) || options[0];

    return (
      <div key={name} className="space-y-1.5">
        <label
          htmlFor={`instance-field-${name}`}
          className="block text-sm font-medium text-ink"
        >
          {label}
          <span className="font-normal text-subtle"> (optional)</span>
        </label>
        <select
          id={`instance-field-${name}`}
          value={value}
          disabled={isLoading}
          onChange={(event) => setFieldValue(name, event.target.value)}
          className={inputClassName()}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderArrayField = (name: string, schema: SchemaField) => {
    const label = fieldLabel(name, schema.description);
    const items = readStringArray(formState, name);

    const updateItem = (index: number, value: string) => {
      const next = [...items];
      next[index] = value;
      setFieldValue(name, next);
    };

    const removeItem = (index: number) => {
      setFieldValue(
        name,
        items.filter((_, itemIndex) => itemIndex !== index),
      );
    };

    const addItem = () => {
      setFieldValue(name, [...items, ""]);
    };

    return (
      <div key={name} className="space-y-1.5">
        <label className="block text-sm font-medium text-ink">
          {label}
          <span className="font-normal text-subtle"> (optional)</span>
        </label>

        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-xs text-subtle">No items yet.</p>
          ) : null}

          {items.map((item, index) => (
            <div key={`${name}-${index}`} className="flex gap-2">
              <input
                type="text"
                value={item}
                disabled={isLoading}
                placeholder={schema.description ?? "Add an item"}
                onChange={(event) => updateItem(index, event.target.value)}
                className={inputClassName()}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={isLoading}
                className={BTN_INLINE}
                aria-label={`Remove item ${index + 1}`}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            disabled={isLoading}
            className="rounded-lg border border-dashed border-line-md px-3 py-2 text-xs font-semibold text-muted transition hover:border-slate-400 hover:bg-hover"
          >
            + Add item
          </button>
        </div>
      </div>
    );
  };

  const renderField = (name: string, schema: SchemaField) => {
    if (ENUM_OPTIONS[name]) {
      return renderEnumField(name, schema);
    }

    if (schema.type === "array") {
      return renderArrayField(name, schema);
    }

    if (schema.type === "string" || !schema.type) {
      return renderStringField(name, schema);
    }

    return null;
  };

  const createdAt = state.createdAt ?? state.updatedAt;
  const updatedAt = state.updatedAt ?? state.lastModified;

  return (
    <div className="rounded-lg border border-line bg-white">
      <form
        className="space-y-4 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        {fields.map(([name, schema]) => renderField(name, schema))}

        <div className="rounded-lg border border-line bg-hover/50 px-3 py-2.5 text-xs text-muted">
          <p>
            <span className="font-medium text-ink">Created:</span>{" "}
            {formatTimestamp(createdAt)}
          </p>
          <p className="mt-1">
            <span className="font-medium text-ink">Last updated:</span>{" "}
            {formatTimestamp(updatedAt)}
          </p>
        </div>

        {savedMessage ? (
          <p className="text-sm font-medium text-emerald-700">Saved successfully.</p>
        ) : null}

        <div className="flex gap-2 border-t border-line pt-4">
          <button type="submit" disabled={isLoading} className={BTN_PRIMARY}>
            {isLoading ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden
                />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className={BTN_SECONDARY}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
