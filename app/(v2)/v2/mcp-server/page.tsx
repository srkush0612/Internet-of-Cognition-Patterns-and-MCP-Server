import { GapCard } from "@/components/v2/primitives";
import {
  AUDIENCE_LABEL,
  AUDIENCE_ORDER,
  CHANNEL_LABEL,
  CHANNEL_ORDER,
  LEVEL_LABEL,
  LEVEL_ORDER,
} from "@/lib/v2/levels";
import { MODE_LABEL, MODE_ORDER } from "@/lib/v2/modes";

export const metadata = {
  title: "MCP server, HAX 2.0 v2",
  description:
    "The calls an agent makes against the pattern library: discover filters on mode, level, channel and audience; instantiate operates on interactions.",
};

const CALLS = [
  {
    name: "discover",
    takes: "mode · level · channel · audience",
    body: "The four things a behavior spec is built from are the four things a caller can filter on. An empty result is a real answer, there is no Request pattern, and the call should say so rather than returning the nearest thing.",
  },
  {
    name: "fetch",
    takes: "pattern id",
    body: "Returns the whole pattern: its spec sentence, its primary mode and level, and the note for every level it reaches.",
  },
  {
    name: "instantiate · update · get · list",
    takes: "pattern id + the spec's level, channel and audience",
    body: "These operate on an interaction, one live occurrence of a pattern, which carries a slot for the receiver's response.",
  },
  {
    name: "handoff",
    takes: "two agents and the work between them",
    body: "The natural home for a Delegate pattern. There is no Delegate pattern, which makes this call the clearest evidence that the gap is real rather than theoretical.",
  },
];

export default function V2McpPage() {
  return (
    <main className="osh-container max-w-4xl py-12 sm:py-16">
      <p className="v2-eyebrow">MCP server</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
        Querying the library from an agent
      </h1>
      <p className="v2-lede mt-4">
        A model is only worth having if an agent can ask it questions. These are
        the calls the vocabulary on this site touches, and what each one takes
        or returns.
      </p>

      <div className="mt-8">
        <GapCard title="Specified, not built">
          <p className="text-sm leading-relaxed">
            Everything below describes how these calls should work against this
            model. The server running in this repo does not implement them yet,
            so treat this page as the interface to build against rather than one
            to connect to.
          </p>
        </GapCard>
      </div>

      <section className="v2-section">
        <h2 className="text-[1.75rem] font-extralight text-ink">
          Calls
        </h2>
        <div className="mt-5 flex flex-col gap-4">
          {CALLS.map((call) => (
            <div key={call.name} className="osh-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-sm font-semibold text-ink">
                  {call.name}
                </p>
                <p className="font-mono text-xs text-faint">{call.takes}</p>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-subtle">
                {call.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="v2-section">
        <h2 className="text-[1.75rem] font-extralight text-ink">
          The filter vocabulary
        </h2>
        <p className="v2-lede mt-3">
          Four enumerations, all closed. A caller can name any combination of
          them and get an honest empty answer when nothing matches.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Vocab
            name="mode"
            values={MODE_ORDER.map((id) => `${id}, ${MODE_LABEL[id]}`)}
          />
          <Vocab
            name="level"
            values={LEVEL_ORDER.map((id) => `${id}, ${LEVEL_LABEL[id]}`)}
          />
          <Vocab
            name="channel"
            values={CHANNEL_ORDER.map((id) => `${id}, ${CHANNEL_LABEL[id]}`)}
          />
          <Vocab
            name="audience"
            values={AUDIENCE_ORDER.map((id) => `${id}, ${AUDIENCE_LABEL[id]}`)}
          />
        </div>
      </section>
    </main>
  );
}

function Vocab({ name, values }: { name: string; values: string[] }) {
  return (
    <div className="osh-card p-5">
      <p className="font-mono text-sm font-semibold text-ink">{name}</p>
      <ul className="mt-2.5 flex flex-col gap-1">
        {values.map((value) => (
          <li key={value} className="font-mono text-xs text-muted">
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}
