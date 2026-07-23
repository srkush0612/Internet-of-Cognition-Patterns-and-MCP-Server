import {
  generatePatternMetadata,
  generatePatternStaticParams,
  PatternDetailPage,
} from "@/lib/pattern-detail-page";

export function generateStaticParams() {
  return generatePatternStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return generatePatternMetadata(slug);
}

export default async function MonoPatternDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PatternDetailPage slug={slug} />;
}
