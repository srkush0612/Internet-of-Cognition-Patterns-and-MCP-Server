"use client";

import { useEffect, type ReactNode } from "react";
import {
  disableGalleryFadeFlag,
  enableGalleryFadeFlag,
} from "@/lib/gallery-fade-flag";

export function GalleryThemeFade({ children }: { children: ReactNode }) {
  useEffect(() => {
    enableGalleryFadeFlag();
    return () => disableGalleryFadeFlag();
  }, []);

  return <div className="gallery-theme-fade">{children}</div>;
}
