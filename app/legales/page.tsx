import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Legales — Revista de Derecho Comercial y de la Empresa",
};

export default function LegalesPage() {
  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-burgundy">
              Información legal
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-ink">
              Legales
            </h1>
            <p className="mt-6 font-serif text-lg leading-relaxed text-ink-soft">
              Información legal, política de privacidad y términos de uso de la
              Revista de Derecho Comercial y de la Empresa.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
