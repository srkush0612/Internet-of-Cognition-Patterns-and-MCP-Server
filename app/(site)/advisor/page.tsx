import { AdvisorLauncher } from "@/components/AdvisorLauncher";

export const metadata = {
  title: "Chat · Human Agent IoC Patterns",
  description: "Discover patterns through conversational recommendations",
};

export default function AdvisorPage() {
  return (
    <div className="flex h-[calc(100vh-4.5rem)] flex-col bg-bg font-body text-ink">
      <AdvisorLauncher />
    </div>
  );
}
