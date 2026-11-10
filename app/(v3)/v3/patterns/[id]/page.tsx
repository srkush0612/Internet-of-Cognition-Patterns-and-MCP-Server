import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { V3Header } from "@/components/v3/V3Header";
import { V3Footer } from "@/components/v3/V3Footer";
import { V3PatternDetail } from "@/components/v3/V3PatternDetail";
import { getV3Patterns } from "@/lib/v3/catalog";
import {
  getV3AgenticPatternIds,
  getV3PatternDetail,
  getV3PatternPrinciples,
} from "@/lib/v3/pattern-detail";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return getV3AgenticPatternIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = getV3PatternDetail(id);
  if (!detail) return { title: "Pattern — HAX" };
  return {
    title: `${detail.name} — HAX`,
    description: detail.summary,
  };
}

export default async function V3PatternDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const detail = getV3PatternDetail(id);
  if (!detail) notFound();

  const card = getV3Patterns().find((pattern) => pattern.id === id);
  if (!card) notFound();

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
