import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import { getPaginaInicio, type HeroSlide } from "@/lib/paginas";

export const metadata = {
  title: "Revista de Derecho Comercial y de la Empresa",
  description: "Análisis jurídico y pensamiento comercial contemporáneo.",
};

/** Mirrors the original static hero — used when content/paginas/inicio.md is
    missing or has no slides, so the homepage never renders an empty hero. */
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    image: "/hero-desk.jpg",
    heading: "Última edición",
    subheading: "DISPONIBLE",
    ctaLabel: "Ver la revista",
    ctaHref: "/revista",
  },
  {
    image: "/hero-80-anos.jpg",
    heading: "80 años",
    subheading: "Desde 1946 construyendo pensamiento jurídico",
    ctaLabel: "Leer más",
    ctaHref: "/80-años",
  },
];

export default function HomePage() {
  const { slides } = getPaginaInicio();
  const heroSlides = slides.length > 0 ? slides : FALLBACK_SLIDES;

  return (
    <>
      <Header />

      <main>
        {/* Hero carousel — slides fed by getPaginaInicio(), with a static
            fallback that mirrors the original desk hero. Fills the first
            screen on its own; article feeds live on their own pages. */}
        <HeroCarousel slides={heroSlides} />
      </main>

      <Footer />
    </>
  );
}
