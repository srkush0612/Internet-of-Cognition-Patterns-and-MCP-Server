const GALLERY_FADE_FLAG = "galleryFade";

export function enableGalleryFadeFlag(): void {
  if (typeof document !== "undefined") {
    document.documentElement.dataset[GALLERY_FADE_FLAG] = "true";
  }
}

export function disableGalleryFadeFlag(): void {
  if (typeof document !== "undefined") {
    delete document.documentElement.dataset[GALLERY_FADE_FLAG];
  }
}

export function isGalleryFadeEnabled(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.dataset[GALLERY_FADE_FLAG] === "true"
  );
}
