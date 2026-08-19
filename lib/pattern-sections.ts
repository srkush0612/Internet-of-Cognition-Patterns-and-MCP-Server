export const PATTERN_SECTIONS = [
  { id: "about", label: "About this component" },
  { id: "standalone", label: "Standalone" },
  { id: "inbox", label: "In context" },
  { id: "evidence", label: "Evidence" },
] as const;

export type PatternSectionId = (typeof PATTERN_SECTIONS)[number]["id"];

export const SCROLL_OFFSET_PX = 120;
