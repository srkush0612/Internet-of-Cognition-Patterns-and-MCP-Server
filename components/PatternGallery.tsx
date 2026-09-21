"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Search } from "lucide-react";
import {
  patterns,
  PATTERN_CATEGORY_COLOR,
  PATTERN_CATEGORY_DEFINITIONS,
  PATTERN_CATEGORY_ORDER,
  REASONING_MODE_DEFINITIONS,
  REASONING_MODE_LABEL,
  REASONING_MODE_ORDER,
  type Pattern,
  type PatternCategory,
  type ReasoningMode,
} from "@/lib/patterns";
import { isPatternReady } from "@/lib/pattern-ready";
import {
  BackingSignal,
  byEvidence,
  CategoryIcon,
  EvidenceBars,
  factsLine,
  HeroOrbs,
  REASONING_COLOR,
  ReasoningTag,
} from "@/components/PatternTaxonomy";

type GroupBy = "category" | "reasoning";
type Layout = "grid" | "cols";

type Group = {
  key: string;
  label: string;
  definition: string;
  color: string;
  category?: PatternCategory;
  items: Pattern[];
};

/** Counts up to the new total rather than snapping, so a filter reads as a move. */
function useCountUp(value: number): number {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    if (start === value) return;

    let frame = 0;
    const t0 = performance.now();

    function step(now: number) {
      const progress = Math.min(1, (now - t0) / 300);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(start + (value - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    from.current = value;
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return shown;
}

function SegControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (next: T) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(
    null,
  );

  const measure = useCallback(() => {
    const node = container.current?.querySelector<HTMLButtonElement>(
      'button[aria-selected="true"]',
    );
    if (node) {
      setThumb({ left: node.offsetLeft - 3, width: node.offsetWidth });
    }
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, value]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div className="osh-seg" role="tablist" aria-label={label} ref={container}>
      <span
        className="osh-seg-thumb"
        aria-hidden
        style={
          thumb
            ? {
                transform: `translateX(${thumb.left}px)`,
                width: `${thumb.width}px`,
              }
            : { opacity: 0 }
        }
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The matrix is the filter. Row labels filter a category, column headers
 * filter a reasoning mode, a cell filters the intersection, and a cell with
 * no patterns is inert — an empty cell is a finding, not a dead control.
 */
function Matrix({
  categoryFilters,
  reasoningFilters,
  onToggleCategory,
  onToggleReasoning,
  onPickCell,
  onReset,
  note,
  showReset,
}: {
  categoryFilters: Set<PatternCategory>;
  reasoningFilters: Set<ReasoningMode>;
  onToggleCategory: (category: PatternCategory) => void;
  onToggleReasoning: (reasoning: ReasoningMode) => void;
  onPickCell: (category: PatternCategory, reasoning: ReasoningMode) => void;
  onReset: () => void;
  note: React.ReactNode;
  showReset: boolean;
}) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const pattern of patterns) {
      const key = `${pattern.category}|${pattern.reasoning}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, []);

  return (
    <div className="matrix-shell">
      <div className="matrix-cap">
        <span>Category × Reasoning</span>
        <button
          type="button"
          className="matrix-reset"
          data-show={showReset}
          onClick={onReset}
          tabIndex={showReset ? 0 : -1}
        >
          Clear
        </button>
      </div>

      <div className="matrix">
        <div />
        {REASONING_MODE_ORDER.map((mode) => (
          <button
            key={mode}
            type="button"
            className={`mx-h ${mode === "ioc" ? "mx-h--ioc" : ""}`}
            data-active={reasoningFilters.has(mode)}
            title={REASONING_MODE_DEFINITIONS[mode]}
            onClick={() => onToggleReasoning(mode)}
          >
            {REASONING_MODE_LABEL[mode]}
          </button>
        ))}

        {PATTERN_CATEGORY_ORDER.map((category) => (
          <div key={category} className="contents">
            <button
              type="button"
              className="mx-row-label"
              data-active={categoryFilters.has(category)}
              title={PATTERN_CATEGORY_DEFINITIONS[category]}
              style={{ "--c": PATTERN_CATEGORY_COLOR[category] } as CSSProperties}
              onClick={() => onToggleCategory(category)}
            >
              <CategoryIcon category={category} />
              {category}
            </button>

            {REASONING_MODE_ORDER.map((mode) => {
              const count = counts.get(`${category}|${mode}`) ?? 0;
              const active =
                categoryFilters.has(category) && reasoningFilters.has(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  className="mx-cell"
                  data-zero={count === 0}
                  data-active={active}
                  disabled={count === 0}
                  aria-label={`${category}, ${REASONING_MODE_LABEL[mode]}: ${count} patterns`}
                  style={
                    {
                      "--c": PATTERN_CATEGORY_COLOR[category],
                      "--w": count / 5,
                    } as CSSProperties
                  }
                  onClick={() => onPickCell(category, mode)}
                >
                  {count === 0 ? "·" : count}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p className="mx-note">{note}</p>
    </div>
  );
}

function PatternFace({
  pattern,
  color,
  showCategoryIcon,
  index,
}: {
  pattern: Pattern;
  color: string;
  showCategoryIcon: boolean;
  index: number;
}) {
  const facts = factsLine(pattern);

  return (
    <Link
      href={`/patterns/${pattern.slug}`}
      className="osh-face"
      data-facts={Boolean(facts)}
      style={{ "--c": color, "--i": index } as CSSProperties}
    >
      <div className="osh-face-top">
        <span
          className="osh-face-cat"
          style={{ "--c": color } as CSSProperties}
        >
          {showCategoryIcon ? <CategoryIcon category={pattern.category} /> : null}
          {pattern.category}
        </span>
        {isPatternReady(pattern.slug) ? null : (
          <span className="osh-soon">SOON</span>
        )}
      </div>

      <h3>{pattern.title}</h3>

      <div className="osh-face-swap">
        <p className="osh-face-one">{pattern.oneliner}</p>
        {facts ? (
          <p className="osh-face-facts">
            <b>facts</b> {facts}
          </p>
        ) : null}
      </div>

      <div className="osh-face-foot">
        <ReasoningTag reasoning={pattern.reasoning} />
        <BackingSignal pattern={pattern} />
      </div>
    </Link>
  );
}

function GridView({
  groups,
  groupBy,
}: {
  groups: Group[];
  groupBy: GroupBy;
}) {
  let index = 0;

  return (
    <>
      {groups.map((group) => {
        const items = byEvidence(group.items);
        return (
          <section
            key={group.key}
            className="osh-group"
            aria-labelledby={`group-${group.key}`}
          >
            <div
              className="osh-group-head"
              style={{ "--c": group.color } as CSSProperties}
            >
              <h2 id={`group-${group.key}`}>{group.label}</h2>
              <span className="n">{group.items.length}</span>
            </div>
            <p className="osh-group-def">{group.definition}</p>

            {items.length > 0 ? (
              <div className="osh-faces">
                {items.map((pattern) => (
                  <PatternFace
                    key={pattern.slug}
                    pattern={pattern}
                    color={
                      groupBy === "category"
                        ? PATTERN_CATEGORY_COLOR[pattern.category]
                        : REASONING_COLOR[pattern.reasoning]
                    }
                    showCategoryIcon={groupBy === "category"}
                    index={index++}
                  />
                ))}
              </div>
            ) : (
              <p className="osh-group-empty">
                No patterns match the current filters.
              </p>
            )}
          </section>
        );
      })}
    </>
  );
}

function ColumnsView({
  groups,
  groupBy,
}: {
  groups: Group[];
  groupBy: GroupBy;
}) {
  let index = 0;

  return (
    <div
      className="osh-cols"
      style={{ "--n": groups.length } as CSSProperties}
    >
      {groups.map((group) => (
        <div key={group.key} className="osh-col">
          <div
            className="osh-col-head"
            style={{ "--c": group.color } as CSSProperties}
          >
            <h2>
              {group.label} <span className="n">{group.items.length}</span>
            </h2>
            <p>{group.definition}</p>
          </div>

          <div className="osh-col-stack">
            {group.items.length > 0 ? (
              byEvidence(group.items).map((pattern) => {
                const facts = factsLine(pattern);
                return (
                  <Link
                    key={pattern.slug}
                    href={`/patterns/${pattern.slug}`}
                    className="osh-mini"
                    style={
                      {
                        "--c":
                          groupBy === "category"
                            ? PATTERN_CATEGORY_COLOR[pattern.category]
                            : REASONING_COLOR[pattern.reasoning],
                        "--i": index++,
                      } as CSSProperties
                    }
                  >
                    <h3>{pattern.title}</h3>
                    <div className="osh-mini-meta">
                      <ReasoningTag reasoning={pattern.reasoning} />
                      <span className="osh-evidence">
                        <EvidenceBars pattern={pattern} />
                      </span>
                    </div>
                    <div className="osh-mini-reveal">
                      <p>{pattern.oneliner}</p>
                      {facts ? <p className="facts">{facts}</p> : null}
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="osh-group-empty" style={{ paddingLeft: 0 }}>
                Nothing here.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PatternGallery() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<Set<PatternCategory>>(
    new Set(),
  );
  const [reasoningFilters, setReasoningFilters] = useState<Set<ReasoningMode>>(
    new Set(),
  );
  const [groupBy, setGroupBy] = useState<GroupBy>("category");
  const [layout, setLayout] = useState<Layout>("grid");

  useEffect(() => {
    const slug = searchParams.get("pattern");
    if (slug && patterns.some((pattern) => pattern.slug === slug)) {
      router.replace(`/patterns/${slug}`);
    }
  }, [searchParams, router]);

  const matching = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return patterns.filter((pattern) => {
      if (categoryFilters.size && !categoryFilters.has(pattern.category)) {
        return false;
      }
      if (reasoningFilters.size && !reasoningFilters.has(pattern.reasoning)) {
        return false;
      }
      if (
        normalized &&
        !`${pattern.title} ${pattern.oneliner} ${pattern.slug}`
          .toLowerCase()
          .includes(normalized)
      ) {
        return false;
      }
      return true;
    });
  }, [query, categoryFilters, reasoningFilters]);

  const groups: Group[] = useMemo(() => {
    if (groupBy === "category") {
      return PATTERN_CATEGORY_ORDER.map((category) => ({
        key: category,
        label: category,
        definition: PATTERN_CATEGORY_DEFINITIONS[category],
        color: PATTERN_CATEGORY_COLOR[category],
        category,
        items: matching.filter((pattern) => pattern.category === category),
      }));
    }
    return REASONING_MODE_ORDER.map((mode) => ({
      key: mode,
      label: REASONING_MODE_LABEL[mode],
      definition: REASONING_MODE_DEFINITIONS[mode],
      color: REASONING_COLOR[mode],
      items: matching.filter((pattern) => pattern.reasoning === mode),
    }));
  }, [groupBy, matching]);

  const shownCount = useCountUp(matching.length);
  const filtered = categoryFilters.size > 0 || reasoningFilters.size > 0;

  function toggleCategory(category: PatternCategory) {
    setCategoryFilters((current) => {
      const next = new Set(current);
      if (!next.delete(category)) next.add(category);
      return next;
    });
  }

  function toggleReasoning(reasoning: ReasoningMode) {
    setReasoningFilters((current) => {
      const next = new Set(current);
      if (!next.delete(reasoning)) next.add(reasoning);
      return next;
    });
  }

  function pickCell(category: PatternCategory, reasoning: ReasoningMode) {
    const alreadyOnlyThis =
      categoryFilters.size === 1 &&
      reasoningFilters.size === 1 &&
      categoryFilters.has(category) &&
      reasoningFilters.has(reasoning);

    setCategoryFilters(alreadyOnlyThis ? new Set() : new Set([category]));
    setReasoningFilters(alreadyOnlyThis ? new Set() : new Set([reasoning]));
  }

  function reset() {
    setCategoryFilters(new Set());
    setReasoningFilters(new Set());
    setQuery("");
  }

  const tokens = [
    ...[...categoryFilters].map((category) => ({
      key: `cat-${category}`,
      label: category,
      color: PATTERN_CATEGORY_COLOR[category],
      remove: () => toggleCategory(category),
    })),
    ...[...reasoningFilters].map((mode) => ({
      key: `reason-${mode}`,
      label: REASONING_MODE_LABEL[mode],
      color: REASONING_COLOR[mode],
      remove: () => toggleReasoning(mode),
    })),
  ];

  return (
    <div className="bg-bg">
      <header className="osh-hero">
        <HeroOrbs />

        <div className="osh-container grid items-start gap-9 py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
          <div>
            <h1 className="text-[clamp(1.85rem,3.2vw,2.4rem)] font-extrabold tracking-[-0.022em] text-ink">
              HAX 2.0 Patterns
            </h1>
            <p className="mt-1.5 max-w-[44ch] text-[0.95rem] leading-relaxed text-muted">
              A research-backed reference for human-agent interaction,
              classified two ways at once.
            </p>
          </div>

          <Matrix
            categoryFilters={categoryFilters}
            reasoningFilters={reasoningFilters}
            onToggleCategory={toggleCategory}
            onToggleReasoning={toggleReasoning}
            onPickCell={pickCell}
            onReset={reset}
            showReset={filtered || query.trim().length > 0}
            note={
              filtered ? (
                <>
                  Showing <b>{matching.length}</b> of {patterns.length}.
                </>
              ) : (
                <>
                  Autonomy holds <b>no</b> IoC patterns. Commitment holds{" "}
                  <b>only</b> IoC patterns.
                </>
              )
            }
          />
        </div>
      </header>

      <div className="osh-bar">
        <div className="osh-container osh-bar-in">
          <span className="osh-count">
            {shownCount} <em>of {patterns.length}</em>
          </span>

          <div className="flex flex-wrap gap-1.5">
            {tokens.map((token) => (
              <span
                key={token.key}
                className="osh-token"
                style={{ "--c": token.color } as CSSProperties}
              >
                {token.label}
                <button
                  type="button"
                  onClick={token.remove}
                  aria-label={`Remove ${token.label} filter`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="osh-searchbox">
              <Search className="h-3.5 w-3.5" aria-hidden />
              <input
                id="gallery-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search…"
                aria-label="Search patterns"
              />
            </label>

            <SegControl
              label="Group by"
              value={groupBy}
              onChange={setGroupBy}
              options={[
                { value: "category", label: "Category" },
                { value: "reasoning", label: "Reasoning" },
              ]}
            />

            <SegControl
              label="Layout"
              value={layout}
              onChange={setLayout}
              options={[
                { value: "grid", label: "Grid" },
                { value: "cols", label: "Columns" },
              ]}
            />
          </div>
        </div>
      </div>

      <main className="osh-container pb-16 pt-1">
        {layout === "cols" ? (
          <ColumnsView groups={groups} groupBy={groupBy} />
        ) : (
          <GridView groups={groups} groupBy={groupBy} />
        )}
      </main>
    </div>
  );
}
