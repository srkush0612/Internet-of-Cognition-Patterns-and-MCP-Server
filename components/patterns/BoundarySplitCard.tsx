import type { BoundarySplitData } from "@/lib/boundary-split";
import { LockIcon } from "./icons";

function AgentPane({
  agent,
  compact,
}: {
  agent: BoundarySplitData["left"];
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact ? "boundary-split__pane boundary-split__pane--compact" : "boundary-split__pane"
      }
    >
      <p className="boundary-split__agent">{agent.label}</p>
      <div className="boundary-split__steps">
        {agent.steps.map((step, index) => (
          <div key={step}>
            {index > 0 ? <div className="boundary-split__step-divider" aria-hidden /> : null}
            <p className="boundary-split__step">{step}</p>
          </div>
        ))}
      </div>
      <p className="boundary-split__cannot-see">Cannot see {agent.cannotSee}</p>
    </div>
  );
}

export function BoundarySplitCard({
  data,
  compact = false,
}: {
  data: BoundarySplitData;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "boundary-split boundary-split--compact" : "boundary-split"}>
      <div className="boundary-split__grid">
        <AgentPane agent={data.left} compact={compact} />
        <div className="boundary-split__divider" aria-hidden>
          <span className="boundary-split__wall-line" />
          <span className="boundary-split__wall-badge">
            <LockIcon size={compact ? 12 : 14} />
          </span>
          <span className="boundary-split__wall-line" />
        </div>
        <AgentPane agent={data.right} compact={compact} />
      </div>

      <div className="boundary-split__outcome">
        <p className="boundary-split__outcome-label">{data.outcome.label}</p>
        <p className="boundary-split__outcome-text">{data.outcome.text}</p>
      </div>
    </div>
  );
}
