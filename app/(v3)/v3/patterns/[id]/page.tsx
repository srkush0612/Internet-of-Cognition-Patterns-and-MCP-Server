import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { V3Header } from "@/components/v3/V3Header";
import { V3Footer } from "@/components/v3/V3Footer";
import { V3PatternDetail } from "@/components/v3/V3PatternDetail";
import { V3AuthoredPatternPreview } from "@/components/v3/V3AuthoredPatternPreview";
import { V2PatternContent } from "@/components/v2/V2PatternContent";
import { getV2Pattern } from "@/lib/v2/catalog";
import { getV3Patterns } from "@/lib/v3/catalog";
import { DESIGN_NEEDS, getPatternNeeds } from "@/lib/v3/filter-taxonomy";
import {
  getV3PatternDetail,
  getV3PatternPrinciples,
} from "@/lib/v3/pattern-detail";
import "@/app/v2.css";
import "./authored-pattern.css";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return getV3Patterns().map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = getV3PatternDetail(id);
  const card = getV3Patterns().find((pattern) => pattern.id === id);
  if (!detail && !card) return { title: "Pattern — HAX" };
  return {
    title: `${detail?.name ?? card?.name} — HAX`,
    description: detail?.summary ?? card?.summary,
  };
}

export default async function V3PatternDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const detail = getV3PatternDetail(id);
  const card = getV3Patterns().find((pattern) => pattern.id === id);
  if (!card) notFound();

  if (!detail) {
    return (
      <div className="v3">
        <V3Header />
        <main className="v3-pattern-reference">
          <div className="v3-container">
            <nav aria-label="Breadcrumb"><Link href="/v3/patterns">Patterns</Link><span aria-hidden="true"> / </span>{card.name}</nav>
            <p className="v3-eyebrow">Pattern</p>
            <h1>{card.name}</h1>
            <p className="v3-pattern-reference__summary">{card.summary}</p>
            <div className="v3-pattern-reference__needs">
              <h2>Design needs</h2>
              <div>{getPatternNeeds(card).map((need) => {
                const label = DESIGN_NEEDS.find((item) => item.id === need)?.label;
                return <Link key={need} href={`/v3/patterns?need=${need}`}>{label} ↗</Link>;
              })}</div>
            </div>
            <Link className="v3-action v3-action-secondary" href="/v3/patterns">Back to all patterns</Link>
          </div>
        </main>
        <V3Footer />
      </div>
    );
  }

  const verifiedPattern = getV2Pattern(id);
  if (verifiedPattern) {
    return (
      <div className="v3">
        <V3Header />
        <div className="v2 v3-v2-detail">
          <noscript>
            <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
          </noscript>
          <V2PatternContent
            id={id}
            catalogHref="/v3/patterns"
            preview={<V3AuthoredPatternPreview pattern={verifiedPattern} />}
          />
        </div>
        <V3Footer />
      </div>
    );
  }

  const principles = getV3PatternPrinciples(id);

  return (
    <div className="v3">
      <V3Header />
      <main>
        <V3PatternDetail
          pattern={detail}
          stage={card.nucleuxStage}
          cluster={card.nucleuxCluster}
          principles={principles}
        />
      </main>
      <V3Footer />
    </div>
  );
}
