"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { PatternPreviewProps } from "@/components/patterns/pattern-registry";
import type { PatternElement } from "@/lib/studio/types";
import "./studio.css";

type Marker = { element: PatternElement; rect: { left: number; top: number; width: number; height: number } };

type Props = {
  Component: ComponentType<PatternPreviewProps>;
  elements: PatternElement[];
  removedElementIds: string[];
};

/**
 * Renders a real pattern component completely untouched, then draws numbered
 * markers and "removed" callouts as an absolutely-positioned overlay on top,
 * located by matching each element's authored `domMatchText` against the
 * rendered DOM. This is the annotation-overlay path chosen because none of
 * the standalone components accept a suppressed-elements prop today — adding
 * one would mean editing every pattern component individually, which the
 * brief rules out ("do not modify the pattern components").
 */
export function PatternEmbed({ Component, elements, removedElementIds }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function locate() {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const found: Marker[] = [];
      for (const element of elements) {
        if (!element.domMatchText) continue;
        const match = findNodeByExactText(container, element.domMatchText);
        if (match) {
          const rect = match.getBoundingClientRect();
          found.push({
            element,
            rect: {
              left: rect.left - containerRect.left,
              top: rect.top - containerRect.top,
              width: rect.width,
              height: rect.height,
            },
          });
        }
      }
      setMarkers(found);
    }

    locate();
    const resizeObserver = new ResizeObserver(locate);
    resizeObserver.observe(container);
    window.addEventListener("resize", locate);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", locate);
    };
  }, [elements]);

  return (
    <div className="studio-embed">
      <div className="studio-embed__component" ref={containerRef}>
        <Component />
      </div>
      <div className="studio-embed__overlay">
        {markers.map(({ element, rect }) => {
          const removed = removedElementIds.includes(element.id);
          return (
            <div
              key={element.id}
              className={`studio-embed__marker-box${removed ? " studio-embed__marker-box--removed" : ""}`}
              style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
            >
              <span className="studio-embed__marker-number">{element.markerNumber ?? "?"}</span>
              {removed && <span className="studio-embed__marker-removed-label">removed here</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function findNodeByExactText(root: HTMLElement, text: string): HTMLElement | null {
  const target = text.trim();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Node | null = walker.currentNode;
  while (node) {
    const el = node as HTMLElement;
    const ownText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? "")
      .join("")
      .trim();
    if (ownText === target) return el;
    node = walker.nextNode();
  }
  return null;
}
