"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect, useReducedMotion } from "motion/react";

/**
 * Reveal section content as it enters the viewport. Each section gets a
 * subtle rise and its first-level content arrives in a short stagger.
 *
 * Content stays visible in the server-rendered markup. GSAP only applies its
 * starting state after hydration, and reduced-motion users see it immediately.
 */
export function Reveal({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const section = ref.current;
    if (!section || reduced) return;

    // Current viewport content and restored scroll positions that have
    // already crossed the trigger line should be visible immediately.
    const triggerLine = window.innerHeight * 0.84;
    if (section.getBoundingClientRect().top < triggerLine) return;

    gsap.registerPlugin(ScrollTrigger);

    const container = section.querySelector<HTMLElement>(
      ":scope > .osh-container",
    );
    const items = container
      ? Array.from(container.children).filter(
          (child): child is HTMLElement => child instanceof HTMLElement,
        )
      : [section];

    if (!items.length) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.78,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: section,
            start: "top 84%",
            once: true,
          },
        },
      );
    }, section);

    return () => context.revert();
  }, [reduced]);

  return (
    <section ref={ref} id={id} className={className} data-reveal="">
      {children}
    </section>
  );
}
