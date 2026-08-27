import type {
  ExtractionQuestionDef,
  InstructionFieldDef,
  PatternInstructions,
  PatternSlug,
} from "./types";

function extractSection(markdown: string, heading: string): string {
  const pattern = new RegExp(
    `(?:^|\\n)## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`,
    "i",
  );
  const match = markdown.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function extractSubSection(section: string, heading: string): string {
  const pattern = new RegExp(
    `(?:^|\\n)### ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n([\\s\\S]*?)(?=\\n### |$)`,
    "i",
  );
  const match = section.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function parseSummary(markdown: string): {
  name: string;
  question: string;
  insight: string;
} {
  const block = extractSection(markdown, "Pattern Summary");
  const name = block.match(/\*\*Name:\*\*\s*(.+)/)?.[1]?.trim() ?? "";
  const question =
    block.match(/\*\*Question it answers:\*\*\s*"?([^"\n]+)"?/)?.[1]?.trim() ??
    "";
  const insight =
    block.match(/\*\*Key insight:\*\*\s*(.+)/)?.[1]?.trim() ?? "";
  return { name, question, insight };
}

function parseFieldBlocks(
  section: string,
  messagePrefix: "Error" | "Warning",
): InstructionFieldDef[] {
  const fields: InstructionFieldDef[] = [];
  const blocks = (`\n${section}`).split(/\n\*\*(?=[a-zA-Z0-9_]+\*\*)/).slice(1);

  for (const block of blocks) {
    const keyMatch = block.match(/^([a-zA-Z0-9_]+)\*\*/);
    if (!keyMatch) continue;
    const key = keyMatch[1]!;
    const kind: InstructionFieldDef["kind"] =
      block.includes("Type: array") ||
      block.includes("Type: ordered array") ||
      block.includes("Type: mapping")
        ? "array"
        : "string";

    const minLengthMatch = block.match(/Min length:\s*(\d+)/i);
    const minItemsMatch = block.match(/Min length:\s*(\d+)/i);
    const emptyMsg = block.match(
      new RegExp(`${messagePrefix} if missing:\\s*"([^"]+)"`, "i"),
    )?.[1];
    const vagueMsg = block.match(/Error if too vague:\s*"([^"]+)"/i)?.[1];

    fields.push({
      key,
      kind,
      minLength: minLengthMatch ? Number(minLengthMatch[1]) : undefined,
      minItems: key.includes("roster") || key === "phases" ? 2 : minItemsMatch ? Number(minItemsMatch[1]) : undefined,
      emptyError: messagePrefix === "Error" ? emptyMsg : undefined,
      missingWarning: messagePrefix === "Warning" ? emptyMsg : undefined,
      vagueError: vagueMsg,
    });
  }

  return fields;
}

function parseExtractionQuestions(markdown: string): ExtractionQuestionDef[] {
  const guidance = extractSection(markdown, "User-Facing Guidance");
  let block =
    extractSubSection(guidance, "Extraction Questions \\(In Chat, Priority Order\\)") ||
    extractSubSection(guidance, "Extraction Questions \\(Priority Order\\)") ||
    extractSubSection(guidance, "Extraction Questions");

  if (!block) {
    const alt = extractSection(markdown, "Extraction Questions \\(For Chat Integration\\)");
    block = alt;
  }

  const questions: ExtractionQuestionDef[] = [];
  const lines = block.split("\n");
  let current: Partial<ExtractionQuestionDef> | null = null;

  for (const line of lines) {
    const numbered = line.match(/^\d+\.\s*(?:\(Optional\)\s*)?\*\*"([^"]+)"\*\*/);
    if (numbered) {
      if (current?.field && current.question) {
        questions.push(current as ExtractionQuestionDef);
      }
      current = {
        question: numbered[1]!.trim(),
        optional: /\(Optional\)/i.test(line),
      };
      continue;
    }

    const fills = line.match(/→\s*Fills\s+([a-zA-Z0-9_]+)/i);
    if (fills && current) {
      current.field = fills[1]!;
    }
  }

  if (current?.field && current.question) {
    questions.push(current as ExtractionQuestionDef);
  }

  return questions;
}

function parseBulletMessages(section: string): Record<string, string> {
  const messages: Record<string, string> = {};
  const blocks = section.split(/\n\*\*/).slice(1);
  for (const block of blocks) {
    const label = block.match(/^([^:*]+):?\*\*/)?.[1]?.trim();
    const quoted = block.match(/"([^"]+)"/)?.[1];
    if (label && quoted) {
      const key = label
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .toLowerCase();
      messages[key] = quoted;
    }
  }
  return messages;
}

function parseRecommendation(markdown: string): PatternInstructions["recommendation"] {
  const guidance = extractSection(markdown, "User-Facing Guidance");
  const block = extractSubSection(guidance, "Recommendation Message");
  const researchQuote =
    block.match(/'([^']+)'/)?.[1] ??
    block.match(/"([^"]+)"/)?.[1] ??
    "";

  const reasons: string[] = [];
  for (const line of block.split("\n")) {
    const bullet = line.match(/^•\s*(.+)/);
    if (bullet) reasons.push(bullet[1]!.trim());
  }

  return {
    subtitle: "Recommended based on your scenario",
    researchLabel: "Research shows this is needed when:",
    researchQuote,
    defaultReasons:
      reasons.length > 0
        ? reasons
        : ["Matches the scenario you described"],
  };
}

function parseMistakes(markdown: string): Record<string, string> {
  const section = extractSection(markdown, "Common Mistakes & Auto-Corrections");
  const suggestions: Record<string, string> = {};
  const blocks = section.split(/\n### /).slice(1);

  for (const block of blocks) {
    const title = block.match(/^([^\n]+)/)?.[1]?.trim();
    const correction = block.match(
      /\*\*Auto-correction:\*\*\s*"([^"]+)"/,
    )?.[1];
    if (title && correction) {
      const key = title
        .replace(/^Mistake \d+:\s*/i, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .toLowerCase();
      suggestions[key] = correction;
    }
  }

  return suggestions;
}

function parseFieldTips(markdown: string): Record<string, string> {
  const section = extractSection(markdown, "Field Guide: Good vs. Bad");
  const tips: Record<string, string> = {};
  const blocks = section.split(/\n### /).slice(1);

  for (const block of blocks) {
    const key = block.match(/^([a-zA-Z0-9_]+)/)?.[1];
    const inline = block.match(
      /\*\*Inline tip to show users:\*\*\s*\n"([^"]+)"/,
    )?.[1];
    const patternFollow = block.match(
      /\*\*Pattern to follow:\*\*\s*\n"([^"]+)"/,
    )?.[1];
    const pattern =
      block.match(/\*\*Pattern:\*\*\s*\n"([^"]+)"/)?.[1] ??
      block.match(/\*\*Pattern:\*\*\s*\n(.+)/)?.[1]?.trim();
    const goodExample = block.match(/\*\*✓ Good:\*\*\s*\n-\s*"([^"]+)"/)?.[1];

    if (key) {
      tips[key] = inline ?? patternFollow ?? pattern ?? goodExample ?? "";
    }
  }

  return tips;
}

/** Default workspace key mapping — overridden per slug in field-mappers */
function defaultWorkspaceMap(fields: InstructionFieldDef[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, field.key]));
}

export function parsePatternInstructions(
  markdown: string,
  slug: PatternSlug,
  workspaceFieldMap?: Record<string, string>,
): PatternInstructions {
  const fieldsSection = extractSection(markdown, "Field Definitions & Requirements");
  const requiredFields = parseFieldBlocks(
    extractSubSection(fieldsSection, "Required Fields"),
    "Error",
  );
  const recommendedFields = parseFieldBlocks(
    extractSubSection(fieldsSection, "Strongly Recommended Fields"),
    "Warning",
  );

  const guidance = extractSection(markdown, "User-Facing Guidance");
  const errorMessages = parseBulletMessages(
    extractSubSection(guidance, "Error Messages"),
  );
  const warningMessages = parseBulletMessages(
    extractSubSection(guidance, "Warning Messages"),
  );

  const summary = parseSummary(markdown);
  const extractionQuestions = parseExtractionQuestions(markdown);

  return {
    slug,
    ...summary,
    requiredFields,
    recommendedFields,
    extractionQuestions,
    errorMessages,
    warningMessages,
    fieldTips: parseFieldTips(markdown),
    mistakeSuggestions: parseMistakes(markdown),
    recommendation: parseRecommendation(markdown),
    workspaceFieldMap:
      workspaceFieldMap ??
      defaultWorkspaceMap([...requiredFields, ...recommendedFields]),
  };
}
