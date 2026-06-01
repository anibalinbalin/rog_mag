import HeaderB from "@/components/b/HeaderB";
import FooterB from "@/components/b/FooterB";

export const metadata = {
  title: "Noticias — Revista de Derecho Comercial y de la Empresa",
};

export default function NoticiasBPage() {
  return (
    <>
      <HeaderB compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 py-12">
          <h1 className="text-xl font-medium uppercase tracking-wide text-ink">
            Noticias
          </h1>
          <p className="mt-4 font-serif text-lg text-ink-soft">
            Próximamente: novedades editoriales, congresos y jornadas
            académicas.
          </p>
        </section>
      </main>

      <FooterB />
    </>
  );
}
