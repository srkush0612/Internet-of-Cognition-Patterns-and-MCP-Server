import type { Metadata } from "next";
import Link from "next/link";
import { V3Header } from "@/components/v3/V3Header";
import { V3HowStack } from "@/components/v3/V3HowStack";
import { HAX_PRINCIPLES } from "@/lib/v2/principles";
import { getPatternsForPrinciple } from "@/lib/v3/principle-catalog";
import {
  NUCLEUX_STAGE_LABEL,
  NUCLEUX_STAGE_ORDER,
  NUCLEUX_STAGE_SUMMARY,
  getV3AgenticCountsByStage,
  getV3PatternCountsByStage,
  getV3Patterns,
} from "@/lib/v3/catalog";
import { HeroParticles } from "@/components/v2/HeroParticles";
import { V3Comparison } from "@/components/v3/V3Comparison";
import { V3Audience } from "@/components/v3/V3Audience";
import { V3Footer } from "@/components/v3/V3Footer";

export const metadata: Metadata = {
  title: "HAX — human–agent interaction",
  description:
    "A proposed HAX homepage connecting interaction patterns, components, Studio, and MCP.",
};

const LIBRARY_PROMISE: Record<string, string> = {
  onboarding: "How the agent introduces itself.",
  initially: "How a person tells the agent what they need.",
  "during-interaction": "How the work unfolds together.",
  "over-time": "What persists session to session.",
};

export default function V3Homepage() {
  const totalByStage = getV3PatternCountsByStage();
  const agenticByStage = getV3AgenticCountsByStage();
  const totalPatterns = getV3Patterns().length;
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
                <Link href="/v3/patterns" className="v3-action v3-action-primary">
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
              <h2 id="v3-comparison-title">The same recovery moment, with and without HAX.</h2>
              <p>Compare what the agents do and what the person can decide in each view.</p>
            </div>
            <V3Comparison />
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
                const count = getPatternsForPrinciple(principle.id).length;
                return <article className="v3-principle" id={`principle-${principle.id}`} key={principle.id}>
                  <h3>{principle.name}</h3>
                  <p>{principle.description}</p>
                  <span className="v3-principle-count">{count} related patterns</span>
                  <Link href={`/v3/principles/${principle.id}`}>Explore {principle.name} <span aria-hidden="true">↗</span></Link>
                </article>;
              })}
            </div>
            <a className="v3-principles-source" href="https://outshift.design/hax">Read the guiding principles at Outshift Design <span aria-hidden="true">↗</span></a>
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
            <div className="v3-section-heading">
              <h2 id="v3-dimensions-title">Four dimensions of interaction.</h2>
              <p>HAX is patterns for single-agent and multi-agent systems, with or without people, and covers the behavior in all four.</p>
            </div>
            <div className="v3-dimensions">
              <Link href="/v2/patterns?dimension=L1" className="v3-dimension">
                <div className="v3-dimension-people" aria-hidden="true"><i className="v3-agent" /></div>
                <h3>One agent</h3>
                <p>The agent describes its own action or state.</p>
                <span className="v3-dimension-link">View patterns ↗</span>
              </Link>
              <Link href="/v2/patterns?dimension=L2" className="v3-dimension">
                <div className="v3-dimension-people" aria-hidden="true"><i className="v3-agent" /><i className="v3-agent" /><i className="v3-agent" /></div>
                <h3>Agents coordinate</h3>
                <p>Agents work with peers or an orchestrator.</p>
                <span className="v3-dimension-link">View patterns ↗</span>
              </Link>
              <Link href="/v2/patterns?dimension=L3" className="v3-dimension">
                <div className="v3-dimension-people" aria-hidden="true"><i className="v3-agent" /><i className="v3-agent" /><i className="v3-agent" /><i className="v3-person" /></div>
                <h3>A person and an agent</h3>
                <p>A person can follow, guide, or approve.</p>
                <span className="v3-dimension-link">View patterns ↗</span>
              </Link>
              <Link href="/v2/patterns?dimension=L4" className="v3-dimension">
                <div className="v3-dimension-people" aria-hidden="true"><i className="v3-agent" /><i className="v3-agent" /><i className="v3-agent" /><i className="v3-person" /><i className="v3-person" /></div>
                <h3>A team and agents</h3>
                <p>People share decisions and understand ownership.</p>
                <span className="v3-dimension-link">View patterns ↗</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="v3-section" id="library" aria-labelledby="v3-library-title">
          <div className="v3-container">
            <div className="v3-section-heading">
              <h2 id="v3-library-title">The pattern library.</h2>
              <p>
                HAX authors the agentic patterns and references the wider
                AI-UX map around them, so a team working in both can find
                each pattern in the same place. Browse by stage of the
                exchange.
              </p>
            </div>
            <div className="v3-library-stages">
              {NUCLEUX_STAGE_ORDER.map((stage) => (
                <Link
                  href={`/v3/patterns#stage-${stage}`}
                  key={stage}
                  className="v3-library-stage"
                >
                  <p className="v3-library-stage__eyebrow">
                    {NUCLEUX_STAGE_LABEL[stage]}
                  </p>
                  <h3>{LIBRARY_PROMISE[stage]}</h3>
                  <p>{NUCLEUX_STAGE_SUMMARY[stage]}</p>
                  <div className="v3-library-stage__meta">
                    <span>{totalByStage[stage]} patterns</span>
                    <span>{agenticByStage[stage]} agentic</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="v3-library-cta">
              <Link href="/v3/patterns" className="v3-action v3-action-primary">
                Open the library ({totalPatterns} patterns)
              </Link>
            </div>
          </div>
        </section>

        <V3Audience />

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

      </main>

      <V3Footer />
    </div>
  );
}
