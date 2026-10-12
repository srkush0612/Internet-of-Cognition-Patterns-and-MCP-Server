"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GapCard, PatternCard } from "@/components/v2/primitives";
import { patterns } from "@/lib/v2/catalog";
import {
  CHANNEL_LABEL,
  CHANNEL_ORDER,
  LEVEL_LABEL,
  LEVEL_LONG,
  LEVEL_ORDER,
} from "@/lib/v2/levels";
import { MODE_LABEL, MODE_ORDER, MODE_PLAIN, getMode } from "@/lib/v2/modes";
import type { Channel, Level, Mode } from "@/lib/v2/types";

type GroupBy = "mode" | "level" | "none";

export function CatalogBrowser() {
  // The homepage's two ways in, a mode, or a level, arrive as a query
  // string and land the reader on a filtered catalog rather than on all 23.
  const params = useSearchParams();
  const initialMode = params.get("mode");
  const initialLevel = params.get("level");

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode | "all">(
    MODE_ORDER.includes(initialMode as Mode) ? (initialMode as Mode) : "all",
  );
  const [level, setLevel] = useState<Level | "all">(
    LEVEL_ORDER.includes(initialLevel as Level)
      ? (initialLevel as Level)
      : "all",
  );
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("mode");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return patterns.filter((pattern) => {
      if (mode !== "all" && pattern.mode.primary !== mode) return false;
      if (level !== "all" && pattern.level.primary !== level) return false;
      if (channel !== "all" && !pattern.channels.includes(channel)) return false;
      if (!needle) return true;
      return [
        pattern.name,
        pattern.summary,
        pattern.spec,
        ...pattern.triggers,
        ...pattern.merged_from,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, mode, level, channel]);

  const anyFilter =
    query.trim() !== "" ||
    mode !== "all" ||
    level !== "all" ||
    channel !== "all";

  function reset() {
    setQuery("");
    setMode("all");
    setLevel("all");
    setChannel("all");
  }

  const groups: Array<{ key: string; label: string; note: string; rows: typeof patterns; gap?: string }> =
    useMemo(() => {
      if (groupBy === "mode") {
        return MODE_ORDER.map((id) => {
          const rows = filtered.filter((p) => p.mode.primary === id);
          const total = patterns.filter((p) => p.mode.primary === id).length;
          return {
            key: id,
            label: MODE_LABEL[id],
            note: getMode(id).definition,
            rows,
            // An empty mode is a gap in the library. A mode emptied by a
            // filter is not, so the two say different things, and a mode the
            // reader filtered *out* should not appear at all, gap or no gap.
            gap:
              total === 0 && (mode === "all" || mode === id)
                ? `No ${MODE_LABEL[id]} pattern exists yet.`
                : undefined,
          };
        }).filter((group) => group.rows.length > 0 || group.gap);
      }

      if (groupBy === "level") {
        return LEVEL_ORDER.map((id) => ({
          key: id,
          label: LEVEL_LABEL[id],
          note: LEVEL_LONG[id],
          rows: filtered.filter((p) => p.level.primary === id),
        })).filter((group) => group.rows.length > 0);
      }

      return [{ key: "all", label: "", note: "", rows: filtered }];
    }, [filtered, groupBy, mode]);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        <input
          type="search"
          className="v2-select min-w-[14rem] flex-1"
          placeholder="Search names and triggers"
          aria-label="Search the catalog"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <select
          className="v2-select"
          aria-label="Filter by what the agent does"
          value={mode}
          onChange={(event) => setMode(event.target.value as Mode | "all")}
        >
          <option value="all">Anything it does</option>
          {MODE_ORDER.map((id) => (
            <option key={id} value={id}>
              {MODE_PLAIN[id].charAt(0).toUpperCase() + MODE_PLAIN[id].slice(1)}
            </option>
          ))}
        </select>

        <select
          className="v2-select"
          aria-label="Filter by who's involved"
          value={level}
          onChange={(event) => setLevel(event.target.value as Level | "all")}
        >
          <option value="all">Anyone involved</option>
          {LEVEL_ORDER.map((id) => (
            <option key={id} value={id}>
              {LEVEL_LABEL[id]}
            </option>
          ))}
        </select>

        <select
          className="v2-select"
          aria-label="Filter by where it appears"
          value={channel}
          onChange={(event) =>
            setChannel(event.target.value as Channel | "all")
          }
        >
          <option value="all">Any surface</option>
          {CHANNEL_ORDER.map((id) => (
            <option key={id} value={id}>
              {CHANNEL_LABEL[id]}
            </option>
          ))}
        </select>

        <select
          className="v2-select"
          aria-label="Group patterns by"
          value={groupBy}
          onChange={(event) => setGroupBy(event.target.value as GroupBy)}
        >
          <option value="mode">By what it does</option>
          <option value="level">By who's involved</option>
          <option value="none">No grouping</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-muted">
        {filtered.length} of {patterns.length} patterns
        {anyFilter ? (
          <>
            {" · "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-ink"
              onClick={reset}
            >
              clear filters
            </button>
          </>
        ) : null}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <GapCard title="Nothing matches those filters">
            <p className="text-sm leading-relaxed">
              Nothing in the catalog fits this combination. Clear a filter to
              see the patterns again.
            </p>
          </GapCard>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.key}>
            {group.label ? (
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-lg font-semibold text-ink">
                  {group.label}
                </h2>
                <p className="text-sm text-muted">{group.note}</p>
                <span className="text-xs text-faint">{group.rows.length}</span>
              </div>
            ) : null}

            {group.gap ? (
              <GapCard title={group.gap}>
                <p className="text-sm leading-relaxed">
                  This is a way an agent could open, with its replies already
                  fixed. Nothing has been designed for it yet.
                </p>
              </GapCard>
            ) : (
              <div className="v2-cardgrid">
                {group.rows.map((pattern) => (
                  <PatternCard key={pattern.id} pattern={pattern} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
