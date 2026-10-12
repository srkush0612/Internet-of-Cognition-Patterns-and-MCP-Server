"use client";

import { useState } from "react";
import { getMode } from "@/lib/v2/modes";
import { instantiate, specFromPattern } from "@/lib/v2/spec";
import type { Interaction, Pattern } from "@/lib/v2/types";

/**
 * Every pattern in a mode offers that mode's responses, with the same labels
 * and the same order everywhere. Where a pattern narrows them, the narrowing
 * is in the catalog and is named here, so a missing response reads as a
 * decision rather than an oversight.
 *
 * Picking one does the only thing that is true: it writes the response onto an
 * Interaction. What the agent does next is not in the library, and this does
 * not invent it.
 */

const PRIMARY = new Set([
  "consent",
  "commit",
  "adopt",
  "accept",
  "fulfil",
  "rely on it",
  "keep",
]);

const NEGATIVE = new Set(["decline", "refuse", "revoke"]);

function tone(response: string): "primary" | "negative" | undefined {
  if (PRIMARY.has(response)) return "primary";
  if (NEGATIVE.has(response)) return "negative";
  return undefined;
}

export function ResponseControls({ pattern }: { pattern: Pattern }) {
  const mode = getMode(pattern.mode.primary);
  const responses = pattern.responses ?? mode.responses;
  const narrowed = Boolean(pattern.responses);
  const dropped = narrowed
    ? mode.responses.filter((r) => !responses.includes(r))
    : [];

  const [picked, setPicked] = useState<string | null>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);

  function choose(response: string) {
    setPicked(response);
    const base =
      interaction ?? instantiate(pattern.id, specFromPattern(pattern));
    if (!base) return;
    setInteraction({
      ...base,
      response: { value: response, by: "person:you", at: new Date().toISOString() },
    });
  }

  return (
    <div>
      <div className="v2-responses">
        {responses.map((response) => (
          <button
            key={response}
            type="button"
            className="v2-resp"
            data-tone={tone(response)}
            data-picked={picked === response ? "true" : undefined}
            onClick={() => choose(response)}
          >
            {response}
          </button>
        ))}
      </div>

      {narrowed ? (
        <p className="mt-3 text-xs leading-relaxed text-faint">
          Narrowed from the {mode.id} responses. Not offered here:{" "}
          {dropped.join(", ")}.
        </p>
      ) : null}

      {interaction ? (
        <div className="mt-4">
          <p className="v2-eyebrow mb-2">
            The interaction this created
          </p>
          <pre className="v2-code">
            <code>{JSON.stringify(interaction, null, 2)}</code>
          </pre>
          <p className="mt-2 text-xs leading-relaxed text-faint">
            This is the whole simulation. The response is recorded on the
            interaction; what the agent does next is not written down anywhere
            in the library yet, so nothing here guesses at it.
          </p>
        </div>
      ) : null}
    </div>
  );
}
