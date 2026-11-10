import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { V3Header } from "@/components/v3/V3Header";
import { V3Footer } from "@/components/v3/V3Footer";
import { V3PatternDetail } from "@/components/v3/V3PatternDetail";
import { V3AuthoredPatternPreview } from "@/components/v3/V3AuthoredPatternPreview";
import { V3SourcePatternDetail, V3SourcePatternSections } from "@/components/v3/V3SourcePatternDetail";
import { V2PatternContent } from "@/components/v2/V2PatternContent";
import { getV2Pattern } from "@/lib/v2/catalog";
import { getV3Patterns } from "@/lib/v3/catalog";
import { getSourcePatternForV3Id } from "@/lib/v3/source-patterns";
import {
  getV3PatternDetail,
  getV3PatternPrinciples,
} from "@/lib/v3/pattern-detail";
import "@/app/v2.css";
import "./authored-pattern.css";
import "./source-pattern.css";

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
  const source = getSourcePatternForV3Id(id);
  if (!detail && !card) return { title: "Pattern — HAX" };
  return {
    title: `${detail?.name ?? source?.name ?? card?.name} — HAX`,
    description: detail?.summary ?? source?.oneline ?? card?.summary,
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
    const source = getSourcePatternForV3Id(id);
    if (!source) notFound();
    return (
      <div className="v3">
        <V3Header />
        <V3SourcePatternDetail pattern={source} />
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
  const source = getSourcePatternForV3Id(id);

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
        {source && (
          <section className="v3-source-detail__supplement" aria-labelledby="v3-source-supplement-title">
            <div className="v3-container v3-source-detail__body">
              <div className="v3-source-detail__supplement-head">
                <p className="v3-eyebrow">More ways to use this pattern</p>
                <h2 id="v3-source-supplement-title">Examples and guidance.</h2>
              </div>
              <V3SourcePatternSections pattern={source} />
            </div>
          </section>
        )}
      </main>
      <V3Footer />
    </div>
  );
}
