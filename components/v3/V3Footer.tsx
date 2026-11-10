import Link from "next/link";

export function V3Footer() {
  return (
    <footer className="v3-footer">
      <div className="v3-container">
        <nav aria-label="Footer">
          <Link href="/v3/patterns">Patterns</Link>
          <Link href="/v2/modes">What agents do</Link>
          <Link href="/v2/studio">Studio</Link>
          <Link href="/v2/mcp-server">MCP server</Link>
          <Link href="/v2/methodology">How we built this</Link>
        </nav>
        <span>HAX, by Outshift</span>
      </div>
    </footer>
  );
}
