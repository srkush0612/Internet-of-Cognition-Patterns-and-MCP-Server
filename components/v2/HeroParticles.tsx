"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, ISourceOptions } from "@tsparticles/engine";

/**
 * The hero background, and the only place on the site that uses particles.
 *
 * The field is the model, not decoration: circles are agents, squares are
 * people, and a link is an exchange between them. It is the same vocabulary as
 * the participant icons on the level cards, in the same colour, so the two read
 * as one system.
 *
 * It stays quiet on purpose, low count, low opacity, slow drift, masked away
 * from the headline, and it carries nothing a reader needs, so it is
 * aria-hidden and pauses whenever the hero scrolls out of view.
 */

/** The engine is global; initialising it twice is wasted work. */
let enginePromise: Promise<void> | null = null;

function engineReady(): Promise<void> {
  if (!enginePromise) {
    enginePromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }
  return enginePromise;
}

/**
 * Colours come out of the stylesheet, never out of this file. Reading the
 * computed value keeps the one definition in `app/v2.css` authoritative, which
 * is also what makes the eventual swap to the design system's accent tokens a
 * one-file change.
 */
function readToken(element: Element | null, name: string, fallback: string) {
  if (!element) return fallback;
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  return value || fallback;
}

export function HeroParticles() {
  const hostRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<Container | null>(null);
  const [ready, setReady] = useState(false);
  const [tokens, setTokens] = useState<{
    spectrum: string[];
    link: string;
  } | null>(null);
  const [small, setSmall] = useState(false);
  const [stillOnly, setStillOnly] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const glass = [
      readToken(host, "--v2-glass-1", "#e8eff7"),
      readToken(host, "--v2-glass-2", "#d4e2f0"),
      readToken(host, "--v2-glass-3", "#c2d6e8"),
    ];
    setTokens({
      // Clear glass three times over to each catch of colour, so the field
      // reads as colourless with the odd refraction in it.
      spectrum: [
        ...glass,
        ...glass,
        ...glass,
        readToken(host, "--v2-glint-violet", "#d8cdf0"),
        readToken(host, "--v2-glint-cyan", "#c6e7f4"),
        readToken(host, "--v2-glint-amber", "#f3dcc2"),
      ],
      link: readToken(host, "--v2-spark-link", "#9fb6ce"),
    });

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 640px)");
    const sync = () => {
      setStillOnly(motion.matches);
      setSmall(narrow.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    narrow.addEventListener("change", sync);

    let cancelled = false;
    void engineReady().then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      motion.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, []);

  // Nothing is animating while the hero is off-screen.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !ready) return;

    const observer = new IntersectionObserver(([entry]) => {
      const container = containerRef.current;
      if (!container) return;
      if (entry.isIntersecting && !stillOnly) container.play();
      else container.pause();
    });

    observer.observe(host);
    return () => observer.disconnect();
  }, [ready, stillOnly]);

  const options: ISourceOptions | null = useMemo(() => {
    if (!tokens) return null;
    return {
      fullScreen: { enable: false },
      background: { color: "transparent" },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        // The count is literal rather than area-scaled, because the hero is
        // a wide, short band and density scaling leaves it almost empty.
        number: { value: small ? 26 : 52, density: { enable: false } },
        // Spheres and cubes, as the artwork has, which also happens to be
        // the site's own agent / person pair.
        shape: { type: ["circle", "circle", "square"] },
        color: { value: tokens.spectrum },
        // Glass is substantial where it catches the light and nearly gone
        // where it does not, so the range is wide.
        opacity: { value: { min: 0.55, max: 1 } },
        // Big enough that a square reads as a square, small enough to stay
        // in the background.
        size: { value: { min: 2.5, max: 4.5 } },
        links: {
          enable: true,
          distance: small ? 110 : 150,
          opacity: 0.4,
          width: 1,
          color: tokens.link,
        },
        move: { enable: !stillOnly, speed: 0.35, outModes: { default: "bounce" } },
      },
      interactivity: {
        // The cursor drawing links to nearby particles reads as a person
        // joining the exchange. It is off entirely when motion is reduced.
        events: { onHover: { enable: !stillOnly, mode: "grab" } },
        modes: { grab: { distance: 170, links: { opacity: 0.5 } } },
      },
    };
  }, [tokens, small, stillOnly]);

  return (
    <div className="v2-particles" ref={hostRef} aria-hidden="true">
      {ready && options ? (
        <Particles
          id="v2-hero-particles"
          options={options}
          particlesLoaded={async (container) => {
            containerRef.current = container ?? null;
            if (stillOnly) container?.pause();
          }}
        />
      ) : null}
    </div>
  );
}
