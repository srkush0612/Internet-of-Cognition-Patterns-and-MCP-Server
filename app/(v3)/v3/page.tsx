import type { Metadata } from "next";
import Link from "next/link";
import { V3Header } from "@/components/v3/V3Header";
import { V3HowStack } from "@/components/v3/V3HowStack";
import { HAX_PRINCIPLES } from "@/lib/v2/principles";
import { getPatternsForPrinciple } from "@/lib/v3/principle-catalog";
import { getV3Patterns } from "@/lib/v3/catalog";
import { HeroParticles } from "@/components/v2/HeroParticles";
import { V3Comparison } from "@/components/v3/V3Comparison";
import { V3Audience } from "@/components/v3/V3Audience";
import { V3Footer } from "@/components/v3/V3Footer";

export const metadata: Metadata = {
  title: "HAX — human–agent interaction",
  description:
    "One pattern library for people and agents working together at scale. Explore patterns for what agents do and how people experience it.",
};

const FEATURED_PATTERNS = [
  {
    id: "disclosure", name: "Disclosure", summary: "Make it clear when a person is interacting with AI and what that means for the result.",
    href: "/v3/patterns/nx-disclosure", action: "Open pattern", preview: "disclosure",
  },
  {
    id: "pre-action", name: "Pre-Action Handshake", summary: "Show the action and its consequences before the agent commits to a consequential step.",
    href: "/v3/patterns/pre-action-handshake", action: "Open pattern", preview: "handshake",
  },
  {
    id: "convergence", name: "Convergence Point", summary: "Bring competing agent recommendations into one decision a person can review.",
    href: "/v3/patterns/convergence-point", action: "Open pattern", preview: "convergence",
  },
  {
    id: "memory", name: "Memory", summary: "Let a person see and change what the agent carries into future work.",
    href: "/v3/patterns/agent-memory", action: "Open pattern", preview: "memory",
  },
] as const;

export default function V3Homepage() {
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
              <h1 id="v3-title">One pattern library for people and agents <span>working together at scale.</span></h1>
              <p className="v3-lede">
                Explore patterns for what agents do and how people experience
                it—from first interaction to decisions, handoffs, and ongoing work.
              </p>
              <div className="v3-actions">
                <Link href="/v3/patterns" className="v3-action v3-action-primary">
                  Explore patterns
                </Link>
                <Link href="/v3#studio" className="v3-action v3-action-secondary">See Studio</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="v3-section v3-section-comparison" id="comparison" aria-labelledby="v3-comparison-title">
          <div className="v3-container">
            <div className="v3-section-heading">
              <h2 id="v3-comparison-title">See how HAX <span>elevates the AI experience</span></h2>
              <p>Define when agents act, ask, defer, and hand off work—and how they involve the person in context.</p>
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
          </div>
        </section>

        <section className="v3-section v3-section-tint" id="how" aria-labelledby="v3-how-title">
          <div className="v3-container">
            <div className="v3-section-heading">
              <h2 id="v3-how-title">From a prompt to behavior in your product.</h2>
              <p>
                Describe what you need. HAX helps your agent find the right
                building blocks, shape an editable behavior, and show it in your workflow.
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
              <Link href="/v3/patterns?dimension=L1" className="v3-dimension">
                <div className="v3-dimension-people" aria-hidden="true"><i className="v3-agent" /></div>
                <h3>One agent</h3>
                <p>The agent describes its own action or state.</p>
                <span className="v3-dimension-link">View patterns ↗</span>
              </Link>
              <Link href="/v3/patterns?dimension=L2" className="v3-dimension">
                <div className="v3-dimension-people" aria-hidden="true"><i className="v3-agent" /><i className="v3-agent" /><i className="v3-agent" /></div>
                <h3>Agents coordinate</h3>
                <p>Agents work with peers or an orchestrator.</p>
                <span className="v3-dimension-link">View patterns ↗</span>
              </Link>
              <Link href="/v3/patterns?dimension=L3" className="v3-dimension">
                <div className="v3-dimension-people" aria-hidden="true"><i className="v3-agent" /><i className="v3-agent" /><i className="v3-agent" /><i className="v3-person" /></div>
                <h3>A person and an agent</h3>
                <p>A person can follow, guide, or approve.</p>
                <span className="v3-dimension-link">View patterns ↗</span>
              </Link>
              <Link href="/v3/patterns?dimension=L4" className="v3-dimension">
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
              <p>Find a pattern for the experience you need to design. Explore a few examples here, or browse the full library.</p>
            </div>
            <div className="v3-library-features">
              {FEATURED_PATTERNS.map((pattern, index) => (
                <Link href={pattern.href} key={pattern.id} className="v3-library-feature">
                  <div className="v3-library-feature__preview" aria-hidden="true">
                    {pattern.preview === "disclosure" && <div className="v3-feature-disclosure"><span className="v3-feature-agent-dot" /> <strong>Atlas assistant</strong><span className="v3-feature-ai-label">AI</span><p>I can help summarize this report. Check the source before using the answer.</p></div>}
                    {pattern.preview === "handshake" && <div className="v3-feature-handshake"><small>PROPOSED ACTION</small><strong>Publish the update?</strong><p>This will notify 24 team members.</p><span>Review changes</span><b>Approve</b></div>}
                    {pattern.preview === "convergence" && <div className="v3-feature-convergence"><span><i /> Triage agent · Roll back</span><span><i /> Monitor agent · Hold restart</span><strong>One recovery decision</strong><p>Review the recommendation and trade-offs together.</p></div>}
                    {pattern.preview === "memory" && <div className="v3-feature-memory"><small>YOUR SAVED CONTEXT</small><strong>Use concise summaries</strong><span>Used in future reports</span><p>Edit &nbsp;·&nbsp; Forget</p></div>}
                  </div>
                  <div className="v3-library-feature__body"><span className="v3-library-feature__number">0{index + 1} / FEATURED PATTERN</span><h3>{pattern.name}</h3><p>{pattern.summary}</p><span className="v3-library-feature__link">{pattern.action} ↗</span></div>
                </Link>
              ))}
            </div>
            <div className="v3-library-cta">
              <Link href="/v3/patterns" className="v3-action v3-action-primary">
                Browse all {totalPatterns} patterns
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
              <Link href="/v3/mcp-server" className="v3-action v3-action-primary">Open MCP setup guide</Link>
            </div>
            <div className="v3-mcp-example">
              <span>Example agent lookup</span>
              <code>discover_patterns({"{"}<br />&nbsp;&nbsp;query:<br />&nbsp;&nbsp;&nbsp;&nbsp;&quot;before an irreversible step&quot;<br />{"}"})</code>
              <p>Current server: local stdio connection. The full V3 catalog is not wired to MCP yet.</p>
            </div>
          </div>
        </section>

      </main>

      <V3Footer />
    </div>
  );
}
