/**
 * Smoke test for the MCP stdio server: handshake, list tools, exercise the
 * discover → fetch → instantiate → update → get → list → handoff flow.
 *
 * Run:  node scripts/smoke-mcp-stdio.mjs
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: [
    "--conditions=react-server",
    "--import",
    "tsx",
    new URL("../server/mcp-stdio.ts", import.meta.url).pathname,
  ],
});

const client = new Client({ name: "smoke", version: "0.0.0" });
await client.connect(transport);

const parse = (res) => JSON.parse(res.content[0].text);
let failures = 0;
const check = (label, cond, detail = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures += 1;
};

const tools = (await client.listTools()).tools.map((t) => t.name).sort();
check("7 tools registered", tools.length === 7, tools.join(", "));

const discover = parse(
  await client.callTool({ name: "discover_patterns", arguments: { query: "record decisions" } }),
);
check("discover 'record decisions' returns hits", discover.length > 0, `${discover.length} results, top=${discover[0]?.slug}`);

const fetched = parse(
  await client.callTool({ name: "fetch_pattern", arguments: { slug: "decision-ledger" } }),
);
check("fetch decision-ledger", fetched.metadata?.slug === "decision-ledger");

const inst = parse(
  await client.callTool({
    name: "instantiate_pattern",
    arguments: { slug: "decision-ledger", initial_state: { workspace: { a: 1 } }, agent_id: "smoke", persistent: true },
  }),
);
check("instantiate returns id", typeof inst.instanceId === "string");

const updated = parse(
  await client.callTool({
    name: "update_instance",
    arguments: { instance_id: inst.instanceId, updates: { workspace: { b: 2 }, title: "T" } },
  }),
);
check("update deep-merges workspace", updated.state.workspace.a === 1 && updated.state.workspace.b === 2, JSON.stringify(updated.state.workspace));
check("update bumps state.updatedAt", updated.state.updatedAt !== updated.state.createdAt, `updatedAt=${updated.state.updatedAt}`);

const got = parse(
  await client.callTool({ name: "get_instance", arguments: { instance_id: inst.instanceId } }),
);
check("get returns latest", got.state.title === "T");

const list = parse(
  await client.callTool({ name: "list_installations", arguments: { agent_id: "smoke" } }),
);
check("list shows install", list.length === 1 && list[0].instanceIds.includes(inst.instanceId));

const handoff = parse(
  await client.callTool({
    name: "handoff",
    arguments: {
      from_instance_id: inst.instanceId,
      to_component_slug: "convergence-point",
      to_agent_id: "facilitator",
      context_data: { carry: true },
    },
  }),
);
check("handoff inherits context", handoff.state.carry === true && handoff.state._handoffFrom === inst.instanceId);

const bad = await client.callTool({ name: "fetch_pattern", arguments: { slug: "nope" } });
check("bad slug -> isError", bad.isError === true, bad.content[0].text);

await client.close();
console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
