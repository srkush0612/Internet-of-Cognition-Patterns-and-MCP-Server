/** Tracks which instruction fields were answered during chat extraction */

export type InstructionExtractionMeta = {
  answeredFields: string[];
  /** Staging values for fields that share a workspace key */
  staged?: Record<string, string>;
};

const META_KEY = "_instructionExtraction";

export function readExtractionMeta(
  workspace: Record<string, unknown>,
): InstructionExtractionMeta {
  const raw = workspace[META_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { answeredFields: [], staged: {} };
  }
  const meta = raw as InstructionExtractionMeta;
  return {
    answeredFields: Array.isArray(meta.answeredFields) ? meta.answeredFields : [],
    staged:
      meta.staged && typeof meta.staged === "object" && !Array.isArray(meta.staged)
        ? meta.staged
        : {},
  };
}

export function writeExtractionMeta(
  workspace: Record<string, unknown>,
  meta: InstructionExtractionMeta,
): Record<string, unknown> {
  return { ...workspace, [META_KEY]: meta };
}

export function markFieldAnswered(
  workspace: Record<string, unknown>,
  instructionField: string,
  stagedValue?: string,
): Record<string, unknown> {
  const meta = readExtractionMeta(workspace);
  const answeredFields = meta.answeredFields.includes(instructionField)
    ? meta.answeredFields
    : [...meta.answeredFields, instructionField];

  const staged = { ...meta.staged };
  if (stagedValue !== undefined) {
    staged[instructionField] = stagedValue;
  }

  return writeExtractionMeta(workspace, { answeredFields, staged });
}

export function isInstructionFieldAnswered(
  workspace: Record<string, unknown>,
  instructionField: string,
): boolean {
  return readExtractionMeta(workspace).answeredFields.includes(instructionField);
}

/** Remove internal extraction tracking before persisting */
export function stripExtractionMeta(
  workspace: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...workspace };
  delete next[META_KEY];
  return next;
}

export function finalizeExtractionWorkspace(
  slug: string,
  workspace: Record<string, unknown>,
): Record<string, unknown> {
  const meta = readExtractionMeta(workspace);
  const staged = meta.staged ?? {};
  let next = stripExtractionMeta(workspace);

  if (Object.keys(staged).length > 0) {
    next = { ...next };
    for (const [field, value] of Object.entries(staged)) {
      if (value.trim()) {
        next[field] = value.trim();
      }
    }
  }

  void slug;
  return next;
}
