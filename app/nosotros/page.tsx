import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscribeBox from "@/components/SubscribeBox";
import { sections } from "@/lib/sections";

export const metadata = {
  title: "Nosotros — Revista de Derecho Comercial y de la Empresa",
  description:
    "Qué es la Revista de Derecho Comercial y de la Empresa: su misión, sus secciones y su tradición editorial.",
};

// The journal's cover art (Cloudinary) doubles as institutional identity here:
// each section is represented by the same image that illustrates its articles.
const ART = {
  doctrina:
    "https://res.cloudinary.com/dz9zexfaf/image/upload/v1780422724/covers/doctrina.jpg",
  jurisprudencia:
    "https://res.cloudinary.com/dz9zexfaf/image/upload/v1780422726/covers/jurisprudencia.jpg",
  noticias:
    "https://res.cloudinary.com/dz9zexfaf/image/upload/v1780422729/covers/noticias.jpg",
  tapa: "https://res.cloudinary.com/dz9zexfaf/image/upload/v1780422740/covers/tapa.jpg",
};

const sectionArt: Record<string, string> = {
  doctrina: ART.doctrina,
  jurisprudencia: ART.jurisprudencia,
  noticias: ART.noticias,
};

/** About page — every.to editorial-letter formula:
    mission hero → carta editorial → sections (institutional identity)
    → print edition → subscribe. */
export default function NosotrosPage() {
  return (
    <>
      <Header compact />

      <main>
        {/* Mission hero */}
        <section className="mx-auto max-w-[1280px] px-4 pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest text-ink-muted">
              Sobre la revista
            </p>
            <h1 className="mt-5 font-serif text-4xl leading-tight text-ink sm:text-5xl">
              Análisis jurídico riguroso y pensamiento comercial contemporáneo
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-serif text-xl leading-relaxed text-ink-muted">
              La Revista de Derecho Comercial y de la Empresa estudia el derecho
              que ordena la vida de los negocios: sus doctrinas, sus fallos y
              sus transformaciones.
            </p>
          </div>
        </section>

        {/* Carta editorial */}
        <section className="mx-auto max-w-[1280px] border-b border-dashed border-line-dark px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-ink-muted">
              Carta editorial
            </p>
            <div className="prose-article mt-8">
              <p>Estimado lector:</p>
              <p>
                Esta publicación nace de una convicción: el derecho comercial no
                es una disciplina estática. Cada contrato, cada fallo y cada
                reforma legislativa reescriben — a veces de forma silenciosa —
                las reglas con las que las empresas crean, intercambian y
                responden.
              </p>
              <p>
                La Revista reúne doctrina académica, jurisprudencia comentada y
                actualidad jurídica con una sola exigencia: rigor. Escriben en
                ella académicos y profesionales que ejercen la materia que
                analizan, porque entendemos que la mejor doctrina es la que
                dialoga con la práctica.
              </p>
              <p>
                Cada edición es, además, una invitación: a discutir, a disentir
                y a construir un derecho comercial a la altura de la empresa
                contemporánea.
              </p>
            </div>
            <div className="mt-10 border-t border-line pt-6">
              <p className="font-serif text-lg font-semibold text-ink">
                La Dirección
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Revista de Derecho Comercial y de la Empresa
              </p>
            </div>
          </div>
        </section>

        {/* Sections — institutional identity, illustrated by the journal's cover art */}
        <section className="mx-auto max-w-[1280px] border-b border-dashed border-line-dark px-4 py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-medium uppercase tracking-wide text-ink">
              Nuestras secciones
            </h2>
          </div>
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.slug}
                href={`/secciones/${section.slug}`}
                className="group block"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-cream">
                  <Image
                    src={sectionArt[section.slug]}
                    alt={section.name}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-5 font-serif text-2xl font-semibold text-ink transition-colors group-hover:text-ink-soft">
                  {section.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {section.tagline}
                </p>
                <p className="mt-3 text-xs uppercase tracking-widest text-burgundy">
                  Ver sección →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Print edition */}
        <section className="mx-auto max-w-[1280px] border-b border-dashed border-line-dark px-4 py-16">
          <div className="grid items-center gap-12 lg:grid-cols-[300px_1fr]">
            <Link href="/revista" className="group block">
              <div className="relative aspect-[3/4] w-full max-w-[300px] overflow-hidden bg-paper-cream">
                <Image
                  src={ART.tapa}
                  alt="Tapa de la edición actual"
                  fill
                  sizes="300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </Link>
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-widest text-ink-muted">
                La edición impresa
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-ink">
                Una tradición editorial que continúa
              </h2>
              <p className="mt-5 font-serif text-lg leading-relaxed text-ink-soft">
                La Revista se publica también en formato impreso, edición tras
                edición, reuniendo los trabajos de doctrina y la jurisprudencia
                comentada de cada semestre. El archivo completo de ediciones
                está disponible en línea.
              </p>
              <Link
                href="/revista"
                className="mt-8 inline-flex items-center rounded-sm bg-action-dark px-7 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
              >
                Ver el archivo de ediciones
              </Link>
            </div>
          </div>
        </section>

        {/* Authors + subscribe */}
        <section className="mx-auto max-w-[1280px] px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl leading-tight text-ink">
              Escriben quienes ejercen
            </h2>
            <p className="mt-5 font-serif text-lg leading-relaxed text-ink-muted">
              Nuestros autores son académicos y profesionales del derecho
              comercial, societario y de la empresa.
            </p>
            <Link
              href="/autores"
              className="mt-6 inline-block text-sm text-burgundy underline underline-offset-4 transition-colors hover:text-burgundy-dark"
            >
              Conocer a los autores →
            </Link>

            <div className="mt-16 border-t border-dashed border-line-dark pt-12">
              <p className="font-serif text-xl text-ink">
                Reciba cada nueva publicación
              </p>
              <div className="mt-6">
                <SubscribeBox centered />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
