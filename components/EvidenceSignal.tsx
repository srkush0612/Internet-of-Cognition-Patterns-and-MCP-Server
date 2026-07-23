import {
  getEvidenceCount,
  getFilledBarCount,
  isEvidencePending,
  type Pattern,
} from "@/lib/patterns";

export function EvidenceSignal({ pattern }: { pattern: Pattern }) {
  const quoteCount = getEvidenceCount(pattern);
  const filledBars = getFilledBarCount(quoteCount);
  const pending = isEvidencePending(pattern);

  return (
    <div
      className="flex w-full items-end justify-between gap-2"
      aria-label={
        pending
          ? "Evidence pending"
          : `${quoteCount} research quote${quoteCount === 1 ? "" : "s"}`
      }
    >
      <div className="signal-bars" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`signal-bar ${i < filledBars ? "signal-bar--filled-grounded" : ""}`}
          />
        ))}
      </div>
      <span
        className={`signal-count ${pending ? "signal-count--pending" : ""}`}
      >
        {pending
          ? "pending"
          : `${quoteCount} quote${quoteCount === 1 ? "" : "s"}`}
      </span>
    </div>
  );
}
