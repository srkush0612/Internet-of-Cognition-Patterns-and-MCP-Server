"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";

/**
 * Smooth scrolling for v2.
 *
 * Lenis runs in root mode, which keeps the real document scroll, it damps
 * the wheel rather than transforming a container. That matters here: the
 * sticky header, the reveal observers and the particle field's pause-off-
 * screen check all read native scroll position, and a transformed wrapper
 * would quietly break all three.
 *
 * Defaults worth naming, because both are easy to miss: `lerp` ships at 1,
 * which is no smoothing at all, and `autoRaf` ships at false, so nothing
 * drives the loop unless you ask.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  // Smoothing is motion, and someone who asked for less of it should get the
  // browser's own scrolling, untouched.
  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.095,
        smoothWheel: true,
        autoRaf: true,
        // Hash links glide instead of teleporting. No offset here: the
        // stylesheet already gives anchored sections a scroll-margin-top to
        // clear the sticky header, and setting it in both places landed
        // every jump exactly twice as far down the page.
        anchors: true,
        // A trackpad or touchscreen already has momentum of its own; adding
        // ours on top reads as lag rather than polish.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
