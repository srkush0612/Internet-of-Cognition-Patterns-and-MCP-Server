import { notFound } from "next/navigation";
import { PatternDetailShell } from "@/components/PatternDetailShell";
import { getPattern, patterns } from "@/lib/patterns";

export function generatePatternStaticParams() {
  return patterns.map((pattern) => ({ slug: pattern.slug }));
}

export async function generatePatternMetadata(slug: string) {
  const pattern = getPattern(slug);

  return pattern
    ? {
        title: `${pattern.title} · Pattern Library`,
        description: pattern.oneliner,
      }
    : { title: "Pattern not found" };
}

export function PatternDetailPage({
  slug,
  themed = false,
}: {
  slug: string;
  themed?: boolean;
}) {
  const pattern = getPattern(slug);

  if (!pattern) notFound();

  return (
    <PatternDetailShell pattern={pattern} slug={slug} themed={themed} />
  );
}
