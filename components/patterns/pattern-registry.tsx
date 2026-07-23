import type { ComponentType } from "react";
import { CredentialBoundary, CredentialBoundaryInbox } from "./CredentialBoundary";
import { PresenceBoundary, PresenceBoundaryInbox } from "./PresenceBoundary";

type StandaloneProps = { compact?: boolean };

export const PATTERN_STANDALONE: Partial<
  Record<string, ComponentType<StandaloneProps>>
> = {
  "presence-boundary": PresenceBoundary,
  "credential-boundary": CredentialBoundary,
};

export const PATTERN_INBOX: Partial<Record<string, ComponentType>> = {
  "presence-boundary": PresenceBoundaryInbox,
  "credential-boundary": CredentialBoundaryInbox,
};

export function hasDesignReady(slug: string): boolean {
  return slug in PATTERN_STANDALONE;
}

export function hasPatternStandalone(slug: string): boolean {
  return slug in PATTERN_STANDALONE;
}

export function hasPatternInbox(slug: string): boolean {
  return slug in PATTERN_INBOX;
}
