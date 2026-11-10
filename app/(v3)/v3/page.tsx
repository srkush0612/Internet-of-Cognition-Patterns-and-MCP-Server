import type { Metadata } from "next";
import Link from "next/link";
import { AUDIENCES, SETUPS } from "@/lib/v2/homepage";
import { LEVEL_LABEL } from "@/lib/v2/levels";
import { V3Header } from "@/components/v3/V3Header";
import { V3HowStack } from "@/components/v3/V3HowStack";
import { patterns } from "@/lib/v2/catalog";
import { HAX_PRINCIPLES } from "@/lib/v2/principles";
import { HeroParticles } from "@/components/v2/HeroParticles";
import { V3Comparison } from "@/components/v3/V3Comparison";

export const metadata: Metadata = {
  title: "HAX — human–agent interaction",
  description:
    "A proposed HAX homepage connecting interaction patterns, components, Studio, and MCP.",
};

const CAPABILITIES = [
  { name: "SQL Query Execution", detail: "Database read-only access", status: "enabled", label: "Enabled" },
  { name: "Data Visualization", detail: "Charts & graphs", status: "enabled", label: "Enabled" },
  { name: "File Export", detail: "CSV, JSON, PDF", status: "enabled", label: "Enabled" },
  { name: "Schema Modification", detail: "Approval required", status: "pending", label: "Pending" },
  { name: "Direct DB Write", detail: "Restricted", status: "disabled", label: "Disabled" },
] as const;

const AUDIENCE_SUMMARIES = [
  ...AUDIENCES.map(({ id, title, body }) => ({ id, title, body })),
  { id: "agents", title: "Agents", body: "Look up a relevant pattern during a task and use its expected replies to guide the exchange." },
];

const FEATURED_PATTERNS = [
  { id: "pre-action-handshake", moment: "Before a consequential action", description: "Ask for a decision before the agent takes a step it cannot easily undo." },
  { id: "convergence-point", moment: "When agents disagree", description: "Show how agents weighed conflicting answers and reached an adopted one." },
  { id: "inline-rationale", moment: "When an answer appears", description: "Place the agent’s reason beside the output so a person can assess it." },
] as const;

function PatternSnapshot({ id }: { id: string }) {
  if (id === "pre-action-handshake") {
    return <div className="v3-featured-visual v3-featured-visual--handshake"><div className="v3-featured-mock"><small>@triage · proposal</small><strong>Restart payments-svc?</strong><p>Checkout latency rose. I’d like to restart it.</p><div><span>consent</span><span>correct</span><span>decline</span><span>defer</span></div></div></div>;
  }
  if (id === "convergence-point") {
    return <div className="v3-featured-visual v3-featured-visual--convergence"><div className="v3-featured-sources"><span>@triage <b>Restart</b></span><span>@planner <b>Rollback</b></span></div><div className="v3-featured-adopted"><small>SHARED RECORD</small><strong>Adopted answer</strong><span>Reasoning attached ↗</span></div></div>;
  }
  return <div className="v3-featured-visual v3-featured-visual--rationale"><div className="v3-featured-mock"><small>@notify · update</small><strong>On-call paged</strong><p><b>Why:</b> Checkout p99 reached 2.4s and needs review.</p></div></div>;
}

export default function V3Homepage() {
  return (
    <div className="v3">
      <V3Header />

      <main>
        <section className="v3-hero" aria-labelledby="v3-title">
          <HeroParticles />
          <div className="v3-container v3-hero-grid">
            <div className="v3-hero-copy">
              <p className="v3-eyebrow">Human–agent interaction</p>
              <h1 id="v3-title">Make collaboration between people and agents <span>work at scale.</span></h1>
              <p className="v3-lede">
                Design how agents ask, hand off work, and involve people in
                decisions. HAX brings those interaction patterns into the interface.
              </p>
              <div className="v3-actions">
                <Link href="/v2/patterns" className="v3-action v3-action-primary">
                  Explore patterns
                </Link>
                <Link href="/v2/studio" className="v3-action v3-action-secondary">Open Studio</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="v3-section v3-section-comparison" id="comparison" aria-labelledby="v3-comparison-title">
          <div className="v3-container">
            <div className="v3-section-heading">
              <h2 id="v3-comparison-title">One clear decision when agents coordinate.</h2>
              <p>See how separate requests become one recovery plan with a clear choice.</p>
            </div>
            <V3Comparison />
          </div>
        </section>

        <section className="v3-section v3-section-tint" id="how" aria-labelledby="v3-how-title">
          <div className="v3-container">
            <div className="v3-section-heading">
              <h2 id="v3-how-title">From an interaction to a pattern your agents can use</h2>
              <p>
                Describe what needs to happen, shape the exchange, connect your
                agents to the pattern library, and show the behavior in context.
              </p>
            </div>
            <V3HowStack />
          </div>
        </section>

        <section className="v3-section" id="dimensions" aria-labelledby="v3-dimensions-title">
          <div className="v3-container">
            <div className="v3-section-heading"><h2 id="v3-dimensions-title">Four dimensions of participation.</h2><p>Choose the simplest setup that fits the exchange. As more agents and people join, make responsibilities and decision rights clear.</p></div>
            <div className="v3-dimensions">
              {SETUPS.map(({ level, line }, index) => <Link href={`/v2/patterns?dimension=${level}`} className="v3-dimension" key={level}><div className="v3-dimension-people" aria-hidden="true"><i className="v3-agent" />{index > 0 && <><i className="v3-agent" /><i className="v3-agent" /></>}{index > 1 && <i className="v3-person" />}{index > 2 && <i className="v3-person" />}</div><h3>{LEVEL_LABEL[level]}</h3><p>{line}</p><span className="v3-dimension-link">View patterns ↗</span></Link>)}
            </div>
          </div>
        </section>

        <section className="v3-section v3-section-tint" id="principles" aria-labelledby="v3-principles-title">
          <div className="v3-container">
            <div className="v3-section-heading">
              <h2 id="v3-principles-title">Five principles guide HAX.</h2>
              <p>They set the standard for trustworthy agent experiences. Each pattern shows which principle its behavior puts into practice.</p>
            </div>
            <div className="v3-principles-grid">
              {HAX_PRINCIPLES.map((principle) => {
                const example = patterns.find((pattern) => pattern.id === principle.examplePatternId);
                return <article className="v3-principle" id={`principle-${principle.id}`} key={principle.id}>
                  <h3>{principle.name}</h3>
                  <p>{principle.description}</p>
                  {example && <Link href={`/v2/patterns/${example.id}`}>See {example.name} <span aria-hidden="true">↗</span></Link>}
                </article>;
              })}
            </div>
            <a className="v3-principles-source" href="https://outshift.design/hax">Read the guiding principles at Outshift Design <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="v3-section" id="explore" aria-labelledby="v3-explore-title">
          <div className="v3-container">
            <div className="v3-section-heading">
              <h2 id="v3-explore-title">Start with a real exchange.</h2>
              <p>These patterns address different moments in an agent workflow. Open one to inspect its behavior, participants, channels, and available component.</p>
            </div>
            <div className="v3-featured-grid">
              {FEATURED_PATTERNS.map(({ id, moment, description }) => {
                const pattern = patterns.find((entry) => entry.id === id);
                if (!pattern) return null;
                return <Link href={`/v2/patterns/${id}`} className="v3-featured-card" key={id}>
                  <PatternSnapshot id={id} />
                  <div className="v3-featured-card__body">
                    <p className="v3-panel-kicker">{moment}</p>
                    <h3>{pattern.name}</h3>
                    <p>{description}</p>
                    <div className="v3-featured-card__foot"><span>{pattern.implementation?.status === "shipping" ? "Component available" : "Interaction pattern"}</span><strong>Explore pattern ↗</strong></div>
                  </div>
                </Link>;
              })}
            </div>
            <Link href="/v2/patterns" className="v3-featured-all">Browse all {patterns.length} patterns <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className="v3-section" id="example" aria-labelledby="v3-example-title">
          <div className="v3-container">
            <div className="v3-section-heading">
              <h2 id="v3-example-title">One pattern, carried into the interface.</h2>
              <p>
                Capability Manifest defines what an agent needs to declare.
                Its component shows those same facts where a person sets the
                agent’s scope. Compare the behavior with the UI in one place.
              </p>
            </div>

            <div className="v3-pairing">
              <div className="v3-pairing-panel">
                <p className="v3-panel-kicker">Pattern · Define the exchange</p>
                <h3>Capability Manifest</h3>
                <p>
                  Before a person assigns work, the agent shows what it can do,
                  what needs approval, what is unavailable, and whether its
                  connection is ready.
                </p>
                <dl className="v3-facts">
                  <div><dt>When</dt><dd>At connection and when capabilities change</dd></div>
                  <div><dt>Agent does</dt><dd>Declares capabilities, limits, alerts, and status</dd></div>
                  <div><dt>Person can</dt><dd>Calibrate trust and set the right scope</dd></div>
                </dl>
                <Link href="/v2/patterns/capability-manifest" className="v3-text-link">
                  See the pattern <span aria-hidden="true">↗</span>
                </Link>
              </div>

              <div className="v3-pairing-join" aria-hidden="true">→</div>

              <div className="v3-pairing-panel v3-pairing-panel-ui">
                <p className="v3-panel-kicker">Component · Show it in context</p>
                <div className="v3-chat-shell v3-manifest-shell" aria-label="Illustrative Capability Manifest settings placement">
                  <div className="v3-chat-bar">
                    <span className="v3-avatar">D</span>
                    <strong>Data Analyst</strong>
                    <small>Connected</small>
                  </div>
                  <div className="v3-manifest-list">
                    {CAPABILITIES.map(({ name, detail, status, label }) => (
                      <div className="v3-manifest-row" key={name}>
                        <div><strong>{name}</strong><small>{detail}</small></div>
                        <span data-status={status}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="v3-manifest-alert">
                    <strong>Rate Limit Active</strong>
                    <span>API requests limited to 100/min during peak hours.</span>
                  </div>
                </div>
                <p className="v3-panel-note">
                  Settings shows the full manifest. Chat can show a compact
                  summary, and a state signal carries the same facts as data.
                </p>
                <Link href="/v2/patterns/capability-manifest#preview" className="v3-text-link v3-component-preview-link">Open component preview <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="v3-section" id="audiences" aria-labelledby="v3-audience-title">
          <div className="v3-container">
            <div className="v3-section-heading">
              <h2 id="v3-audience-title">One pattern library, four ways to use it.</h2>
              <p>Find the view that fits your work: designing an interaction, setting permissions, building an integration, or using patterns in an agent workflow.</p>
            </div>
            <div className="v3-audience-grid">
              {AUDIENCE_SUMMARIES.map(({ id, title, body }) => <div className="v3-audience" key={id}><h3>{title}</h3><p>{body}</p></div>)}
            </div>
          </div>
        </section>

        <section className="v3-section v3-section-tint" id="mcp" aria-labelledby="v3-mcp-title">
          <div className="v3-container v3-mcp-grid">
            <div>
              <h2 id="v3-mcp-title">Connect HAX to your agents.</h2>
              <p>The local MCP server lets an agent search the current pattern registry during a task. Connect it from a checkout, then use the setup guide to see the calls it supports.</p>
              <Link href="/v2/mcp-server" className="v3-action v3-action-primary">Open MCP setup guide</Link>
            </div>
            <div className="v3-mcp-example">
              <span>Example agent lookup</span>
              <code>discover_patterns({"{"}<br />&nbsp;&nbsp;query:<br />&nbsp;&nbsp;&nbsp;&nbsp;&quot;before an irreversible step&quot;<br />{"}"})</code>
              <p>Current server: local stdio connection. V2 catalog alignment is still in progress.</p>
            </div>
          </div>
        </section>

        <section className="v3-close" aria-labelledby="v3-close-title">
          <div className="v3-container v3-close-inner">
            <div>
              <p className="v3-eyebrow">Start with the interaction</p>
              <h2 id="v3-close-title">Make the behavior usable.</h2>
              <p>Find a pattern, shape its behavior in Studio, and inspect an available component in context.</p>
            </div>
            <div className="v3-actions">
              <Link href="/v2/patterns" className="v3-action v3-action-primary">Explore patterns</Link>
              <Link href="/v2/studio" className="v3-action v3-action-secondary">Open Studio</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="v3-footer">
        <div className="v3-container"><span>HAX by Outshift Design</span><span>Human–agent interaction patterns</span></div>
      </footer>
    </div>
  );
}
