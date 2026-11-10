import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IntegrationDemo } from "@/components/ioc/IntegrationDemo";

type DemoVersion = "v1" | "v2";

export function generateStaticParams() {
  return [{ version: "v1" }, { version: "v2" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}): Promise<Metadata> {
  const { version } = await params;
  if (version !== "v1" && version !== "v2") return { title: "Not found" };
  return {
    title: `IoC integration demo, ${version}`,
    description:
      "Illustrative L9 and IoC scenarios showing where HAX patterns could support a human decision.",
  };
}

export default async function IoCIntegrationDemoPage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  if (version !== "v1" && version !== "v2") notFound();
  return <IntegrationDemo version={version as DemoVersion} />;
}
