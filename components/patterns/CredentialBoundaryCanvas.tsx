import type { BoundarySplitData } from "@/lib/boundary-split";
import { BoundarySplitCard } from "./BoundarySplitCard";
import { PatternComponentCard } from "./PatternComponentCard";
import { LockIcon } from "./icons";

export function CredentialBoundaryCanvas({
  data,
  compact = false,
  showCardChrome = true,
  contextLabel,
}: {
  data: BoundarySplitData;
  compact?: boolean;
  showCardChrome?: boolean;
  contextLabel?: string;
}) {
  const body = <BoundarySplitCard data={data} compact={compact} />;

  if (!showCardChrome) {
    return body;
  }

  return (
    <PatternComponentCard
      patternKey="CredentialBoundary"
      researchDot
      title="Credential Boundary"
      contextLabel={contextLabel?.trim() || "Loan review"}
      icon={<LockIcon size={compact ? 15 : 18} />}
      footerLeft="Boundary set by compliance"
      footerRight="flagged 2m ago"
      compact={compact}
    >
      {body}
    </PatternComponentCard>
  );
}
