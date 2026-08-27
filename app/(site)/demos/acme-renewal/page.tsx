import { AcmeRenewalDemo } from "@/components/demos/acme-renewal/AcmeRenewalDemo";

export const metadata = {
  title: "Acme Renewal · Authority Gradient in context",
};

export default function AcmeRenewalDemoPage() {
  return (
    <div className="osh-container py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Acme Renewal
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Authority Gradient in the right context panel — grouped by agent,
          interactive on row click, alongside intent, reasoning, and guardrails.
        </p>
      </div>
      <AcmeRenewalDemo />
    </div>
  );
}
