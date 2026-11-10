import { patterns } from "@/lib/v2/catalog";
import { getPatternPrinciples, type HaxPrincipleId } from "@/lib/v2/principles";

export function getPatternsForPrinciple(id: HaxPrincipleId) {
  return patterns.flatMap((pattern) => {
    const assignment = getPatternPrinciples(pattern.id);
    const connection = assignment.primary.id === id
      ? assignment.primary
      : assignment.secondary?.id === id
        ? assignment.secondary
        : null;

    return connection ? [{
      pattern,
      relation: assignment.primary.id === id ? "Primary" as const : "Also supports" as const,
      why: connection.why,
    }] : [];
  }).sort((a, b) => {
    if (a.relation !== b.relation) return a.relation === "Primary" ? -1 : 1;
    return a.pattern.name.localeCompare(b.pattern.name);
  });
}
