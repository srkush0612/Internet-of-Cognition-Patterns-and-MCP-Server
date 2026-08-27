const ATTRIBUTION_BY_RAW: Record<string, string> = {
  "Everaldo Aguiar, Director of Applied AI, PagerDuty":
    "Director of Applied AI, Incident Management",
  "Alok Gupta, AI Leader, Global Bank": "AI Leader, Financial Services",
  "Minh Pham, AOP study": "Practitioner, AOP study",
  "Ali Nahvi, IoC concept sharing study":
    "Practitioner, IoC concept sharing study",
  "Dongxue Zhou, AOP study": "Practitioner, AOP study",
  "Aman Chadra, IoC concept sharing study":
    "Practitioner, IoC concept sharing study",
  "Anshu Tiwari, Director of Engineering, Blue Yonder":
    "Director of Engineering, Supply Chain Software",
};

const ORGANIZATION_TO_INDUSTRY: Record<string, string> = {
  PagerDuty: "Incident Management",
  "Global Bank": "Financial Services",
  "Blue Yonder": "Supply Chain Software",
};

/** Strip personal and company names; keep role and industry context. */
export function anonymizeAttribution(attribution: string): string {
  const mapped = ATTRIBUTION_BY_RAW[attribution.trim()];
  if (mapped) {
    return mapped;
  }

  const parts = attribution.split(",").map((part) => part.trim());
  if (parts.length >= 3) {
    const role = parts[1];
    const industry =
      ORGANIZATION_TO_INDUSTRY[parts[2]!] ?? "Enterprise";
    return `${role}, ${industry}`;
  }

  if (parts.length === 2) {
    return `Practitioner, ${parts[1]}`;
  }

  return "Research participant";
}

/** Replace named participant lists with a count-only label. */
export function anonymizeParticipants(participants: string): string {
  const count = participants
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean).length;

  if (count <= 0) {
    return "Research";
  }

  return count === 1 ? "1 participant" : `${count} participants`;
}
