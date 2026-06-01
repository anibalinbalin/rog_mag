import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Noticias — Revista de Derecho Comercial y de la Empresa",
};

export default function NoticiasPage() {
  return (
    <>
      <Header />

      <main>
        <section className="mx-auto max-w-2xl px-6 pb-20 pt-10">
          <h1 className="font-serif text-3xl text-ink">Noticias</h1>
          <p className="mt-6 text-base text-ink-soft">
            Próximamente: novedades editoriales, congresos y jornadas
            académicas.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
