import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
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
        {/* Temporary build stamp — lets editors confirm their browser is on the
            latest deploy (cache-busting check). Remove once verified. */}
        <div className="border-b border-line bg-paper py-1 text-center font-mono text-[11px] tracking-wide text-ink-soft">
          build {process.env.NEXT_PUBLIC_BUILD_SHA} · {process.env.NEXT_PUBLIC_BUILD_DATE}
        </div>
        {children}
      </body>
    </html>
  );
}
