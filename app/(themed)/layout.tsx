import { GalleryThemeFade } from "@/components/GalleryThemeFade";
import { ThemeProvider } from "@/components/ThemeProvider";
import "../fonts.css";
import "./theme-pages.css";

export default function ThemedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <GalleryThemeFade>{children}</GalleryThemeFade>
    </ThemeProvider>
  );
}
