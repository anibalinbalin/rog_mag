import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Legales — Revista de Derecho Comercial y de la Empresa",
};

export default function LegalesPage() {
  return (
    <>
      <Header />

      <main>
        <section className="mx-auto max-w-2xl px-6 pb-20 pt-10">
          <h1 className="font-serif text-3xl text-ink">Legales</h1>
          <p className="mt-6 text-base leading-relaxed text-ink-soft">
            Información legal, política de privacidad y términos de uso de la
            Revista de Derecho Comercial y de la Empresa.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
