"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { getV2Pattern } from "@/lib/v2/catalog";
import { AUDIENCES, DISCOVER_CALL, DISCOVER_RESPONSE } from "@/lib/v2/homepage";

/**
 * Four audiences, one at a time.
 *
 * Tabs rather than four stacked blocks: nobody is all four, and the point of
 * the section is that each of them gets a different thing out of the same
 * catalog, which reads better as a choice than as a list.
 *
 * Agents are the fourth tab because they are a real user here, and their
 * panel is the call itself rather than a prompt.
 */

const AGENT_TAB = {
  id: "agents",
  title: "Agents",
  heading: "Look up a pattern when the task calls for one",
  body: "An agent can query HAX during a task to find a relevant pattern and see which replies it should expect.",
  workflows: [
    "Look for a pattern when agents disagree",
    "Check what to send before an irreversible step",
    "Keep a structured record of the exchange",
  ],
};

const HEADINGS: Record<string, string> = {
  designers: "Design the interaction, not just the screen",
  pms: "Decide where agents can act alone",
  engineers: "Build exchanges with known replies",
};

export function AudienceTabs() {
  const tabs = [...AUDIENCES.map((a) => a.id), AGENT_TAB.id];
  const [active, setActive] = useState(tabs[0]);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next =
      (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setActive(tabs[next]);
    refs.current[tabs[next]]?.focus();
  }

  const audience = AUDIENCES.find((a) => a.id === active);

  return (
    <>
      <div className="v2-audtabs" role="tablist" aria-label="Who it's for">
        {[...AUDIENCES, AGENT_TAB].map((entry, index) => (
          <button
            key={entry.id}
            ref={(node) => {
              refs.current[entry.id] = node;
            }}
            type="button"
            role="tab"
            className="v2-audtab"
            aria-selected={active === entry.id}
            aria-controls={`aud-${entry.id}`}
            id={`aud-${entry.id}-tab`}
            tabIndex={active === entry.id ? 0 : -1}
            onClick={() => setActive(entry.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {entry.title}
          </button>
        ))}
      </div>

      {audience ? (
        <div
          className="v2-audpanel"
          role="tabpanel"
          id={`aud-${audience.id}`}
          aria-labelledby={`aud-${audience.id}-tab`}
        >
          <div>
            <h3>{HEADINGS[audience.id] ?? audience.title}</h3>
            <p className="v2-audpanel__lede">{audience.body}</p>
            <ul className="v2-workflows">
              {audience.workflows.map((workflow) => (
                <li key={workflow}>{workflow}</li>
              ))}
            </ul>
          </div>

          <div className="v2-exchange">
            <p className="v2-exlabel">Example question</p>
            <p className="v2-ask">{audience.prompt}</p>
            <p className="v2-exlabel">HAX returns</p>
            {audience.answer.map((entry) => {
              const pattern = getV2Pattern(entry.patternId);
              if (!pattern) return null;
              return (
                <Link
                  key={entry.patternId}
                  href={`/v2/patterns/${pattern.id}`}
                  className="v2-result"
                >
                  <p className="v2-result__name">{pattern.name}</p>
                  <p className="v2-result__why">{entry.why}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="v2-audpanel"
          role="tabpanel"
          id={`aud-${AGENT_TAB.id}`}
          aria-labelledby={`aud-${AGENT_TAB.id}-tab`}
        >
          <div>
            <h3>{AGENT_TAB.heading}</h3>
            <p className="v2-audpanel__lede">{AGENT_TAB.body}</p>
            <ul className="v2-workflows">
              {AGENT_TAB.workflows.map((workflow) => (
                <li key={workflow}>{workflow}</li>
              ))}
            </ul>
          </div>

          <div className="v2-exchange">
            <p className="v2-exlabel">The agent calls</p>
            <pre className="v2-artifact v2-artifact--code">
              <code>{`${DISCOVER_CALL}\n\n${DISCOVER_RESPONSE}`}</code>
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
