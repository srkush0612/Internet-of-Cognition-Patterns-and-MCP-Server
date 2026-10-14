import { AUDIENCE_LABEL, CHANNEL_LABEL, LEVEL_LABEL } from "./levels";
import { MODE_LABEL } from "./modes";
import { buildStudioGeneratedUi } from "./studio-generated-ui";
import { composeSpec, type SpecDraft } from "./spec";
import type { Pattern } from "./types";

export type StudioExportState = {
  draft: SpecDraft;
  behaviorNotes: string[];
  changes: string[];
};

export function studioMarkdown(pattern: Pattern, state: StudioExportState): string {
  const { draft, behaviorNotes, changes } = state;
  const shapedSpec = composeSpec(draft).sentence ?? "Complete the missing behavior details in Studio.";
  return [
    `# ${pattern.name} — behavior for your UI`,
    "",
    `Adapted from the **${pattern.name}** pattern in the HAX catalog.`,
    "",
    "## Original behavior",
    "",
    pattern.spec,
    "",
    "## Your behavior",
    "",
    shapedSpec,
    "",
    `- **When:** ${draft.trigger || "Not set"}`,
    `- **Agent move:** ${draft.mode ? MODE_LABEL[draft.mode] : "Not set"}`,
    `- **Receiver:** ${draft.audience ? AUDIENCE_LABEL[draft.audience] : "Not set"}`,
    `- **Participants:** ${draft.level ? LEVEL_LABEL[draft.level] : "Not set"}`,
    `- **Surface:** ${draft.channel ? CHANNEL_LABEL[draft.channel] : "Not set"}`,
    `- **Receiver choices:** ${draft.responses.length ? draft.responses.join(", ") : "None specified"}`,
    "",
    ...(behaviorNotes.length ? ["### How it works in your UI", "", ...behaviorNotes.map((note) => `- ${note}`), ""] : []),
    ...(changes.length ? ["## Changes made in Studio", "", ...changes.map((change) => `- ${change}`), ""] : []),
    "## Reference",
    "",
    "The catalog preview is the original pattern. Studio renders the adapted interaction from the behavior above.",
    "",
    `Catalog pattern: /v2/patterns/${pattern.id}`,
    "",
  ].join("\n");
}

function xml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function wrapped(value: string, maxChars: number, maxLines: number): string[] {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current && `${current} ${word}`.length > maxChars) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,; ]+$/, "")}…`;
  }
  return lines;
}

function textLines(value: string, x: number, y: number, maxChars: number, maxLines: number, size = 22, lineHeight = 30, weight = 500): string {
  return `<text x="${x}" y="${y}" fill="#20313d" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}">${wrapped(value, maxChars, maxLines).map((line, index) => `<tspan x="${x}" dy="${index ? lineHeight : 0}">${xml(line)}</tspan>`).join("")}</text>`;
}

/** A vector rendering of the adapted interaction that can be opened in Figma. */
export function studioSvg(pattern: Pattern, state: StudioExportState): string {
  const model = buildStudioGeneratedUi(pattern, state.draft, state.behaviorNotes);
  const evidenceY = model.order === "evidence_first" ? 277 : 468;
  const outputY = model.order === "evidence_first" ? 410 : 272;
  const explanationY = model.order === "evidence_first" ? 532 : 389;
  const evidence = model.evidence.slice(0, 3).map((item, index) => {
    const x = 88 + index * 344;
    return `<rect x="${x}" y="${evidenceY}" width="324" height="112" rx="8" fill="#ffffff" stroke="#dce5e8"/><text x="${x + 17}" y="${evidenceY + 24}" fill="#71808a" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1">${xml(item.label.toUpperCase())}</text>${textLines(item.value, x + 17, evidenceY + 53, 36, 2, 17, 22, 600)}`;
  }).join("");
  const actions = model.actions.slice(0, 4).map((action, index) => {
    const x = 88 + index * 170;
    return `<rect x="${x}" y="612" width="156" height="42" rx="7" fill="#ffffff" stroke="#bfcdd3"/><text x="${x + 16}" y="638" fill="#20313d" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600">${xml(action.slice(0, 18))}</text>`;
  }).join("");
  const surface = state.draft.channel ? CHANNEL_LABEL[state.draft.channel] : CHANNEL_LABEL[model.channel];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="${xml(pattern.name)} adapted interaction">
<rect width="1200" height="720" fill="#f7fafb"/>
<rect x="0" y="0" width="1200" height="66" fill="#ffffff"/><path d="M0 66H1200" stroke="#dce5e8"/>
<text x="45" y="42" fill="#20313d" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700">HAX</text><text x="114" y="41" fill="#71808a" font-family="Arial, Helvetica, sans-serif" font-size="14">Studio · adapted pattern UI</text>
<text x="48" y="115" fill="#71808a" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.8">${xml(pattern.name.toUpperCase())} / ${xml(surface.toUpperCase())}</text>
<rect x="48" y="145" width="1104" height="535" rx="15" fill="#ffffff" stroke="#dce5e8"/>
<rect x="70" y="167" width="1060" height="490" rx="10" fill="#f9fbfc" stroke="#dce5e8"/>
<text x="88" y="198" fill="#20313d" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700">${xml(model.agentName)}</text><text x="1085" y="198" text-anchor="end" fill="#71808a" font-family="Arial, Helvetica, sans-serif" font-size="12">${xml(surface)}</text>
<path d="M88 214H1112" stroke="#dce5e8"/>
<text x="88" y="239" fill="#71808a" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700">WHEN · ${xml(model.trigger.slice(0, 98))}</text>
<path d="M88 ${outputY}V${outputY + 83}" stroke="#18b6d9" stroke-width="3"/>
<text x="106" y="${outputY + 20}" fill="#71808a" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="1">${xml((state.draft.mode ? MODE_LABEL[state.draft.mode] : "AGENT MOVE").toUpperCase())}</text>
${textLines(model.title, 106, outputY + 54, 54, 1, 27, 32, 700)}
${textLines(model.output, 106, outputY + 82, 95, 2, 17, 22)}
<rect x="88" y="${explanationY}" width="1024" height="59" rx="7" fill="#eef8fa"/>
<text x="104" y="${explanationY + 20}" fill="#71808a" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" letter-spacing="1">${model.reveal === "on_request" ? "REVEALED AFTER THE PERSON ASKS WHY" : "WHY THIS APPEARS"}</text>
${textLines(model.rationale, 104, explanationY + 42, 112, 1, 16, 20)}
${evidence}
${actions}
<text x="1120" y="639" text-anchor="end" fill="#71808a" font-family="Arial, Helvetica, sans-serif" font-size="12">${xml(model.approval ? "Agent waits for a decision" : "Interactive choices in Studio")}</text>
</svg>`;
}
