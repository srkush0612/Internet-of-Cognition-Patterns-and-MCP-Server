import type { ComponentType } from "react";
import { PATTERN_READY_SLUGS, isPatternReady } from "@/lib/pattern-ready";
import type { PatternLivePreviewInput } from "@/lib/pattern-live-preview";
import type { ConvergenceSaveRevealState } from "@/lib/convergence-save-reveal";
import { CredentialBoundary, CredentialBoundaryInbox } from "./CredentialBoundary";
import { PresenceBoundary, PresenceBoundaryInbox } from "./PresenceBoundary";
import {
  BackgroundWorkLedger,
  BackgroundWorkLedgerInbox,
} from "./BackgroundWorkLedger";
import {
  DependencyLineageView,
  DependencyLineageViewInbox,
} from "./DependencyLineageView";
import { AuthorityGradient, AuthorityGradientInbox } from "./AuthorityGradient";
import {
  SignalToIntentHandshake,
  SignalToIntentHandshakeInbox,
} from "./SignalToIntentHandshake";
import { DeferredDetail, DeferredDetailInContext } from "./DeferredDetail";
import { PatternChangeShell } from "./PatternChangeShell";
import { ConvergencePoint, ConvergencePointInContext } from "./ConvergencePoint";
import { AssumptionSurface } from "./AssumptionSurface";
import { DecisionLedger, DecisionLedgerInContext } from "./DecisionLedger";
import {
  MemoryCommitmentReview,
  MemoryCommitmentInContext,
} from "./MemoryCommitmentReview";

export type PatternPreviewProps = {
  compact?: boolean;
  live?: PatternLivePreviewInput;
  saveReveal?: ConvergenceSaveRevealState;
};

type StandaloneProps = PatternPreviewProps;

/** Curated patterns with reference designs, shown as Ready on the index. */
export { PATTERN_READY_SLUGS } from "@/lib/pattern-ready";

export const PATTERN_STANDALONE: Partial<
  Record<string, ComponentType<StandaloneProps>>
> = {
  "assumption-surface": AssumptionSurface,
  "presence-boundary": PresenceBoundary,
  "credential-boundary": CredentialBoundary,
  "background-work-ledger": BackgroundWorkLedger,
  "dependency-and-lineage-view": DependencyLineageView,
  "authority-gradient": AuthorityGradient,
  "signal-to-intent-handshake": SignalToIntentHandshake,
  "deferred-detail": DeferredDetail,
  "convergence-point": ConvergencePoint,
  "decision-ledger": DecisionLedger,
  "memory-commitment-review": MemoryCommitmentReview,
};

export const PATTERN_INBOX: Partial<Record<string, ComponentType<PatternPreviewProps>>> = {
  "presence-boundary": PresenceBoundaryInbox,
  "credential-boundary": CredentialBoundaryInbox,
  "background-work-ledger": BackgroundWorkLedgerInbox,
  "dependency-and-lineage-view": DependencyLineageViewInbox,
  "authority-gradient": AuthorityGradientInbox,
  "signal-to-intent-handshake": SignalToIntentHandshakeInbox,
  "deferred-detail": DeferredDetailInContext,
  "convergence-point": ConvergencePointInContext,
  "decision-ledger": DecisionLedgerInContext,
  "memory-commitment-review": MemoryCommitmentInContext,
};

export function hasDesignReady(slug: string): boolean {
  return isPatternReady(slug);
}

export function hasPatternStandalone(slug: string): boolean {
  return slug in PATTERN_STANDALONE;
}

export function hasPatternInbox(slug: string): boolean {
  return slug in PATTERN_INBOX;
}
