"use client";

import { fieldsForSlug } from "@/lib/pattern-field-config";
import type { EditableInstance } from "@/lib/instance-edit-model";

type InstanceViewPanelProps = {
  draft: EditableInstance;
};

function formatValue(value: unknown, type: string): string {
  if (type === "string-list" && Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "—";
  }
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return "—";
}

export function InstanceViewPanel({ draft }: InstanceViewPanelProps) {
  const fields = fieldsForSlug(draft.patternType);
  const contextEntries = Object.entries(draft.context);

  return (
    <div className="space-y-4 overflow-y-auto pb-4">
      <div className="rounded-xl border border-line bg-white p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-subtle">
          Instance
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Name</dt>
            <dd className="font-medium text-ink">{draft.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Pattern</dt>
            <dd className="font-medium text-ink">{draft.patternType}</dd>
          </div>
          {draft.updatedAt ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Updated</dt>
              <dd className="text-ink">
                {new Date(draft.updatedAt).toLocaleString()}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="rounded-xl border border-line bg-white p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-subtle">
          Parameters
        </h3>
        {fields.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No field schema for this pattern.</p>
        ) : (
          <dl className="mt-3 space-y-3">
            {fields.map((field) => (
              <div key={field.key}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">
                  {field.label}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">
                  {formatValue(draft.parameters[field.key], field.type)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {contextEntries.length > 0 ? (
        <div className="rounded-xl border border-line bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-subtle">
            Context
          </h3>
          <dl className="mt-3 space-y-2">
            {contextEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 text-sm">
                <dt className="text-muted">{key}</dt>
                <dd className="font-medium text-ink">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
