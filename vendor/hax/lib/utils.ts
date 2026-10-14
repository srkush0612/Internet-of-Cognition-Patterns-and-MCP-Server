/**
 * DELIBERATE DEVIATION from the upstream file (see vendor/hax/README.md).
 *
 * Upstream hax/lib/utils.ts also exports `zodToCopilotParameters` and
 * `createLoggingWrapper`, both of which import `@copilotkit/shared`. The
 * vendored artifacts use only `cn`, so this trimmed copy keeps `cn` verbatim
 * and drops the CopilotKit-coupled helpers rather than pulling CopilotKit in
 * for code that never runs. `cn` itself is byte-for-byte upstream.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
