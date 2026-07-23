"use client";

import { useEffect, useState } from "react";

export function GalleryProgress({ target = 68 }: { target?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setValue(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <div className="gallery-progress">
      <div className="gallery-progress__label">
        <span>Evidence coverage</span>
        <span>{value}%</span>
      </div>
      <div className="gallery-progress__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="gallery-progress__fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
