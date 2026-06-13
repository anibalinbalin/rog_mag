import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TimelineClient from "./TimelineClient";
import { getEpocas } from "@/lib/epocas";
import { getPagina80Anos } from "@/lib/paginas";

export const metadata = {
  title: "80 Años | Revista de Derecho Comercial y de la Empresa",
  description:
    "Ocho décadas de la Revista de Derecho Comercial y de la Empresa (1946-2026): seis épocas de historia y la tradición editorial fundada por Sagunto Pérez Fontana.",
};

/** Splits the timeline heading so its tail ("ocho décadas") can be bolded
    like the mockup. Robust to copy changes: only bolds when that exact tail
    is present, otherwise renders the whole string plain. */
function renderTimelineHeading(heading: string) {
  const tail = "ocho décadas";
  const idx = heading.toLowerCase().lastIndexOf(tail);
  if (idx === -1) return heading;
  return (
    <>
      {heading.slice(0, idx)}
      <strong className="font-semibold">{heading.slice(idx, idx + tail.length)}</strong>
      {heading.slice(idx + tail.length)}
    </>
  );
}

export default function OchentaAnosPage() {
  const pagina = getPagina80Anos();
  const epocas = getEpocas();

  return (
    <>
      <Header compact />

      <main>
        {/* Section 1 — intro (white) with the giant ghost "80" behind the title */}
        <section className="mx-auto max-w-[1280px] px-4 pb-20 pt-16">
          <div className="relative mx-auto max-w-2xl text-center">
            {/* Ghost numeral — CSS text, decorative only */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-[58%] select-none font-serif text-[20rem] italic leading-none text-paper-gray/45 sm:text-[24rem]"
            >
              80
            </span>

            <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
              {pagina.title}
            </h1>
            <p className="mt-4 font-serif text-2xl italic text-ink-soft sm:text-3xl">
              {pagina.yearsLabel}
            </p>

            <p className="mx-auto mt-10 max-w-xl font-serif text-xl leading-relaxed text-ink">
              {pagina.lede}
            </p>

            <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-ink-muted">
              {pagina.intro}
            </p>

            {pagina.founderImage && (
              <figure className="mx-auto mt-12 max-w-[600px]">
                <Image
                  src={pagina.founderImage}
                  alt={pagina.founderCaption || "Retrato del fundador"}
                  width={1440}
                  height={990}
                  className="h-auto w-full border border-line"
                />
                {pagina.founderCaption && (
                  <figcaption className="mt-3 font-sans text-xs text-ink-muted">
                    {pagina.founderCaption}
                  </figcaption>
                )}
              </figure>
            )}

            <Link
              href={pagina.bibliografiaHref}
              className="mt-12 inline-flex items-center rounded-sm bg-action px-7 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
            >
              {pagina.bibliografiaLabel}
            </Link>
          </div>
        </section>

        {/* Section 2 — timeline (warm gray band) */}
        <section className="bg-paper-warm">
          <div className="mx-auto max-w-[1280px] px-4 py-20">
            <div className="mx-auto max-w-2xl">
              <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
                {renderTimelineHeading(pagina.timelineHeading)}
              </h2>

              <div className="mt-12">
                <TimelineClient epocas={epocas} />
              </div>
            </div>
          </div>
        </section>

        {/* Bibliografía Fontana — quiet placeholder so the CTA lands somewhere */}
        <section
          id="bibliografia-pendiente"
          className="mx-auto max-w-[1280px] px-4 py-16"
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="font-serif text-2xl text-ink">
              {pagina.bibliografiaLabel}
            </h2>
            <p className="mt-3 text-sm text-ink-muted">
              Contenido pendiente — a completar por Belén.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
