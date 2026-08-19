import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="osh-container py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-ink">Human Agent IoC</p>
            <p className="mt-1 text-sm text-muted">
              Research-grounded patterns for human–agent collaboration
            </p>
          </div>

          <nav className="flex flex-col gap-3" aria-label="Footer">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Explore
            </p>
            <Link href="/gallery" className="text-sm text-muted transition hover:text-ink">
              Patterns
            </Link>
            <Link href="/advisor" className="text-sm text-muted transition hover:text-ink">
              Chat with Agent
            </Link>
            <Link href="/setup" className="text-sm text-muted transition hover:text-ink">
              Setup guide
            </Link>
          </nav>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-center text-sm text-subtle">
          &copy; {new Date().getFullYear()} Human Agent IoC Patterns
        </div>
      </div>
    </footer>
  );
}
