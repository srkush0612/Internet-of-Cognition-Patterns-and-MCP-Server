"use client";

import { useCallback, useId, useState } from "react";
import type { EditableField } from "@/lib/editable-fields";
import type { FileMetadata } from "@/lib/edit-panel-validation";
import {
  workspaceFieldInputClass,
  workspaceFieldLabelClass,
  workspaceFieldSelectClass,
  workspaceFieldTextareaClass,
} from "@/components/workspaces/shared";

const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx", "txt", "json", "csv"];

function fieldId(baseId: string, key: string): string {
  return `${baseId}-${key}`;
}

function isAcceptedFile(file: File, accept?: string): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (accept) {
    const parts = accept.split(",").map((part) => part.trim().replace(/^\./, ""));
    return parts.includes(ext);
  }
  return ACCEPTED_EXTENSIONS.includes(ext);
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function TagsInput({
  field,
  value,
  onChange,
  onBlur,
  error,
  inputId,
  describedBy,
}: {
  field: EditableField;
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  error?: string;
  inputId: string;
  describedBy: string;
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
      <div className="pattern-edit-panel__tags" aria-label={field.label}>
        {value.map((tag) => (
          <span key={tag} className="pattern-edit-panel__tag">
            {tag}
            <button
              type="button"
              className="pattern-edit-panel__tag-remove"
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
        className={workspaceFieldInputClass}
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
          onBlur?.();
        }}
        placeholder={field.placeholder}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
      />
    </div>
  );
}

function TableInput({
  field,
  value,
  onChange,
}: {
  field: EditableField;
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
}) {
  const columns = field.columns ?? [];
  const template = field.rowTemplate ?? {};

  const updateCell = (
    rowIndex: number,
    columnKey: string,
    cellValue: unknown,
  ) => {
    const rows = value.map((row, index) =>
      index === rowIndex ? { ...row, [columnKey]: cellValue } : row,
    );
    onChange(rows);
  };

  const removeRow = (rowIndex: number) => {
    if (!window.confirm("Remove this row?")) return;
    onChange(value.filter((_, index) => index !== rowIndex));
  };

  return (
    <div>
      <table className="pattern-edit-panel__table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {value.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.type === "tags" ? (
                    <TagsInput
                      field={{
                        ...field,
                        key: column.key,
                        label: column.label,
                        placeholder: column.placeholder,
                      }}
                      value={Array.isArray(row[column.key])
                        ? (row[column.key] as string[])
                        : []}
                      onChange={(tags) => updateCell(rowIndex, column.key, tags)}
                      inputId={`${field.key}-${rowIndex}-${column.key}`}
                      describedBy={`${field.key}-${rowIndex}-${column.key}-hint`}
                    />
                  ) : (
                    <input
                      type="text"
                      className={workspaceFieldInputClass}
                      value={String(row[column.key] ?? "")}
                      onChange={(event) =>
                        updateCell(rowIndex, column.key, event.target.value)
                      }
                      placeholder={column.placeholder}
                    />
                  )}
                </td>
              ))}
              <td>
                <button
                  type="button"
                  className="pattern-edit-panel__btn-secondary"
                  onClick={() => removeRow(rowIndex)}
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
        className="pattern-edit-panel__btn-secondary"
        style={{ marginTop: "0.5rem" }}
        onClick={() => onChange([...value, { ...template }])}
      >
        + Add row
      </button>
    </div>
  );
}

function FileInput({
  field,
  value,
  onChange,
  inputId,
  describedBy,
}: {
  field: EditableField;
  value: FileMetadata[];
  onChange: (value: FileMetadata[]) => void;
  inputId: string;
  describedBy: string;
}) {
  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const next: FileMetadata[] = [...value];
      for (const file of Array.from(files)) {
        if (!isAcceptedFile(file, field.accept)) continue;
        next.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        });
      }
      onChange(next);
    },
    [field.accept, onChange, value],
  );

  return (
    <div className="pattern-edit-panel__file-input">
      <label
        htmlFor={inputId}
        className="pattern-edit-panel__dropzone"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            document.getElementById(inputId)?.click();
          }
        }}
      >
        Drop files or click to upload
        <br />
        <span className="pattern-edit-panel__hint">pdf, doc, docx, txt, json, csv</span>
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
        <ul className="pattern-edit-panel__file-list">
          {value.map((file) => (
            <li key={file.id} className="pattern-edit-panel__file-item">
              <span>
                {file.name} · {formatBytes(file.size)}
              </span>
              <button
                type="button"
                className="pattern-edit-panel__tag-remove"
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

export type EditFieldRendererProps = {
  field: EditableField;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  error?: string;
};

export function EditFieldRenderer({
  field,
  value,
  onChange,
  onBlur,
  error,
}: EditFieldRendererProps) {
  const baseId = useId();
  const inputId = fieldId(baseId, field.key);
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [field.description ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const labelClass = field.required
    ? `${workspaceFieldLabelClass} after:ml-0.5 after:text-warning after:content-['*']`
    : workspaceFieldLabelClass;

  const fieldLabel =
    field.type === "file" ? (
      <span className={labelClass}>{field.label}</span>
    ) : (
      <label htmlFor={inputId} className={labelClass}>
        {field.label}
      </label>
    );

  return (
    <div className="pattern-edit-panel__field">
      {fieldLabel}
      {field.description ? (
        <p id={hintId} className="pattern-edit-panel__hint">
          {field.description}
        </p>
      ) : null}

      {field.type === "text" || field.type === "readonly" ? (
        <input
          id={inputId}
          type="text"
          className={workspaceFieldInputClass}
          value={String(value ?? "")}
          readOnly={field.type === "readonly"}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(error)}
        />
      ) : null}

      {field.type === "textarea" ? (
        <textarea
          id={inputId}
          className={workspaceFieldTextareaClass}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          rows={4}
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(error)}
        />
      ) : null}

      {field.type === "enum" ? (
        <select
          id={inputId}
          className={workspaceFieldSelectClass}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
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
          className={workspaceFieldInputClass}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(error)}
        />
      ) : null}

      {field.type === "tags" ? (
        <TagsInput
          field={field}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={(tags) => onChange(tags)}
          onBlur={onBlur}
          error={error}
          inputId={inputId}
          describedBy={describedBy || hintId}
        />
      ) : null}

      {field.type === "table" ? (
        <TableInput
          field={field}
          value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
          onChange={(rows) => onChange(rows)}
        />
      ) : null}

      {field.type === "file" ? (
        <FileInput
          field={field}
          value={Array.isArray(value) ? (value as FileMetadata[]) : []}
          onChange={(files) => onChange(files)}
          inputId={inputId}
          describedBy={describedBy || hintId}
        />
      ) : null}

      {error ? (
        <p id={errorId} className="pattern-edit-panel__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
