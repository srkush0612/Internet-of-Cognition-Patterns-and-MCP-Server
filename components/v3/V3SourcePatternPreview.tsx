"use client";

import { useEffect, useRef, useState } from "react";

type View = "live" | "context";

export function V3SourcePatternPreview({
  sourceId,
  name,
  view,
}: {
  sourceId: string;
  name: string;
  view: View;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(view === "live" ? 330 : 650);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type !== "hax-pattern-preview-height" || event.data.view !== view) return;
      const nextHeight = Number(event.data.height);
      if (Number.isFinite(nextHeight)) setHeight(Math.max(220, Math.min(nextHeight, 1400)));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [view]);

  return (
    <iframe
      ref={frame}
      className="v3-source-preview"
      src={`/v3-pattern-reference/preview.html?id=${encodeURIComponent(sourceId)}&view=${view}`}
      title={`${name}: ${view === "live" ? "live preview" : "in-context examples"}`}
      loading="lazy"
      style={{ height }}
    />
  );
}
