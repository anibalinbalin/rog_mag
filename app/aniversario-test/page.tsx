import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BibliografiaDepthShell from "@/components/BibliografiaDepthShell";
import BibliografiaSheet from "@/components/BibliografiaSheet";
import ScrollMapClient from "../testmapbelen/ScrollMapClient";
import { getEpocas } from "@/lib/epocas";
import { getPagina80Anos } from "@/lib/paginas";

export const metadata = {
  title: "80 Años (test · mapa) | Revista de Derecho Comercial y de la Empresa",
  description:
    "Versión de prueba de la página 80 Años: la sección «Seis épocas» reemplazada por el mapa de scroll de testmapbelen.",
  robots: { index: false, follow: false },
};

// TEST PAGE — a faithful replica of /80-años (app/aniversario) where the
// "Seis épocas de historia en ocho décadas" timeline section is swapped for the
// /testmapbelen scroll-map (ScrollMapClient, embedded). Served at /80-años-test
// via a rewrite to this ASCII folder (non-ASCII folders 404 in next dev).

/** Breaks the journal title onto two balanced lines like the mockup. */
function renderTitle(title: string) {
  const marker = " y de la Empresa";
  const idx = title.indexOf(marker);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <br />
      {title.slice(idx + 1)}
    </>
  );
}

/** Emphasizes the founder's name and the journal's original title in the intro. */
function renderIntro(intro: string) {
  const SPLIT =
    /(Sagunto Pérez Fontana|Revista de Derecho Comercial\s*[–—-]\s*Sociedades Anónimas)/g;
  const MATCH =
    /^(Sagunto Pérez Fontana|Revista de Derecho Comercial\s*[–—-]\s*Sociedades Anónimas)$/;
  return intro.split(SPLIT).map((part, i) =>
    MATCH.test(part) ? (
      <strong key={i} className="font-semibold text-ink-soft">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function OchentaAnosTestPage() {
  const pagina = getPagina80Anos();
  const epocas = getEpocas();

  return (
    <BibliografiaDepthShell>
      <Header compact />

      <main>
        {/* Section 1 — intro (white) with the giant ghost "80" behind the title */}
        <section className="mx-auto max-w-[1280px] px-4 pb-24 pt-36 sm:pt-45">
          <div className="mx-auto max-w-3xl text-center">
            {/* Title + years, with the decorative ghost "80" hugging them */}
            <div className="relative isolate">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-[56%] select-none font-serif text-[22rem] italic leading-none text-paper-gray/70 sm:text-[34rem]"
              >
                80
              </span>

              <h1 className="font-serif text-4xl font-bold leading-[1.1] text-ink sm:text-5xl">
                {renderTitle(pagina.title)}
              </h1>
              <p className="mt-5 font-serif text-2xl font-semibold italic text-ink sm:text-3xl">
                {pagina.yearsLabel}
              </p>
            </div>

            <p className="mx-auto mt-24 max-w-2xl font-serif text-xl font-semibold leading-relaxed text-ink sm:mt-28 sm:text-2xl">
              {pagina.lede}
            </p>

            <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-ink-muted">
              {renderIntro(pagina.intro)}
            </p>

            <div className="mt-12">
              <BibliografiaSheet
                label={pagina.bibliografiaLabel}
                eyebrow={pagina.bibliografiaEyebrow}
                name={pagina.bibliografiaName}
                years={pagina.bibliografiaYears}
                photo={pagina.bibliografiaPhoto}
                photoAlt={pagina.bibliografiaPhotoAlt}
                body={pagina.bibliografiaBody}
              />
            </div>
          </div>
        </section>

        {/* Section 2 — bound volumes (image bleeds to the left edge) + body */}
        {pagina.librosImage && pagina.librosBody.length > 0 && (
          <section className="border-y border-line">
            <div className="grid items-stretch lg:grid-cols-2">
              <div className="relative aspect-[1343/622] lg:aspect-auto lg:min-h-[460px]">
                <Image
                  src={pagina.librosImage}
                  alt={pagina.librosAlt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center px-4 py-12 lg:py-16">
                <div className="mx-auto max-w-xl space-y-5 lg:ml-12 lg:mr-auto">
                  {pagina.librosBody.map((paragraph, i) => (
                    <p key={i} className="text-base leading-relaxed text-ink-soft">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 3 — closing statement */}
        {pagina.closing && (
          <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
            <p className="font-serif text-2xl font-bold leading-snug text-ink sm:text-3xl">
              {pagina.closing}
            </p>
          </section>
        )}

        {/* Section 4 — "Seis épocas", here as the testmapbelen scroll-map. The
            map introduces itself in its own right column (the section heading
            lives there), so there's no separate full-width heading band. */}
        <section>
          <ScrollMapClient epocas={epocas} embedded />
        </section>
      </main>

      <Footer />
    </BibliografiaDepthShell>
  );
}
