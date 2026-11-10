import { ArrowUpRight, CheckCircle2, CircleDot, FileText, Sparkles } from "lucide-react";
import { SDK_SAMPLES } from "@/lib/v2/sdk-samples";

type FindingVariant = "findings-with-sources" | "findings-with-confidence" | "decision-with-criteria";

export function StructuredFindingPreview({ variant }: { variant: string }) {
  const sample = SDK_SAMPLES.findings as {
    findings: { id: string; title: string; description: string; sources: { label: string }[] }[];
  };
  const report = SDK_SAMPLES["diagnostic-report"] as {
    items: { id: string; suspectedCause: string; confidence: number; confidenceLevel: string; rationale: string; recommendedAction: string }[];
  };
  const rationale = SDK_SAMPLES.rationale as {
    decision: string; reasoning: string; confidence: number; confidenceDescription: string;
    criteria: { label: string; value: string; sentiment: string }[];
  };
  const selected = variant as FindingVariant;

  return (
    <div className="v2-finding-chat">
      <div className="v2-finding-chat__thread">
        <div className="v2-finding-chat__avatar" aria-hidden="true">T</div>
        <div className="v2-finding-chat__body">
          <div className="v2-finding-chat__byline">
            <strong>Triage</strong><span>Incident analyst</span><time>03:42</time>
          </div>
          <p className="v2-finding-chat__intro">
            I reviewed the payments-svc spike. Here&apos;s the finding and the evidence behind it.
          </p>

          {selected === "findings-with-confidence" ? (
            <section className="v2-finding-report" aria-label="Diagnostic findings">
              <div className="v2-finding-report__heading">
                <div><span className="v2-finding-kicker"><Sparkles size={13} /> Diagnostic report</span><h3>Suspected causes</h3></div>
                <span className="v2-finding-report__count">2 findings</span>
              </div>
              {report.items.map((item, index) => (
                <article className="v2-finding-cause" key={item.id}>
                  <div className="v2-finding-cause__top">
                    <span className="v2-finding-rank">{String(index + 1).padStart(2, "0")}</span>
                    <h4>{item.suspectedCause}</h4>
                    <span className={`v2-finding-confidence v2-finding-confidence--${item.confidenceLevel}`}>{item.confidence}% · {item.confidenceLevel}</span>
                  </div>
                  <div className="v2-finding-meter" role="img" aria-label={`${item.confidence}% confidence`}><span style={{ width: `${item.confidence}%` }} /></div>
                  <p>{item.rationale}</p>
                  <div className="v2-finding-action"><span>Recommended action</span><strong>{item.recommendedAction}</strong></div>
                </article>
              ))}
            </section>
          ) : selected === "decision-with-criteria" ? (
            <section className="v2-finding-decision" aria-label="Decision and criteria">
              <span className="v2-finding-kicker"><CircleDot size={13} /> Decision</span>
              <h3>{rationale.decision}</h3>
              <p>{rationale.reasoning}</p>
              <div className="v2-finding-decision__confidence"><span>Confidence</span><strong>{rationale.confidence}%</strong><small>{rationale.confidenceDescription}</small></div>
              <ul className="v2-finding-criteria">
                {rationale.criteria.map((criterion) => <li key={criterion.label} data-sentiment={criterion.sentiment}><CheckCircle2 size={15} /><span>{criterion.label}</span><strong>{criterion.value}</strong></li>)}
              </ul>
            </section>
          ) : (
            <section className="v2-finding-list" aria-label="Findings with sources">
              <div className="v2-finding-list__heading"><span className="v2-finding-kicker"><FileText size={13} /> Findings</span><span>2 claims</span></div>
              {sample.findings.map((finding, index) => (
                <article className="v2-finding-claim" key={finding.id}>
                  <div className="v2-finding-claim__title"><span>{String(index + 1).padStart(2, "0")}</span><h3>{finding.title}</h3></div>
                  <p>{finding.description}</p>
                  <div className="v2-finding-sources"><span>Sources</span>{finding.sources.map((source) => <span className="v2-finding-source" key={source.label}><FileText size={13} />{source.label}<ArrowUpRight size={12} /></span>)}</div>
                </article>
              ))}
            </section>
          )}
          <p className="v2-finding-chat__footnote">Review the evidence before acting.</p>
        </div>
      </div>
    </div>
  );
}
