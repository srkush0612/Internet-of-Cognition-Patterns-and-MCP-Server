"use client";

import { useState } from "react";

type ApplyResult = { ok: boolean; message: string };

type Props = {
  onApply: (instruction: string) => ApplyResult;
};

/**
 * Natural-language edit tab. No external LLM call — applyPlaygroundInstruction
 * (lib/playground-nl-interpreter.ts) is a small rule-based interpreter matched
 * against the pattern's real editable fields.
 */
export function AskTab({ onApply }: Props) {
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState<ApplyResult | null>(null);

  function handleApply() {
    if (!instruction.trim()) return;
    const next = onApply(instruction);
    setResult(next);
    if (next.ok) setInstruction("");
  }

  return (
    <div className="playground-ask">
      <p className="playground-ask__hint">
        A simple rule-based interpreter (no external AI call yet) — try &ldquo;set title to
        Ship OAuth&rdquo;, &ldquo;add urgent to &lt;a tags field&gt;&rdquo;, or &ldquo;clear
        &lt;a field&gt;&rdquo;.
      </p>
      <div className="playground-ask__row">
        <input
          type="text"
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleApply();
          }}
          placeholder="Describe a change in plain language…"
        />
        <button type="button" onClick={handleApply} disabled={!instruction.trim()}>
          Apply
        </button>
      </div>
      {result && (
        <p
          className={`playground-ask__message${
            result.ok ? " playground-ask__message--ok" : " playground-ask__message--error"
          }`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
