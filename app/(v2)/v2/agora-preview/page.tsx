import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agora prototype preview, HAX 2.0",
  description: "Explore the interactive Agora agent collaboration prototype.",
};

export default function AgoraPreviewPage() {
  return (
    <main className="v2-prototype-preview">
      <div className="v2-prototype-preview__bar">
        <div>
          <span>INTERACTIVE PROTOTYPE</span>
          <h1>Agora · bring your agent</h1>
        </div>
        <Link href="/v2/studio">Back to Studio</Link>
      </div>
      <iframe
        className="v2-prototype-preview__frame"
        src="/prototypes/agora.html"
        title="Interactive Agora prototype"
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
