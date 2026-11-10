import { patterns, getV2Pattern } from "@/lib/v2/catalog";
import { V2PatternContent } from "@/components/v2/V2PatternContent";

export function generateStaticParams() {
  return patterns.map((pattern) => ({ id: pattern.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pattern = getV2Pattern(id);
  if (!pattern) return { title: "Not found, HAX 2.0 v2" };
  return {
    title: `${pattern.name}, HAX 2.0 v2`,
    description: pattern.summary,
  };
}

export default async function V2PatternPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <V2PatternContent id={id} />;
}
