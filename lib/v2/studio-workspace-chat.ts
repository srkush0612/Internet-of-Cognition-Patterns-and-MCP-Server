import { AUDIENCE_LABEL, CHANNEL_LABEL, LEVEL_LABEL } from "./levels";
import { MODE_LABEL, MODE_ORDER, getMode } from "./modes";
import { answerAboutPattern } from "./studio-chat";
import { canRenderBehaviorNote } from "./studio-generated-ui";
import type { SpecDraft } from "./spec";
import type { Audience, Channel, Level, Mode, Pattern } from "./types";

export type WorkspaceEffect =
  | { kind: "behavior_note"; value: string; replaceLast?: boolean }
  | { kind: "timed_trigger"; value: string; note: string }
  | { kind: "trigger"; value: string }
  | { kind: "mode"; value: Mode }
  | { kind: "channel"; value: Channel }
  | { kind: "audience"; value: Audience }
  | { kind: "level"; value: Level }
  | { kind: "response"; action: "add" | "remove"; value: string };

export type WorkspaceReply = { text: string; effect?: WorkspaceEffect };

const CHANNEL_WORDS: Array<[RegExp, Channel]> = [
  [/\b(state signal|status signal)\b/, "state_signal"],
  [/\b(shared record|agent record)\b/, "shared_record"],
  [/\b(agent message|agent-to-agent|peer message)\b/, "agent_message"],
  [/\b(settings|setup)\b/, "settings_panel"],
  [/\b(shared (ui|workspace)|workspace)\b/, "shared_ui"],
  [/\b(chat|conversation)\b/, "chat_ui"],
];
const AUDIENCE_WORDS: Array<[RegExp, Audience]> = [
  [/\b(orchestrator)\b/, "orchestrator"],
  [/\b(peer agent|another agent)\b/, "peer_agent"],
  [/\b(team|several people)\b/, "team"],
  [/\b(operator|human|person)\b/, "operator"],
  [/\b(itself|own record)\b/, "self"],
];
const LEVEL_WORDS: Array<[RegExp, Level]> = [
  [/\b(many people|several people|multiple teams)\b/, "L4"],
  [/\b(agents only|no person|headless)\b/, "L2"],
  [/\b(one agent|single agent)\b/, "L1"],
  [/\b(agent and a person|with a person|human in the loop)\b/, "L3"],
];

function cleaned(value: string): string {
  return value.trim().replace(/^["“']|["”']$/g, "").replace(/[.!]$/, "").trim();
}

/** Local interpretation: known behavior slots are structured; other descriptions are preserved verbatim. */
export function interpretWorkspacePrompt(pattern: Pattern, draft: SpecDraft, message: string): WorkspaceReply {
  const raw = message.trim();
  const lower = raw.toLowerCase();
  if (!raw) return { text: "Describe how the pattern should behave in your UI." };

  if (/\b(color|colour|accent|font|spacing|layout|animation|motion|radius)\b/.test(lower)) {
    return { text: "Describe a behavior change such as when the pattern appears, what it reveals, or what someone can decide. The canvas will update the interaction." };
  }
  if (/\b(edit|rewrite|shorten|change)\b.*\b(agent message|message copy|wording)\b/.test(lower)) {
    return { text: "Agent message copy stays in the catalog reference. Describe how the interaction should behave in your UI instead." };
  }
  if (/\b(export|figma|markdown|download|copy)\b/.test(lower) && /\?|\b(how|where|can i)\b/.test(lower)) {
    return { text: "Open Export to copy the behavior brief or download an SVG of the adapted interaction for Figma." };
  }

  const triggerEdit = raw.match(/^(?:change|set|make|move)\s+(?:the\s+)?(?:trigger|moment|when\s+it\s+happens)\s+(?:to|as|:)\s*(.+)$/i);
  if (triggerEdit) {
    const value = cleaned(triggerEdit[1]);
    if (value) return { text: `Updated when this happens: ${value}.`, effect: { kind: "trigger", value } };
  }
  const timingRequest = raw.match(/^(?:only\s+)?(?:surface|show|present|display|send)\s+(?:this|it|the\s+interaction)\s+(after|when|before)\s+(.+)$/i);
  if (timingRequest) {
    const value = cleaned(timingRequest[2]);
    if (value) return { text: `Updated when this happens: ${timingRequest[1].toLowerCase()} ${value}.`, effect: { kind: "timed_trigger", value, note: raw } };
  }

  const responses = [...new Set([...(pattern.responses ?? getMode(pattern.mode.primary).responses), ...draft.responses])];
  const response = responses.find((value) => lower.includes(value.toLowerCase()));
  if (/\b(remove|drop|without|take out)\b/.test(lower) && response) {
    if (!draft.responses.includes(response)) return { text: `${response} is already unavailable.` };
    return { text: `Removed ${response} from the receiver's choices.`, effect: { kind: "response", action: "remove", value: response } };
  }
  if (/\b(add|restore|put back|bring back)\b/.test(lower) && response) {
    if (draft.responses.includes(response)) return { text: `${response} is already available.` };
    return { text: `Added ${response} to the receiver's choices.`, effect: { kind: "response", action: "add", value: response } };
  }
  const allowResponse = raw.match(/^(?:let|allow|enable)\s+(?:the\s+)?(?:operator|user|person|receiver|team)\s+(?:to\s+)?([a-z][a-z -]*?)(?:\s+the\s+(?:decision|action|result))?[.!]?$/i);
  if (allowResponse) {
    const value = cleaned(allowResponse[1]).toLowerCase();
    if (value && !draft.responses.includes(value)) return { text: `Added ${value} to the receiver's choices.`, effect: { kind: "response", action: "add", value } };
    if (value) return { text: `${value} is already available.` };
  }

  const changeVerb = /\b(show|move|put|switch|change|use|make|set|send|deliver)\b/.test(lower);
  if (changeVerb) {
    const channel = CHANNEL_WORDS.find(([match]) => match.test(lower))?.[1];
    if (channel && /\b(in|into|through|on|as|surface|channel|place|show|move|put|switch)\b/.test(lower)) {
      return { text: `Updated the delivery surface to ${CHANNEL_LABEL[channel].toLowerCase()}.`, effect: { kind: "channel", value: channel } };
    }
    const level = LEVEL_WORDS.find(([match]) => match.test(lower))?.[1];
    if (level) return { text: `Updated the participants to ${LEVEL_LABEL[level].toLowerCase()}.`, effect: { kind: "level", value: level } };
    const audience = AUDIENCE_WORDS.find(([match]) => match.test(lower))?.[1];
    if (audience && /\b(to|for|receiver|recipient|audience)\b/.test(lower)) {
      return { text: `Updated the receiver to ${AUDIENCE_LABEL[audience].toLowerCase()}.`, effect: { kind: "audience", value: audience } };
    }
    const mode = MODE_ORDER.find((value) => lower.includes(value) || lower.includes(getMode(value).opens_with.toLowerCase()));
    if (mode && /\b(mode|move|action|agent)\b/.test(lower)) {
      return { text: `Updated the agent move to ${MODE_LABEL[mode].toLowerCase()}.`, effect: { kind: "mode", value: mode } };
    }
  }

  const asksAboutPattern = /\?$/.test(raw) || /^(why|how|what|which|where|does|is this|can you explain)\b/.test(lower);
  if (asksAboutPattern && !/\b(make|change|show|ask|wait|require|only|instead|should)\b/.test(lower)) {
    const answer = answerAboutPattern(pattern, draft, raw);
    return { text: answer.reply.startsWith("I can tell you")
      ? "Describe when this should happen, what the agent should do, and what the receiver can decide. I’ll update the interaction on the canvas."
      : answer.reply };
  }

  if (canRenderBehaviorNote(raw)) return {
    text: "Updated the interaction on your canvas.",
    effect: { kind: "behavior_note", value: raw, replaceLast: /^(instead\b|replace\s+(?:the\s+)?(?:last|previous)\b|change\s+(?:the\s+)?(?:last|previous)\b)/i.test(raw) },
  };
  return { text: "I can update the interaction's timing, evidence order, approval step, surface, or receiver choices. Describe one of those changes and the UI will update on the canvas." };
}
