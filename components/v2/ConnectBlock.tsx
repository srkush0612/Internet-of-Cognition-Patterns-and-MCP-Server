"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ASK_YOUR_AGENT_PROMPT, CLIENT_CONFIG } from "@/lib/v2/homepage";

/**
 * Three ways in, in the order they are likely to be used: hand the prompt to
 * your own agent and let it connect itself, paste the config, or read the
 * calls first.
 *
 * There is no hosted-URL tab, because there is no hosted endpoint. The server
 * runs over stdio from a checkout, and a URL tab would be the one thing on
 * this page a reader could act on and fail.
 */

const TABS = [
  { id: "ask", label: "Ask your agent" },
  { id: "config", label: "Client config" },
  { id: "guide", label: "Setup guide" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" />
      <path d="M3 10.5V3.5A1 1 0 0 1 4 2.5h6.5" />
    </svg>
  );
}

export function ConnectBlock() {
  const [tab, setTab] = useState<TabId>("ask");
  const [copied, setCopied] = useState(false);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const text = tab === "ask" ? ASK_YOUR_AGENT_PROMPT : CLIENT_CONFIG;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be refused; the text is on screen either way.
      setCopied(false);
    }
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next =
      (index + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    refs.current[TABS[next].id]?.focus();
  }

  return (
    <div className="v2-install">
      <div className="v2-install__tabs" role="tablist" aria-label="Ways to connect">
        {TABS.map((entry, index) => (
          <button
            key={entry.id}
            ref={(node) => {
              refs.current[entry.id] = node;
            }}
            type="button"
            role="tab"
            className="v2-install__tab"
            aria-selected={tab === entry.id}
            aria-controls={`connect-${entry.id}`}
            id={`connect-${entry.id}-tab`}
            tabIndex={tab === entry.id ? 0 : -1}
            onClick={() => setTab(entry.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "guide" ? (
        <div
          className="v2-panel"
          role="tabpanel"
          id="connect-guide"
          aria-labelledby="connect-guide-tab"
        >
          Every call the server answers, and what each one takes:{" "}
          <Link href="/v2/mcp-server">open the setup guide</Link>
        </div>
      ) : (
        <div
          className="v2-panel"
          role="tabpanel"
          id={`connect-${tab}`}
          aria-labelledby={`connect-${tab}-tab`}
        >
          {tab === "ask" ? (
            <span className="v2-panel__mark" aria-hidden="true">
              ›
            </span>
          ) : null}
          {text}
          <button
            type="button"
            className="v2-copy"
            data-done={copied ? "true" : undefined}
            aria-label={copied ? "Copied" : "Copy"}
            onClick={() => void copy()}
          >
            <CopyIcon />
          </button>
        </div>
      )}
    </div>
  );
}
