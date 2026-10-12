import Link from "next/link";
import { AudienceTabs } from "@/components/v2/AudienceTabs";
import { ConnectBlock } from "@/components/v2/ConnectBlock";
import { Reveal } from "@/components/v2/Reveal";
import { Rise } from "@/components/v2/Rise";
import { HeroParticles } from "@/components/v2/HeroParticles";
import { SceneSwitch } from "@/components/v2/SceneSwitch";
import { SetupScene } from "@/components/v2/SetupScene";
import { Steps } from "@/components/v2/Steps";
import { SETUPS } from "@/lib/v2/homepage";
import { LEVEL_LABEL } from "@/lib/v2/levels";

/**
 * The homepage tells the story: a scene that goes wrong, the same scene with
 * named patterns, how the thing works, who uses it, and what is missing.
 *
 * Two things stay off it deliberately. The behavior-spec sentence is the
 * mechanic inside Studio and on the pattern pages, not the pitch. And the
 * model's own words, mode, level, interaction, appear here only in plain
 * language: "what the agent needs to do", "who is involved".
 */

/**
 * The gaps, named by what they would do rather than by the mode they would
 * sit in. A reader who has never met the mode list can still recognise an
 * agent that needs to ask another one for help.
 */
const GAPS = ["Asking for help", "Handing off work", "Negotiating up front"];

export default function V2Home() {
  return (
    <main>
      {/* ------------------------------------------------------------ hero */}
      <section className="osh-hero v2-hero relative overflow-hidden">
        <HeroParticles />
        <div className="osh-container relative z-10 py-24 sm:py-28">
          {/* Headline, then supporting line, then the actions, a beat
              apart, so the hero arrives rather than appearing. */}
          <Rise>
            <h1 className="v2-display">
              Design how agents work with people
              <span className="v2-turn">
                and with each other.
              </span>
            </h1>
          </Rise>
          <Rise delay={0.12}>
            <p className="v2-sub mt-7">
              HAX is a research-grounded library of interaction patterns and
              behavior specs for agent systems. Use it to make actions clear,
              disagreements legible, and handoffs predictable.
            </p>
          </Rise>
          <Rise delay={0.24} className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/v2/patterns" className="v2-btn v2-btn--primary">
              Explore patterns
            </Link>
            <Link href="/v2/studio" className="v2-btn v2-btn--secondary">
              Create a behavior spec
            </Link>
          </Rise>
        </div>
      </section>

      {/* -------------------------------------------- the scene, both ways */}
      <Reveal className="v2-sec">
        <div className="osh-container">
          <SceneSwitch />
        </div>
      </Reveal>

      {/* ------------------------------------------------------ how it works */}
      <Reveal className="v2-sec" id="how">
        <div className="osh-container">
          <h2 className="v2-h2">
            From an interaction to a pattern your agents can use
          </h2>
          <p className="v2-sub">
            Describe what needs to happen, shape the exchange, then connect your
            agents to the pattern library.
          </p>
          <Steps />
        </div>
      </Reveal>

      {/* ---------------------------------------------------------- setups */}
      <Reveal className="v2-sec">
        <div className="osh-container">
          <h2 className="v2-h2">The same patterns work across four levels.</h2>
          <p className="v2-sub">
            Choose the simplest setup that fits the exchange. As more agents
            and people join, make responsibilities and decision rights clear.
          </p>

          <div className="v2-setups">
            {SETUPS.map(({ level, line }) => (
              <Link
                key={level}
                href={`/v2/patterns?level=${level}`}
                className="v2-setup"
              >
                <SetupScene level={level} />
                <h3>{LEVEL_LABEL[level]}</h3>
                <p>{line}</p>
              </Link>
            ))}
          </div>

          <div className="v2-legend" aria-hidden="true">
            <span>
              <i data-kind="agent" />
              agent
            </span>
            <span>
              <i data-kind="person" />
              person
            </span>
          </div>
        </div>
      </Reveal>

      {/* ------------------------------------------------------- audiences */}
      <Reveal className="v2-sec">
        <div className="osh-container">
          <h2 className="v2-h2">
            One pattern library, four ways to use it.
          </h2>
          <p className="v2-sub">
            Find the view that fits your work, whether you are designing an
            interaction, setting agent permissions, building an integration,
            or using patterns in an agent workflow.
          </p>
          <AudienceTabs />
        </div>
      </Reveal>

      {/* ----------------------------------------------------- point of view */}
      <Reveal className="v2-sec v2-pov v2-wash">
        <div className="osh-container v2-povgrid">
          <div>
            <h2 className="v2-h2">
              Coordination between agents needs design too.
            </h2>
            <p className="v2-sub">
              HAX includes patterns for agents working with people and looks
              at exchanges that are easy to overlook: asking another agent for
              help, handing off work, and resolving disagreements before
              actions collide. The library is growing in these areas.
            </p>
          </div>
          <div>
            <div className="v2-gaps">
              {GAPS.map((gap) => (
                <span key={gap} className="v2-gap">
                  {gap}
                </span>
              ))}
            </div>
            <a className="v2-textlink" href="mailto:hax-feedback@outshift.com">
              Seen one in a live system? Tell us
            </a>
          </div>
        </div>
      </Reveal>

      {/* -------------------------------------------------------- research */}
      <Reveal className="v2-sec">
        <div className="osh-container v2-splitgrid">
          <h2 className="v2-h2">Grounded in research</h2>
          <div>
            <p className="v2-sub mt-0">
              The patterns draw on practitioner research and observations of
              agent systems in use. Each pattern describes the interaction,
              who is involved, where it happens, and what responses it
              supports.
            </p>
            <Link href="/v2/methodology" className="v2-textlink mt-5 inline-block">
              How we built this
            </Link>
          </div>
        </div>
      </Reveal>

      {/* --------------------------------------------------------- connect */}
      <Reveal className="v2-sec" id="connect">
        <div className="osh-container">
          <h2 className="v2-h2">Connect HAX to your agents</h2>
          <p className="v2-sub">
            Ask your assistant to connect the local MCP server, paste the
            configuration into an MCP client, or open the setup guide.
          </p>
          <div className="mt-9">
            <ConnectBlock />
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link href="/v2/patterns" className="v2-btn v2-btn--primary">
              Explore patterns
            </Link>
            <a
              href="mailto:hax-feedback@outshift.com"
              className="v2-btn v2-btn--secondary"
            >
              Share feedback
            </a>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
