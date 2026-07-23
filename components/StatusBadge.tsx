import { getPatternStatus, type Pattern, type PatternStatus } from "@/lib/patterns";

const statusClass: Record<PatternStatus, string> = {
  Unverified: "status-badge--unverified",
  Grounded: "status-badge--grounded",
};

export function StatusBadge({
  status,
  pattern,
}: {
  status?: PatternStatus;
  pattern?: Pattern;
}) {
  const resolved =
    status ?? (pattern ? getPatternStatus(pattern) : "Unverified");

  return (
    <span className={`status-badge ${statusClass[resolved]}`}>{resolved}</span>
  );
}
