import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSearchCorpus } from "@/lib/search";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "Buscar — Revista de Derecho Comercial y de la Empresa",
  description:
    "Busque artículos, autores y ediciones de la Revista de Derecho Comercial y de la Empresa.",
};

/** Reader-facing site search. The corpus (every post, author, and issue) is
    embedded at build time; filtering happens entirely in the browser. */
export default function BuscarPage() {
  const corpus = getSearchCorpus();

  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 py-12">
          {/* Suspense: useSearchParams in the client component requires a
              boundary for static prerendering. */}
          <Suspense fallback={null}>
            <SearchClient corpus={corpus} />
          </Suspense>
        </section>
      </main>

      <Footer />
    </>
  );
}
