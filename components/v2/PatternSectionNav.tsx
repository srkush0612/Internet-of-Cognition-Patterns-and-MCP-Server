"use client";

import { useEffect, useState } from "react";

type Item = { id: string; label: string };

export function PatternSectionNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    function updateActive() {
      const nav = document.querySelector<HTMLElement>(".v2-pattern-jump");
      const threshold = (nav?.getBoundingClientRect().bottom ?? 0) + 24;
      let current = items[0]?.id ?? "";

      for (const item of items) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= threshold) {
          current = item.id;
        }
      }
      setActive(current);
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.scrollReveal = "entered";
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    for (const section of sections) {
      if (section.getBoundingClientRect().top > window.innerHeight * 0.9) {
        section.dataset.scrollReveal = "pending";
        observer.observe(section);
      } else {
        section.dataset.scrollReveal = "entered";
      }
    }

    return () => {
      observer.disconnect();
      for (const section of sections) delete section.dataset.scrollReveal;
    };
  }, [items]);

  return (
    <nav className="v2-pattern-jump" aria-label="On this page">
      <div className="osh-container v2-pattern-jump__inner">
        <span>On this page</span>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            onClick={() => setActive(item.id)}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
