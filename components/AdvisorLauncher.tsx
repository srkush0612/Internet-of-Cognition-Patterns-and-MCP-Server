"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PatternAdvisor } from "@/components/PatternAdvisor";

function AdvisorContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? undefined;

  return <PatternAdvisor initialPrompt={initialPrompt} />;
}

export function AdvisorLauncher() {
  return (
    <Suspense fallback={<div className="h-full bg-white" />}>
      <AdvisorContent />
    </Suspense>
  );
}
