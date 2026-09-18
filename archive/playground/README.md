# Archived: Pattern Playground

Archived 2026-09-16. Superseded by **Studio** (`/studio`), which replaces it in the site nav.

## Why

Playground was a single-pattern, single-user live editor: pick one of the 8 "ready" patterns, edit its
live-preview data via a Config form / a live JSX code editor / a rule-based natural-language interpreter,
compare two renders side by side, and share a scenario via a URL-encoded link. It answered "how do I
customize this one pattern's UI," not "what does my multi-agent system need."

Studio answers a different, larger question: given a description of the work being handed to agents, which
of the fixed research-backed *encounters* between people and agents does it create, which patterns answer
each one, and what did the team decide and why. That's a different shape of tool — an assessment and
decision record across the whole pattern library, not a single-pattern editor — so its UI was built fresh
rather than adapting Playground's Config/Code/Ask tabs.

## What's here

The full, working Playground implementation — components, the pure logic modules (NL interpreter, presets,
scenario codec, code serializer), and their tests. Nothing was deleted. The route `/playground` still
renders it, with an archived-notice banner linking to `/studio`.

## What's untouched

`server/mcp-server.ts`, `server/mcp-stdio.ts`, and the existing `/api/instances` and `/api/patterns/*`
routes were not part of Playground specifically — they're the shared pattern/instance registry, and Studio
uses that same MCP surface (plus its own scenario store) rather than anything Playground-specific.
