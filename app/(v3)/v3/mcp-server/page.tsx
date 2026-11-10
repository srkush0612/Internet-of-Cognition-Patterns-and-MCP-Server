import type { Metadata } from "next";
import Link from "next/link";
import { V3Header } from "@/components/v3/V3Header";
import { V3Footer } from "@/components/v3/V3Footer";

export const metadata: Metadata = {
  title: "MCP server — HAX",
  description: "Run the local HAX MCP server and let an agent discover and fetch interaction patterns.",
};

const tools = [
  "discover_patterns",
  "fetch_pattern",
  "instantiate_pattern",
  "update_instance",
  "get_instance",
  "list_installations",
  "handoff",
];

export default function V3McpPage() {
  return (
    <div className="v3">
      <V3Header />
      <main className="v3-info">
        <div className="v3-container">
          <nav className="v3-info__crumb" aria-label="Breadcrumb"><Link href="/v3">Home</Link><span>/</span>MCP server</nav>
          <p className="v3-eyebrow">MCP server</p>
          <h1>Connect HAX to your agents.</h1>
          <p className="v3-info__lede">Run the local server from a checkout of this project so an MCP client can look up patterns and manage live pattern instances.</p>

          <section className="v3-info__section">
            <h2>Start the local server</h2>
            <p>Install the project dependencies, then run the stdio entrypoint:</p>
            <pre><code>npm install{"\n"}npm run mcp:stdio</code></pre>
            <p>For an MCP client that accepts a command and arguments, run <code>node --conditions=react-server --import tsx /absolute/path/to/server/mcp-stdio.ts</code> from the project checkout.</p>
          </section>

          <section className="v3-info__section">
            <h2>What an agent can call</h2>
            <ul className="v3-info__tool-list">{tools.map((tool) => <li key={tool}><code>{tool}</code></li>)}</ul>
            <p>The server currently searches the existing local registry. The full V3 pattern catalog is not connected to MCP yet.</p>
          </section>

          <Link href="/v3/patterns" className="v3-action v3-action-primary">Explore patterns</Link>
        </div>
      </main>
      <V3Footer />
    </div>
  );
}
