"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Compass,
  Layers,
  MessageSquare,
  Rocket,
  Search,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { patterns, type BackingStrength, type Pattern } from "@/lib/patterns";
import {
  HOMEPAGE_PATTERN_SNAPSHOT,
  PATTERN_READY_SLUGS,
} from "@/lib/pattern-ready";
import { HeroBackground } from "@/components/HeroBackground";

const BTN_PRIMARY = "osh-cta-solid px-8 py-4 text-base";

const BTN_SECONDARY = "osh-cta-outline px-8 py-4 text-base";

function backingBadgeClass(strength?: BackingStrength): string {
  switch (strength) {
    case "Strong":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "Moderate":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    case "Thin":
      return "bg-slate-100 text-muted ring-slate-200";
    default:
      return "bg-[var(--color-tag-bg)] text-accent-h ring-[var(--color-tag-border)]";
  }
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center overflow-hidden bg-bg px-6 py-20 sm:px-12 lg:px-24">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-tag-border)] bg-white px-4 py-1.5 text-sm text-accent-h shadow-sm animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <Sparkles className="h-4 w-4 text-accent" />
          Research-grounded multi-agent patterns
        </div>

        <h1
          className="font-heading text-5xl font-semibold tracking-tight text-ink sm:text-6xl lg:text-7xl animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Human Agent IoC Patterns
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl animate-fade-in-up"
          style={{ animationDelay: "0.35s" }}
        >
          Discover inversion-of-control patterns for multi-agent collaboration
        </p>

        <div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <Link href="/advisor" className={`group ${BTN_PRIMARY}`}>
            Chat with Agent
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
          <Link href="/gallery" className={BTN_SECONDARY}>
            View All Patterns
          </Link>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Search,
      title: "Discover",
      description:
        "Find patterns by describing your problem. AI matches you to proven solutions.",
    },
    {
      icon: Compass,
      title: "Recommend",
      description:
        "Get patterns that fit your needs, ranked by relevance and research backing.",
    },
    {
      icon: Rocket,
      title: "Instantiate",
      description:
        "Create live instances and start working with structured pattern state.",
    },
    {
      icon: Users,
      title: "Collaborate",
      description:
        "Coordinate between agents and operators with shared, auditable workflows.",
    },
  ];

  return (
    <section className="bg-white px-6 py-24 sm:px-12 lg:px-24">
      <RevealSection className="mx-auto max-w-6xl">
        <h2 className="font-heading text-center text-3xl font-bold text-ink sm:text-4xl">
          What are Human Agent IoC Patterns?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          A research-backed system for discovering, recommending, and deploying
          inversion-of-control patterns in multi-agent environments.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {items.map((item, index) => (
            <RevealSection
              key={item.title}
              delay={index * 100}
              className="group osh-card p-8 transition hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex rounded-xl bg-[var(--color-tag-bg)] p-3 text-accent ring-1 ring-[var(--color-tag-border)]">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="font-heading text-xl font-bold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-muted">{item.description}</p>
            </RevealSection>
          ))}
        </div>
      </RevealSection>
    </section>
  );
}

function PatternShowcaseCard({ pattern }: { pattern: Pattern }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/patterns/${pattern.slug}`}
      className="group osh-card relative flex h-full flex-col p-6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-ink">
          {pattern.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${backingBadgeClass(pattern.backingStrength)}`}
        >
          {pattern.backingStrength ?? "None"}
        </span>
      </div>

      <div
        className={`mt-3 flex-1 rounded-xl border px-3.5 py-3 ${
          hovered
            ? "border-yellow-200 bg-yellow-50"
            : "border-line bg-hover"
        }`}
      >
        <p className="text-sm leading-relaxed text-muted">
          {hovered ? pattern.explanation : pattern.oneliner}
        </p>
      </div>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent transition group-hover:gap-2">
        Learn more
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

function PatternShowcase() {
  const featured = HOMEPAGE_PATTERN_SNAPSHOT.map((slug) =>
    patterns.find((pattern) => pattern.slug === slug),
  ).filter((pattern): pattern is Pattern => Boolean(pattern));

  return (
    <section className="bg-hover px-6 py-24 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <RevealSection>
          <h2 className="font-heading text-center text-3xl font-bold text-ink sm:text-4xl">
            Pattern snapshot
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted">
            A few ready patterns to start with — {PATTERN_READY_SLUGS.length} live
            in the library today.
          </p>
        </RevealSection>

        <div className="mx-auto mt-14 grid max-w-4xl items-stretch gap-6 sm:grid-cols-2">
          {featured.map((pattern, index) => (
            <RevealSection
              key={pattern.slug}
              delay={index * 80}
              className="h-full"
            >
              <PatternShowcaseCard pattern={pattern} />
            </RevealSection>
          ))}
        </div>

        <RevealSection delay={120}>
          <div className="mt-12 text-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-h"
            >
              View all {patterns.length} patterns
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Describe Problem",
      description: "Tell us what you're trying to solve in plain language.",
      icon: MessageSquare,
    },
    {
      number: "2",
      title: "Discover Patterns",
      description: "Get matched to patterns ranked by fit and research backing.",
      icon: Search,
    },
    {
      number: "3",
      title: "Create Instance",
      description: "Instantiate a live pattern with structured state you can edit.",
      icon: Layers,
    },
    {
      number: "4",
      title: "Collaborate",
      description: "Work between agents and operators with clear, auditable flows.",
      icon: Bot,
    },
  ];

  return (
    <section className="bg-white px-6 py-24 sm:px-12 lg:px-24">
      <RevealSection className="mx-auto max-w-6xl">
        <h2 className="font-heading text-center text-3xl font-bold text-ink sm:text-4xl">
          How It Works
        </h2>

        <div className="mt-14 grid gap-8 lg:grid-cols-4">
          {steps.map((step, index) => (
            <RevealSection key={step.number} delay={index * 100} className="relative">
              {index < steps.length - 1 ? (
                <div className="absolute left-[calc(50%+2rem)] top-10 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-[var(--color-accent)]/40 to-transparent lg:block" />
              ) : null}

              <div className="rounded-2xl border border-line bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-h font-heading text-xl font-bold text-white shadow-glow">
                  {step.number}
                </div>
                <div className="mx-auto mb-3 inline-flex text-accent">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </RevealSection>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: `${PATTERN_READY_SLUGS.length} ready`, label: `${patterns.length} in library` },
    { value: "100+ Use Cases", label: "From practitioner research" },
    { value: "Multi-agent", label: "Coordination focus" },
    { value: "Research", label: "Grounded design" },
  ];

  return (
    <section className="bg-hover px-6 py-20 sm:px-12 lg:px-24">
      <RevealSection className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.value}
            className="rounded-2xl border border-line bg-white p-6 text-center shadow-sm"
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            <p className="font-heading text-lg font-bold text-ink">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </RevealSection>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-24 sm:px-12 lg:px-24">
      <div
        className="absolute inset-0 animate-gradient-shift bg-[length:200%_200%]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 50%, #fce7f3 100%)",
        }}
      />

      <RevealSection className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-3xl font-bold text-ink sm:text-5xl">
          Ready to discover the right pattern?
        </h2>
        <p className="mt-4 text-lg text-muted">
          Chat with an agent or browse the full pattern library.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/advisor" className={`group ${BTN_PRIMARY}`}>
            <Zap className="h-5 w-5" />
            Chat with Agent
          </Link>
          <Link href="/gallery" className={BTN_SECONDARY}>
            Browse All Patterns
          </Link>
        </div>
      </RevealSection>
    </section>
  );
}

export function Homepage() {
  return (
    <div className="min-h-screen bg-bg font-body text-ink">
      <Hero />
      <Features />
      <PatternShowcase />
      <HowItWorks />
      <Stats />
      <CallToAction />
    </div>
  );
}
