import { patterns } from "@/lib/v2/catalog";
import { LEVEL_LABEL } from "@/lib/v2/levels";
import { MODE_PLAIN, getMode } from "@/lib/v2/modes";
import { matchingPatterns } from "@/lib/v2/spec";

/**
 * Four steps, all visible at once, divided by rules rather than boxed.
 *
 * Nothing here is a tab: the sequence is the content, and hiding three
 * quarters of it behind a control would make the reader work to see that
 * there are four. Every artifact is real, steps 01 and 02 run the same
 * matcher Studio does, so they cannot drift from the catalog.
 */

const PICK_MODE = "propose" as const;
const PICK_LEVEL = "L3" as const;

/** The replies in the order the mode defines, tone-mapped for the preview. */
const TONE: Record<string, "primary" | "negative" | undefined> = {
  consent: "primary",
  decline: "negative",
};

function Step({
  n,
  title,
  body,
  children,
}: {
  n: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <li className="v2-step2">
      <span className="v2-step2__n">{n}</span>
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </li>
  );
}

export function Steps() {
  const suggestion = matchingPatterns(
    {
      trigger: "",
      mode: PICK_MODE,
      level: PICK_LEVEL,
      channel: null,
      audience: null,
      responses: [],
    },
    patterns,
  )[0];

  const handshake = patterns.find((p) => p.id === "pre-action-handshake");
  const replies =
    handshake?.responses ?? getMode(handshake?.mode.primary ?? "propose").responses;

  return (
    <ol className="v2-steps">
      <Step
        n="01"
        title="Find the pattern"
        body="Describe what the agent needs to do and who is involved. Studio suggests a pattern that fits."
      >
        <div className="v2-artifact">
          <dl className="v2-pickrow">
            <dt>The agent needs to</dt>
            <dd>{MODE_PLAIN[PICK_MODE]}</dd>
          </dl>
          <dl className="v2-pickrow">
            <dt>Who&rsquo;s involved</dt>
            <dd>{LEVEL_LABEL[PICK_LEVEL].toLowerCase()}</dd>
          </dl>
          {suggestion ? (
            <div className="v2-result">
              <p className="v2-result__name">{suggestion.name}</p>
              <p className="v2-result__why">{suggestion.summary}</p>
            </div>
          ) : null}
        </div>
      </Step>

      <Step
        n="02"
        title="Shape the behavior"
        body="Preview the interaction in its intended channel and check the replies people or agents can send."
      >
        <div className="v2-artifact">
          <div className="v2-chantabs">
            <span data-on="true">Chat</span>
            <span>Shared view</span>
            <span>Agent message</span>
          </div>
          <p className="v2-msg">
            <b>@triage</b> Checkout p99 hit 2.4s. That points to payments-svc.
            I&rsquo;d like to restart it.
          </p>
          <div className="v2-minireply">
            {replies.map((reply) => (
              <span key={reply} data-tone={TONE[reply]}>
                {reply}
              </span>
            ))}
          </div>
        </div>
      </Step>

      <Step
        n="03"
        title="Connect your agents"
        body="Connect the local HAX server through MCP so agents can look up patterns during a task."
      >
        <div className="v2-artifact v2-artifact--code">
          <span className="k">discover_patterns</span>({"{"}
          {"\n"}  query: <span className="s">&quot;before an</span>
          {"\n"}          <span className="s">irreversible step&quot;</span>
          {"\n"}{"}"})
          {"\n"}
          {"\n"}<span className="c">// → pre-action-handshake</span>
          {"\n"}<span className="c">// expects: consent, correct,</span>
          {"\n"}<span className="c">//          decline, defer</span>
        </div>
      </Step>

      <Step
        n="04"
        title="Show the behavior in context"
        body="HAX brings the selected pattern into an interface for the use case, making the agent’s intent and the person’s next choices clear."
      >
        <div className="v2-artifact v2-usecase" aria-label="Example interaction interface">
          <div className="v2-usecase__top">
            <span>PRE-ACTION CHECK</span>
            <span className="v2-usecase__status">Needs your input</span>
          </div>
          <h4>Restart payments service?</h4>
          <p>
            <b>@triage</b> saw checkout p99 reach 2.4s and wants to restart
            payments-svc.
          </p>
          <div className="v2-usecase__choices" aria-label="Available responses">
            {replies.map((reply) => (
              <span key={reply} data-tone={TONE[reply]}>
                {reply}
              </span>
            ))}
          </div>
        </div>
      </Step>
    </ol>
  );
}
