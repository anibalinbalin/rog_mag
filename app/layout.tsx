import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import { Agentation } from "agentation";
import DevDials from "@/components/DevDials";
import ViewTransitionCommit from "@/components/ViewTransitionCommit";
import "./globals.css";
import "@silk-hq/components/unlayered-styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Belen's direction (2026-06): Crimson Pro for títulos + subtítulos
// (serif), Inter for body. Replaces Source Serif 4 across headings.
const crimson = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
});

export const metadata: Metadata = {
  title: "Revista de Derecho Comercial y de la Empresa",
  description:
    "Una comunidad de análisis jurídico y pensamiento comercial contemporáneo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${crimson.variable}`}>
        <ViewTransitionCommit />
        {children}
        {/* Temporary build stamp — lets editors confirm their browser is on the
            latest deploy (cache-busting check). Remove once verified. Fixed,
            bottom-right, non-interactive so it never blocks the UI. */}
        <div className="pointer-events-none fixed bottom-2 right-2 z-40 rounded-sm border border-line bg-paper/80 px-2 py-0.5 font-mono text-[10px] tracking-wide text-ink-faint backdrop-blur-sm">
          build {process.env.NEXT_PUBLIC_BUILD_SHA} · {process.env.NEXT_PUBLIC_BUILD_DATE}
        </div>
        {/* Agentation visual-feedback toolbar — dev only, never ships to prod. */}
        {process.env.NODE_ENV === "development" && <Agentation />}
        {/* DialKit authoring surfaces — dev only (patina light-path tuning). */}
        {process.env.NODE_ENV === "development" && <DevDials />}
      </body>
    </html>
  );
}
