import { Breadcrumb } from "@/components/Breadcrumb";
import { PatternGrid } from "@/components/PatternGrid";
import { SiteNav } from "@/components/SiteNav";

export default function HomePage() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__row">
            <Breadcrumb items={[{ label: "Pattern Library" }]} />
            <SiteNav />
          </div>
          <h1 className="app-title">Agent UX Patterns</h1>
          <p className="app-lead">
            Sixteen interaction patterns for designing trustworthy human–agent
            systems, grounded in practitioner research.
          </p>
        </div>
      </header>

      <main className="app-main">
        <PatternGrid />
      </main>
    </div>
  );
}
