"use client";

import { useEffect, useRef, type PointerEvent } from "react";

const AUDIENCES = [
  {
    id: "designers",
    title: "For designers",
    body: "Find the moments when an agent should explain, ask, or hand off, then shape the exchange.",
  },
  {
    id: "pms",
    title: "For product managers",
    body: "Decide where an agent can act and where a person needs a say.",
  },
  {
    id: "engineers",
    title: "For engineers",
    body: "Use each pattern’s states and responses to build the interaction in the product.",
  },
  {
    id: "agents",
    title: "For agents",
    body: "Look up a fitting pattern during a task and follow its expected exchange.",
  },
] as const;

export function V3Audience() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = section.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.85 && bounds.bottom > 0) {
      section.dataset.motion = "in";
      return;
    }

    section.dataset.motion = "waiting";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      section.dataset.motion = "in";
      observer.disconnect();
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;
    const bounds = section.getBoundingClientRect();
    section.style.setProperty("--audience-pointer-x", `${event.clientX - bounds.left}px`);
    section.style.setProperty("--audience-pointer-y", `${event.clientY - bounds.top}px`);
    section.dataset.pointer = "active";
  }

  function handlePointerLeave() {
    const section = sectionRef.current;
    if (section) delete section.dataset.pointer;
  }

  return (
    <section
      className="v3-section v3-audience-section"
      id="audiences"
      aria-labelledby="v3-audience-title"
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="v3-container">
        <div className="v3-section-heading">
          <h2 id="v3-audience-title">Who can use HAX <span>and how.</span></h2>
          <p>The same patterns guide design, product decisions, implementation, and agent behavior.</p>
        </div>
        <div className="v3-audience-grid">
          {AUDIENCES.map(({ id, title, body }) => (
            <article className="v3-audience" key={id}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
