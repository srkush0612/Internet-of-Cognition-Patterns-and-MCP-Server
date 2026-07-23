# pattern-library

Next.js pattern library for agent UX research patterns.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Patterns reference

Numbered catalog (01–16) matching the site: [`patterns.md`](./patterns.md)

## Routes

- `/` : maturity lanes index (Hypothesis / Grounded / Modeled)
- `/patterns/[slug]` : pattern detail with Explanation, Example, and Evidence tabs
- `/gallery` : token-driven component gallery

## Themes

Five themes from the design-tokens MCP: midnight, slate, signal, glass, mono.

```bash
npm run verify:themes
```
