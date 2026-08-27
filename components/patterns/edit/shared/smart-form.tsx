"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { validateForm } from "./extraction-helpers";
import { ExtractionSummary } from "./extraction-summary";
import type { ExtractionResult, FormFieldDef } from "./types";
import "./conversation-edit-shared.css";

const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx", "txt", "json", "csv"];

type FileMeta = {
  id: string;
  name: string;
  size: number;
};

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedFile(file: File, accept?: string): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (accept) {
    const parts = accept.split(",").map((part) => part.trim().replace(/^\./, ""));
    return parts.includes(ext);
  }
  return ACCEPTED_EXTENSIONS.includes(ext);
}

export type SmartFormProps = {
  patternSlug: string;
  fields: FormFieldDef[];
  initialValues: Record<string, unknown>;
  extractionResult?: ExtractionResult;
  onSave: (values: Record<string, unknown>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
};

function TagsField({
  field,
  value,
  onChange,
  inputId,
  describedBy,
  error,
}: {
  field: FormFieldDef;
  value: string[];
  onChange: (value: string[]) => void;
  inputId: string;
  describedBy: string;
  error?: string;
}) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div>
      <div className="conv-edit-form__tags" aria-label={field.label}>
        {value.map((tag) => (
          <span key={tag} className="conv-edit-form__tag">
            {tag}
            <button
              type="button"
              className="conv-edit-form__tag-remove"
              onClick={() => onChange(value.filter((item) => item !== tag))}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        id={inputId}
        type="text"
        className="conv-edit-form__control"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag(draft);
          }
        }}
        onBlur={() => {
          if (draft.trim()) addTag(draft);
        }}
        placeholder={field.placeholder ?? "Add and press Enter"}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
      />
    </div>
  );
}

function TableField({
  field,
  value,
  onChange,
}: {
  field: FormFieldDef;
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
}) {
  const columns = field.columns ?? [];
  const template = field.rowTemplate ?? {};

  const updateCell = (rowIndex: number, columnKey: string, cellValue: unknown) => {
    onChange(
      value.map((row, index) =>
        index === rowIndex ? { ...row, [columnKey]: cellValue } : row,
      ),
    );
  };

  return (
    <div>
      <table className="conv-edit-form__table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {value.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>
                  <input
                    type="text"
                    className="conv-edit-form__control"
                    value={String(row[column.key] ?? "")}
                    onChange={(event) =>
                      updateCell(rowIndex, column.key, event.target.value)
                    }
                    placeholder={column.placeholder}
                    aria-label={`${column.label} row ${rowIndex + 1}`}
                  />
                </td>
              ))}
              <td>
                <button
                  type="button"
                  className="conv-edit-btn conv-edit-btn--secondary"
                  onClick={() => onChange(value.filter((_, index) => index !== rowIndex))}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="conv-edit-btn conv-edit-btn--secondary"
        style={{ marginTop: "0.5rem" }}
        onClick={() => onChange([...value, { ...template }])}
      >
        + Add row
      </button>
    </div>
  );
}

function FileField({
  field,
  value,
  onChange,
  inputId,
  describedBy,
}: {
  field: FormFieldDef;
  value: FileMeta[];
  onChange: (value: FileMeta[]) => void;
  inputId: string;
  describedBy: string;
}) {
  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const next: FileMeta[] = [...value];
      for (const file of Array.from(files)) {
        if (!isAcceptedFile(file, field.accept)) continue;
        next.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
        });
      }
      onChange(next);
    },
    [field.accept, onChange, value],
  );

  return (
    <div>
      <label htmlFor={inputId} className="conv-edit-form__dropzone" tabIndex={0}>
        Drag files here or click
        <br />
        pdf, doc, docx, txt, json, csv
      </label>
      <input
        id={inputId}
        type="file"
        multiple
        accept={field.accept ?? ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        style={{ display: "none" }}
        aria-describedby={describedBy}
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {value.length > 0 ? (
        <ul className="conv-edit-form__file-list">
          {value.map((file) => (
            <li key={file.id} className="conv-edit-form__file-item">
              <span>
                {file.name} ({formatBytes(file.size)})
              </span>
              <button
                type="button"
                className="conv-edit-form__tag-remove"
                onClick={() => onChange(value.filter((item) => item.id !== file.id))}
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FormField({
  field,
  value,
  onChange,
  error,
}: {
  field: FormFieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const baseId = useId();
  const inputId = `${baseId}-${field.name}`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [field.description ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const labelClass = field.required
    ? "conv-edit-form__label conv-edit-form__label-required"
    : "conv-edit-form__label";

  const fieldClass = field.autoFilled
    ? "conv-edit-form__field conv-edit-form__field--autofill"
    : "conv-edit-form__field";

  return (
    <div className={fieldClass}>
      {field.type === "file" ? (
        <span className={labelClass}>{field.label}</span>
      ) : (
        <label htmlFor={inputId} className={labelClass}>
          {field.label}
        </label>
      )}
      {field.description ? (
        <p id={hintId} className="conv-edit-form__hint">
          {field.description}
        </p>
      ) : null}
      {field.autoFilled ? (
        <p className="conv-edit-form__autofill-badge">Auto-filled from extraction</p>
      ) : null}

      {field.type === "text" ? (
        <input
          id={inputId}
          type="text"
          className="conv-edit-form__control"
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(error)}
        />
      ) : null}

      {field.type === "textarea" ? (
        <textarea
          id={inputId}
          className="conv-edit-form__control conv-edit-form__textarea"
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          rows={4}
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(error)}
        />
      ) : null}

      {field.type === "enum" ? (
        <select
          id={inputId}
          className="conv-edit-form__control"
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(error)}
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "datetime" ? (
        <input
          id={inputId}
          type="datetime-local"
          className="conv-edit-form__control"
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(error)}
        />
      ) : null}

      {field.type === "tags" ? (
        <TagsField
          field={field}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
          inputId={inputId}
          describedBy={describedBy || hintId}
          error={error}
        />
      ) : null}

      {field.type === "table" ? (
        <TableField
          field={field}
          value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
          onChange={onChange}
        />
      ) : null}

      {field.type === "file" ? (
        <FileField
          field={field}
          value={Array.isArray(value) ? (value as FileMeta[]) : []}
          onChange={onChange}
          inputId={inputId}
          describedBy={describedBy || hintId}
        />
      ) : null}

      {error ? (
        <p id={errorId} className="conv-edit-form__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SmartForm({
  patternSlug,
  fields,
  initialValues,
  extractionResult,
  onSave,
  onCancel,
  isLoading = false,
}: SmartFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const updateField = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSave = () => {
    const result = validateForm(values, fields);
    setErrors(result.errors);
    if (result.valid) onSave(values);
  };

  return (
    <form
      className="conv-edit-form"
      aria-label={`Edit ${patternSlug.replace(/-/g, " ")} instance`}
      onSubmit={(event) => {
        event.preventDefault();
        handleSave();
      }}
    >
      {extractionResult ? (
        <ExtractionSummary
          confidence={extractionResult.confidence}
          found={extractionResult.found}
          missing={extractionResult.missing}
        />
      ) : null}

      <div className="conv-edit-form__fields">
        {fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(value) => updateField(field.name, value)}
            error={errors[field.name]}
          />
        ))}
      </div>

      <div className="conv-edit-form__footer">
        <button
          type="submit"
          className="conv-edit-btn conv-edit-btn--primary"
          disabled={isLoading}
        >
          Save
        </button>
        {onCancel ? (
          <button
            type="button"
            className="conv-edit-btn conv-edit-btn--secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
