"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

/**
 * An on-load entrance, for content that is already on screen when the page
 * opens and so has no scroll to wait for.
 *
 * The hero used `Reveal` for nothing, a scroll-triggered component above the
 * fold fires instantly and reads as static. This is the other half: it plays
 * once, on mount, and a `delay` lets a few of them come in sequence.
 */
export function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={className}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay, ease: [0.16, 0.8, 0.26, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
