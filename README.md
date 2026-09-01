# Human Agent IoC Patterns

Next.js pattern library for human–agent collaboration UX research.

## Run locally

```bash
npm install
npm run dev:restart   # kills stale servers, clears .next cache, starts dev
```

Open [http://localhost:3000](http://localhost:3000).

## MCP server

The **pattern registry and instance engine** lives in [`server/mcp-server.ts`](./server/mcp-server.ts). It reads all patterns from [`lib/patterns.ts`](./lib/patterns.ts) at startup and exposes tools agents can use to discover patterns, spin up live instances, update state, and hand off between patterns.

The core is a **TypeScript module**, not a daemon — Next.js API routes import it in-process. Two entrypoints wrap it:

- [`server/mcp-server.ts`](./server/mcp-server.ts) — run directly to verify the registry (prints a banner, no transport).
- [`server/mcp-stdio.ts`](./server/mcp-stdio.ts) — a real **MCP stdio server** (`@modelcontextprotocol/sdk`) exposing the seven tools below to any MCP client (Claude Desktop, Cursor, Windsurf, MCP Inspector).

### Verify the registry

```bash
npm run mcp
```

Expect one registration line per pattern (17 total) and `Registry initialized with 17 patterns`.

### Run the MCP stdio server

```bash
npm run mcp:stdio          # serves on stdio
node scripts/smoke-mcp-stdio.mjs   # handshake + full-flow smoke test
```

Tools exposed: `discover_patterns`, `fetch_pattern`, `instantiate_pattern`, `update_instance`, `get_instance`, `list_installations`, `handoff`.

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ioc-patterns": {
      "command": "node",
      "args": [
        "--conditions=react-server",
        "--import", "tsx",
        "/abs/path/to/server/mcp-stdio.ts"
      ]
    }
  }
}
```

### What it can do

| Capability | Function | Description |
|------------|----------|-------------|
| **Discover** | `discoverComponents(query)` | Tokenized keyword search (light stemming, stop-word filtering) over pattern slugs, names, triggers, and descriptions. Returns ranked metadata (backing strength, evidence count). Handles multi-word / natural-language queries. Powers the `/advisor` chat recommendations. |
| **Fetch** | `fetchComponent(slug)` | Full component definition: metadata, state schema, handlers, and UI text sections for one pattern. |
| **Instantiate** | `instantiateComponent(slug, initialState, agentId?, persistent?)` | Creates a live instance with a unique ID and timestamped state. Tracks which agent installed which pattern. |
| **Update** | `updateInstanceState(instanceId, updates)` | Deep-merges new fields into instance state (nested objects like `workspace` merge key-by-key; arrays/primitives overwrite). Bumps `state.updatedAt`. |
| **Get** | `getInstanceState(instanceId)` | Reads the current instance snapshot. |
| **List** | `listInstallations(agentId?)` | Lists pattern installations and instance IDs for one agent, or all agents. |
| **Handoff** | `brokerStateHandoff(fromId, toSlug, toAgentId, context?)` | Creates a new instance on a different pattern, inheriting context from the source (e.g. Decision Ledger → Convergence Point). |

Each registered pattern includes:

- **Triggers** — auto-generated from slug, title, and explanation for discovery
- **State schema** — `title`, `description`, `evidence`, `context`, `workspace`, etc. (backing strength is pattern metadata only, not instance state)
- **Handlers** — `instantiate`, `updateState`, `handoffTo`
- **UI sections** — structured copy for chat previews and pattern cards

### HTTP API (used by the web app)

When `npm run dev` is running, the MCP layer is reachable over HTTP:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/patterns/discover` | POST | `{ "query": "record decisions" }` → ranked pattern matches |
| `/api/patterns/[slug]` | GET | Full component definition for one slug |
| `/api/instances` | POST | Instance lifecycle — see actions below |
| `/api/chat` | POST | `{ "message": "..." }` → AI-style recommendations (uses discover + fetch internally) |

**`/api/instances` actions:**

```json
{ "action": "instantiate", "slug": "decision-ledger", "initial_state": { "workspace": {} }, "agent_id": "my-agent", "persistent": true }
{ "action": "update", "instance_id": "...", "updates": { "workspace": { "decision": "Ship OAuth" } } }
{ "action": "get", "instance_id": "..." }
{ "action": "list", "agent_id": "my-agent" }
{ "action": "handoff", "from_instance_id": "...", "to_component_slug": "convergence-point", "to_agent_id": "facilitator", "context_data": {} }
```

The `/advisor` UI uses **instantiate** and **update** when you click "Try this" and save a workspace form.

### Architecture

```
lib/patterns.ts          ← single source of truth (17 patterns)
       ↓
server/mcp-server.ts     ← registry + in-memory instances
       ↓
app/api/*                ← HTTP layer for the Next.js app
       ↓
/advisor, /gallery       ← UI
```

### Notes

- **In-memory storage** — instances reset when the dev server restarts. For production, swap the `instances` / `installations` maps in `mcp-server.ts` for a database adapter.
- **No Anthropic dependency** — the registry itself is pure TypeScript; `/api/chat` uses keyword discovery today (LLM integration can wrap the same tools).
- **Full setup walkthrough** — see [/setup](http://localhost:3000/setup) or run the app and open `/setup`.

## Deploy

**GitHub:** push from this folder (remote: `IoC-patterns-and-server`).

**Reviewa** (static prototype — advisor runs in-browser; instances are session-local):

```bash
npm run deploy:reviewa
```

Updates https://epbhm84q.reviewa.work/

## Project layout

```
app/
  (site)/          Main site — homepage, gallery, advisor, pattern pages, setup
  (themed)/        Theme-switcher gallery at /design-system (internal reference)
  api/             Chat + instance APIs (dev only; excluded from Reviewa export)
components/
  patterns/        Reference design components per pattern
  workspaces/      Interactive advisor forms (middle column)
  gallery/         Legacy token gallery primitives (design-system route)
lib/               Pattern catalog, advisor logic, workspace state defaults
scripts/           Reviewa export, static path fixes, theme verification
server/            MCP registry core + stdio server
```

## Build

```bash
npm run build            # Next.js server build → .next/
npm run build:reviewa    # static export → out/ (runs scripts/fix-static-export-paths.mjs)
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/gallery` | Pattern gallery (Outshift UI) |
| `/patterns/[slug]` | Pattern detail pages |
| `/advisor` | Chat + interactive workspaces |
| `/setup` | Setup guide |
| `/design-system` | Themed component gallery (5 themes) |

## Docs

- [`patterns.md`](./patterns.md) — numbered catalog (01–16)

## What stays private

This repo is **only** the Next.js pattern library. Research tooling (Dovetail export scripts, transcript CSVs, `agent.py`, interview sync state) lives **outside** this folder and is listed in `.gitignore` so it cannot be pushed by mistake.

## Themes

Five themes for `/design-system`: midnight, slate, signal, glass, mono.

```bash
npm run verify:themes
```
