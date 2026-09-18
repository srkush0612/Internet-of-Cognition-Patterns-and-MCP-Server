import { editableFieldsForSlug, type EditableField } from "@/lib/editable-fields";

export type PlaygroundEditableState = {
  name: string;
  parameters: Record<string, unknown>;
  context: Record<string, string>;
};

export type NlApplyResult =
  | { ok: true; state: PlaygroundEditableState; message: string }
  | { ok: false; message: string };

type FieldMatch = { kind: "name" } | { kind: "field"; field: EditableField };

const SET_RE = /^\s*(?:set|change|make)\s+(?:the\s+)?(.+?)\s+to\s+(.+?)\s*$/i;
const ADD_RE = /^\s*add\s+(.+?)\s+to\s+(?:the\s+)?(.+?)\s*$/i;
const REMOVE_RE = /^\s*remove\s+(.+?)\s+from\s+(?:the\s+)?(.+?)\s*$/i;
const CLEAR_RE = /^\s*clear\s+(?:the\s+)?(.+?)\s*$/i;

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^["'](.*)["']$/);
  return match ? match[1] : trimmed;
}

function findField(schema: EditableField[], ref: string): EditableField | undefined {
  const normalizedRef = ref.trim().toLowerCase();
  return (
    schema.find((f) => f.key.toLowerCase() === normalizedRef) ??
    schema.find((f) => f.label.toLowerCase() === normalizedRef) ??
    schema.find(
      (f) =>
        f.label.toLowerCase().includes(normalizedRef) ||
        normalizedRef.includes(f.label.toLowerCase()),
    ) ??
    schema.find((f) => f.key.toLowerCase().includes(normalizedRef))
  );
}

function resolveFieldRef(slug: string, ref: string): FieldMatch | undefined {
  const normalizedRef = ref.trim().toLowerCase();
  if (normalizedRef === "title" || normalizedRef === "name") {
    return { kind: "name" };
  }

  const schema = editableFieldsForSlug(slug);
  const field = findField([...schema.parameters, ...schema.context], ref);
  return field ? { kind: "field", field } : undefined;
}

function listKnownFields(slug: string): string {
  const schema = editableFieldsForSlug(slug);
  const labels = [
    "title",
    ...schema.parameters.map((f) => f.label),
    ...schema.context.map((f) => f.label),
  ];
  return labels.join(", ");
}

function applyToState(
  current: PlaygroundEditableState,
  match: FieldMatch,
  transform: (existing: unknown) => unknown,
): PlaygroundEditableState {
  if (match.kind === "name") {
    return { ...current, name: String(transform(current.name) ?? "") };
  }

  const { field } = match;
  if (field.section === "context") {
    return {
      ...current,
      context: {
        ...current.context,
        [field.key]: String(transform(current.context[field.key]) ?? ""),
      },
    };
  }

  return {
    ...current,
    parameters: {
      ...current.parameters,
      [field.key]: transform(current.parameters[field.key]),
    },
  };
}

function asTagArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/**
 * A small rule-based instruction interpreter — no external LLM call. Understands:
 *   set/change/make <field> to <value>
 *   add <value> to <field>          (tags fields only)
 *   remove <value> from <field>     (tags fields only)
 *   clear <field>
 * Matches <field> against editableFieldsForSlug(slug)'s real labels/keys, so it
 * stays in sync with whatever fields Config actually exposes for this pattern.
 */
export function applyPlaygroundInstruction(
  slug: string,
  instruction: string,
  current: PlaygroundEditableState,
): NlApplyResult {
  const trimmed = instruction.trim();
  if (!trimmed) {
    return { ok: false, message: "Type an instruction first." };
  }

  const setMatch = trimmed.match(SET_RE);
  if (setMatch) {
    const [, fieldRef, rawValue] = setMatch;
    const match = resolveFieldRef(slug, fieldRef);
    if (!match) {
      return {
        ok: false,
        message: `Couldn't find a field matching "${fieldRef.trim()}". Known fields: ${listKnownFields(slug)}.`,
      };
    }
    const value = stripQuotes(rawValue);
    if (match.kind === "field" && match.field.type === "tags") {
      const tags = value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      return {
        ok: true,
        state: applyToState(current, match, () => tags),
        message: `Set ${match.field.label} to: ${tags.join(", ")}.`,
      };
    }
    if (match.kind === "field" && !["text", "textarea", "enum"].includes(match.field.type)) {
      return {
        ok: false,
        message: `"${match.field.label}" is a ${match.field.type} field — Ask can't edit that type yet. Try the Config tab.`,
      };
    }
    return {
      ok: true,
      state: applyToState(current, match, () => value),
      message: `Set ${match.kind === "name" ? "title" : match.field.label} to "${value}".`,
    };
  }

  const addMatch = trimmed.match(ADD_RE);
  if (addMatch) {
    const [, rawValue, fieldRef] = addMatch;
    const match = resolveFieldRef(slug, fieldRef);
    if (!match || match.kind !== "field" || match.field.type !== "tags") {
      return {
        ok: false,
        message: `"add ... to ..." only works for list fields. Known fields: ${listKnownFields(slug)}.`,
      };
    }
    const value = stripQuotes(rawValue);
    return {
      ok: true,
      state: applyToState(current, match, (existing) => {
        const tags = asTagArray(existing);
        return tags.includes(value) ? tags : [...tags, value];
      }),
      message: `Added "${value}" to ${match.field.label}.`,
    };
  }

  const removeMatch = trimmed.match(REMOVE_RE);
  if (removeMatch) {
    const [, rawValue, fieldRef] = removeMatch;
    const match = resolveFieldRef(slug, fieldRef);
    if (!match || match.kind !== "field" || match.field.type !== "tags") {
      return {
        ok: false,
        message: `"remove ... from ..." only works for list fields. Known fields: ${listKnownFields(slug)}.`,
      };
    }
    const value = stripQuotes(rawValue).toLowerCase();
    return {
      ok: true,
      state: applyToState(current, match, (existing) =>
        asTagArray(existing).filter((v) => v.toLowerCase() !== value),
      ),
      message: `Removed "${stripQuotes(rawValue)}" from ${match.field.label}.`,
    };
  }

  const clearMatch = trimmed.match(CLEAR_RE);
  if (clearMatch) {
    const [, fieldRef] = clearMatch;
    const match = resolveFieldRef(slug, fieldRef);
    if (!match) {
      return {
        ok: false,
        message: `Couldn't find a field matching "${fieldRef.trim()}". Known fields: ${listKnownFields(slug)}.`,
      };
    }
    return {
      ok: true,
      state: applyToState(current, match, (existing) => (Array.isArray(existing) ? [] : "")),
      message: `Cleared ${match.kind === "name" ? "title" : match.field.label}.`,
    };
  }

  return {
    ok: false,
    message: `Didn't understand that. Try "set <field> to <value>", "add/remove <value> to/from <field>", or "clear <field>". Known fields: ${listKnownFields(slug)}.`,
  };
}
