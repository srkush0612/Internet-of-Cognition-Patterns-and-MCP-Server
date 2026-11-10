"use client";

import { useState } from "react";

export function V3SourceCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="v3-source-code">
      <button type="button" onClick={copy}>{copied ? "Copied" : "Copy code"}</button>
      <pre><code>{code}</code></pre>
    </div>
  );
}
