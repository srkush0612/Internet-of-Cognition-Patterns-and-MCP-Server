"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
  Server,
  Terminal,
} from "lucide-react";
import { patterns } from "@/lib/patterns";
import { PATTERN_READY_SLUGS } from "@/lib/pattern-ready";

const PATTERN_COUNT = patterns.length;
const PROJECT_PATH = "dovetail transcript/pattern-library";

const REQUIREMENTS = [
  { label: "Node.js v18 or higher", required: true },
  { label: "npm (included with Node.js)", required: true },
  { label: "This repository cloned locally", required: true },
  { label: "Terminal access", required: true },
  { label: "Cursor or your preferred editor", required: false },
  { label: "Basic familiarity with npm commands", required: false },
] as const;

const INSTALL_STEPS = [
  {
    title: "Install dependencies",
    command: "npm install",
    body: "Installs all project packages, including the pattern registry and API tooling used by the MCP layer.",
  },
  {
    title: "Navigate to the project",
    command: `cd "${PROJECT_PATH}"`,
    body: "Run commands from the pattern-library folder — the same directory that contains package.json and server/mcp-server.ts.",
  },
  {
    title: "Verify the MCP registry",
    command: "npm run mcp",
    body: "Loads server/mcp-server.ts, imports every pattern from lib/patterns.ts, and prints registration lines to confirm the registry initialized correctly.",
  },
  {
    title: "Start the Next.js app",
    command: "npm run dev",
    body: "In a second terminal, start the web app on port 3000. API routes import the MCP registry in-process to discover patterns, create instances, and manage state.",
  },
] as const;

const FULL_SETUP_SCRIPT = `# Navigate to project
cd "${PROJECT_PATH}"

# Install dependencies
npm install

# Verify MCP registry (expect ${PATTERN_COUNT} patterns)
npm run mcp

# Start the app (separate terminal)
npm run dev`;

const EXPECTED_OUTPUT = `📚 Importing patterns from lib/patterns.ts...

✓ Registered: Presence Boundary (presence-boundary)
✓ Registered: Signal-to-Intent Handshake (signal-to-intent-handshake)
✓ Registered: Background Work Ledger (background-work-ledger)
…
✅ Registry initialized with ${PATTERN_COUNT} patterns`;

const VERIFICATION_ITEMS = [
  "MCP registry command completes without errors",
  `All ${PATTERN_COUNT} patterns show as registered`,
  "No module-not-found or syntax errors in the terminal",
  "npm run dev serves the app at http://localhost:3000",
  "/advisor and /gallery load in the browser",
] as const;

const TROUBLESHOOTING = [
  {
    question: "Cannot find module or command failed",
    answer:
      "Run npm install from the pattern-library directory. If tsx is missing, npm run mcp will fetch it via npx automatically.",
  },
  {
    question: "Registry loaded with 0 patterns",
    answer:
      "Confirm lib/patterns.ts exists and exports the patterns array. Run npm run mcp from the project root, not a parent folder.",
  },
  {
    question: "Port 3000 already in use",
    answer:
      "Stop the other process or use a different port: npm run dev -- -p 3002. Update the URL in your browser accordingly.",
  },
  {
    question: "TypeError: fetch is not defined",
    answer:
      "Upgrade to Node.js v18 or newer. The app and API routes rely on modern Node fetch support.",
  },
  {
    question: "ENOENT: no such file or directory",
    answer:
      `Ensure your shell is inside the pattern-library folder. Use cd "${PROJECT_PATH}" before running npm commands.`,
  },
  {
    question: "Advisor chat returns errors",
    answer:
      "The MCP registry must load successfully. Re-run npm run mcp, restart npm run dev, and check the terminal for API errors when you send a message.",
  },
] as const;

const NEXT_STEPS = [
  {
    label: "Chat with Agent",
    href: "/advisor",
    description: "Describe your problem and get pattern recommendations.",
  },
  {
    label: "Browse patterns",
    href: "/gallery",
    description: `Explore all ${PATTERN_COUNT} patterns — ${PATTERN_READY_SLUGS.length} ready today.`,
  },
  {
    label: "REST API",
    href: "#api-reference",
    description: "Connect agents via /api/patterns and /api/instances.",
  },
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:bg-hover"
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({
  code,
  title,
  showCopy = true,
}: {
  code: string;
  title?: string;
  showCopy?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-hover">
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
            {title}
          </span>
          {showCopy ? <CopyButton text={code} /> : null}
        </div>
      ) : null}
      <div className="relative">
        {!title && showCopy ? (
          <div className="absolute right-3 top-3">
            <CopyButton text={code} />
          </div>
        ) : null}
        <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-ink">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-1 font-heading text-2xl font-bold text-ink sm:text-3xl">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function StepCard({
  step,
  title,
  command,
  body,
}: {
  step: number;
  title: string;
  command: string;
  body: string;
}) {
  return (
    <article className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:shadow-md hover:shadow-slate-200/60">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          <div className="mt-4">
            <CodeBlock code={command} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Checklist({
  items,
  optionalFlags,
}: {
  items: readonly string[];
  optionalFlags?: readonly boolean[];
}) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const optional = optionalFlags?.[index] === false;
        return (
          <li key={item} className="flex items-start gap-3 text-sm text-muted">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${
                optional
                  ? "bg-hover text-slate-400 ring-slate-200"
                  : "bg-emerald-50 text-emerald-600 ring-emerald-200"
              }`}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span>
              {item}
              {optional ? (
                <span className="ml-1.5 text-xs text-subtle">(optional)</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function AccordionItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-ink">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function ArchitectureDiagram() {
  const layers = [
    { label: "Your browser", sub: "localhost:3000", tone: "bg-white" },
    { label: "Next.js app", sub: "/advisor · /gallery · /api/*", tone: "bg-[var(--color-tag-bg)]" },
    { label: "MCP registry", sub: "server/mcp-server.ts", tone: "bg-[var(--color-tag-bg)]" },
    { label: "Pattern library", sub: `${PATTERN_COUNT} patterns in lib/patterns.ts`, tone: "bg-hover" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="space-y-2">
        {layers.map((layer, index) => (
          <div key={layer.label}>
            <div
              className={`rounded-xl border border-line px-4 py-3 ${layer.tone}`}
            >
              <p className="font-semibold text-ink">{layer.label}</p>
              <p className="mt-0.5 text-sm text-muted">{layer.sub}</p>
            </div>
            {index < layers.length - 1 ? (
              <div className="flex justify-center py-1" aria-hidden>
                <ArrowRight className="h-4 w-4 rotate-90 text-slate-300" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        The MCP registry ships as a TypeScript module imported by Next.js API routes.
        Run <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">npm run mcp</code>{" "}
        to verify it loads standalone; run{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">npm run dev</code>{" "}
        to use it through the web app and REST endpoints.
      </p>
    </div>
  );
}

export function SetupGuide() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-line bg-gradient-to-b from-[var(--color-tag-bg)] to-bg">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-20">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-[var(--color-shadow)]">
              <Terminal className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                Developer guide
              </p>
              <h1 className="mt-1 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                Setup Guide
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted">
                Install and configure the MCP server that powers Human Agent IoC
                Patterns — pattern discovery, live instances, and agent coordination.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-20 px-6 py-16 sm:px-8 sm:py-20">
        <Section eyebrow="Overview" title="What is the MCP server?">
          <div className="rounded-2xl border border-line bg-hover p-6">
            <div className="flex gap-4">
              <Server className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
              <div className="space-y-4 text-sm leading-relaxed text-muted sm:text-base">
                <p>
                  The <strong className="font-semibold text-ink">Model Context Protocol (MCP) layer</strong> in
                  this project is a pattern registry and tool runtime. It turns research-backed IoC patterns from{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-sm">lib/patterns.ts</code> into
                  structured components agents can discover, instantiate, and update.
                </p>
                <p>It enables:</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {[
                    "Discovering patterns by keyword",
                    "Instantiating live pattern instances",
                    "Managing agent state over time",
                    "Coordinating handoffs between patterns",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-muted">
                  Example: an agent searches for &ldquo;record decisions,&rdquo; receives Decision Ledger as a match,
                  creates an instance with title and rationale, then hands off to Convergence Point when agents disagree.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section eyebrow="Before you begin" title="Requirements">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <Checklist
              items={REQUIREMENTS.map((item) => item.label)}
              optionalFlags={REQUIREMENTS.map((item) => item.required)}
            />
          </div>
        </Section>

        <Section eyebrow="Install" title="Installation steps">
          <div className="space-y-4">
            {INSTALL_STEPS.map((step, index) => (
              <StepCard
                key={step.title}
                step={index + 1}
                title={step.title}
                command={step.command}
                body={step.body}
              />
            ))}
          </div>
        </Section>

        <Section title="Copy-paste commands">
          <CodeBlock code={FULL_SETUP_SCRIPT} title="Full setup script" />
        </Section>

        <Section title="What to expect">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
            <p className="mb-4 text-sm font-semibold text-emerald-800">
              Successful output from npm run mcp
            </p>
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-ink sm:text-sm">
              {EXPECTED_OUTPUT}
            </pre>
          </div>
        </Section>

        <Section title="Verification checklist">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <Checklist items={VERIFICATION_ITEMS} />
            <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              If every item above checks out, you are ready to use Human Agent IoC Patterns.
            </p>
          </div>
        </Section>

        <Section title="Architecture">
          <ArchitectureDiagram />
        </Section>

        <Section title="Troubleshooting">
          <div className="rounded-2xl border border-line bg-white px-6 shadow-sm">
            {TROUBLESHOOTING.map((item, index) => (
              <AccordionItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </Section>

        <Section id="next-steps" title="Next steps">
          <div className="grid gap-4 sm:grid-cols-3">
            {NEXT_STEPS.map((step) => (
              <Link
                key={step.href}
                href={step.href}
                className="group rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-[var(--color-tag-border)] hover:shadow-md"
              >
                <h3 className="font-semibold text-ink group-hover:text-accent-h">
                  {step.label}
                </h3>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  Open
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          <ul className="mt-8 space-y-2 text-sm text-muted">
            {[
              "Create pattern instances from the advisor chat",
              "Try instantiating Decision Ledger or Convergence Point",
              "Connect external agents via the REST API",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="api-reference" eyebrow="For developers" title="REST API reference">
          <div className="space-y-4">
            <CodeBlock
              title="Discover patterns"
              code={`curl "http://localhost:3000/api/patterns/discover?q=decision"`}
            />
            <CodeBlock
              title="Instantiate a pattern"
              code={`curl -X POST http://localhost:3000/api/instances \\
  -H "Content-Type: application/json" \\
  -d '{"action":"instantiate","slug":"decision-ledger","initial_state":{"title":"Auth strategy"}}'`}
            />
          </div>
        </Section>

        <section>
          <button
            type="button"
            onClick={() => setAdvancedOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-white px-6 py-4 text-left shadow-sm transition hover:bg-hover"
            aria-expanded={advancedOpen}
          >
            <span className="font-semibold text-ink">Advanced options</span>
            <ChevronDown
              className={`h-5 w-5 text-slate-400 transition ${advancedOpen ? "rotate-180" : ""}`}
            />
          </button>
          {advancedOpen ? (
            <div className="mt-4 rounded-2xl border border-line bg-hover p-6 text-sm leading-relaxed text-muted">
              <ul className="space-y-3">
                <li>
                  <strong className="text-ink">Deploy separately:</strong> Import functions
                  from server/mcp-server.ts in your own Express or stdio MCP wrapper.
                </li>
                <li>
                  <strong className="text-ink">Add persistence:</strong> Replace in-memory Maps
                  in mcp-server.ts with a database adapter for production instances.
                </li>
                <li>
                  <strong className="text-ink">Connect real agents:</strong> Point agent
                  clients at /api/instances and /api/patterns/discover.
                </li>
                <li>
                  <strong className="text-ink">Custom patterns:</strong> Add entries to
                  lib/patterns.ts and re-run npm run mcp to register them.
                </li>
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <footer className="border-t border-line bg-hover">
        <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Documentation", href: "/setup", icon: BookOpen },
              { label: "GitHub", href: "https://github.com", icon: ExternalLink },
              { label: "Discord", href: "https://discord.com", icon: MessageCircle },
              { label: "Email support", href: "mailto:support@example.com", icon: Mail },
            ].map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-muted transition hover:border-[var(--color-tag-border)] hover:text-accent-h"
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </div>
          <p className="mt-8 text-sm text-subtle">
            MCP registry v1.0.0 · {PATTERN_COUNT} patterns · {PATTERN_READY_SLUGS.length} ready
          </p>
        </div>
      </footer>
    </div>
  );
}
