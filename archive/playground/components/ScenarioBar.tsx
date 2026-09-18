"use client";

import { useEffect, useState } from "react";
import { encodeScenario, type PlaygroundScenario } from "@/archive/playground/lib/playground-scenario-codec";

const STORAGE_KEY = "playground-scenarios";

type SavedScenario = PlaygroundScenario & { id: string; savedAt: string };

function readSaved(): SavedScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedScenario[]) : [];
  } catch {
    return [];
  }
}

function writeSaved(list: SavedScenario[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // best-effort; a full/blocked localStorage just means saves don't persist
  }
}

function buildShareUrl(scenario: PlaygroundScenario): string {
  const url = new URL(window.location.href);
  url.searchParams.set("scenario", encodeScenario(scenario));
  return url.toString();
}

type Props = {
  current: PlaygroundScenario;
  onLoadScenario: (scenario: PlaygroundScenario) => void;
};

/** A slim, single-row toolbar — the saved list only takes space once opened. */
export function ScenarioBar({ current, onLoadScenario }: Props) {
  const [saved, setSaved] = useState<SavedScenario[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    setSaved(readSaved());
  }, []);

  async function handleCopyLink() {
    const url = buildShareUrl(current);
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  function handleSave() {
    const name = window.prompt("Name this scenario:", current.name)?.trim();
    if (!name) return;
    const next: SavedScenario = {
      ...current,
      name,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      savedAt: new Date().toISOString(),
    };
    const updated = [next, ...saved];
    setSaved(updated);
    writeSaved(updated);
    setListOpen(true);
  }

  function handleRemove(id: string) {
    const updated = saved.filter((s) => s.id !== id);
    setSaved(updated);
    writeSaved(updated);
  }

  return (
    <div className="scenario-bar">
      <div className="scenario-bar__row">
        <button type="button" className="scenario-bar__btn" onClick={handleSave}>
          <span aria-hidden>＋</span> Save scenario
        </button>
        <button type="button" className="scenario-bar__btn" onClick={handleCopyLink}>
          <span aria-hidden>🔗</span> {copyStatus === "copied" ? "Copied!" : "Copy share link"}
        </button>
        {saved.length > 0 && (
          <button
            type="button"
            className={`scenario-bar__btn scenario-bar__btn--toggle${listOpen ? " scenario-bar__btn--active" : ""}`}
            onClick={() => setListOpen((open) => !open)}
          >
            Saved ({saved.length}) <span className={`scenario-bar__caret${listOpen ? " scenario-bar__caret--open" : ""}`} aria-hidden>▾</span>
          </button>
        )}
      </div>

      {listOpen && saved.length > 0 && (
        <ul className="scenario-bar__list">
          {saved.map((s) => (
            <li key={s.id} className="scenario-bar__list-row">
              <button
                type="button"
                className="scenario-bar__row-main"
                onClick={() => onLoadScenario(s)}
              >
                <span className="scenario-bar__row-name">{s.name}</span>
                <span className="scenario-bar__row-meta">{s.slug}</span>
              </button>
              <button
                type="button"
                className="scenario-bar__icon-btn"
                title="Copy share link"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(buildShareUrl(s));
                  } catch {
                    window.prompt("Copy this link:", buildShareUrl(s));
                  }
                }}
              >
                🔗
              </button>
              <button
                type="button"
                className="scenario-bar__icon-btn"
                title="Remove"
                onClick={() => handleRemove(s.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
