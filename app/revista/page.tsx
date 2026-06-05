import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IssueContentsAccordion from "@/components/IssueContentsAccordion";
import { getCurrentIssue, getAllIssues } from "@/lib/issues";

export const metadata = {
  title: "Revista — Revista de Derecho Comercial y de la Empresa",
};

export default function RevistaPage() {
  const currentIssue = getCurrentIssue();
  const others = getAllIssues().filter((i) => !i.current);

  const groups = currentIssue
    ? [
        { label: "Doctrina", items: currentIssue.doctrina },
        { label: "De interés", items: currentIssue.deInteres },
      ].filter((g) => g.items.length > 0)
    : [];

  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 py-12 lg:py-16">
          {/* Current issue — title + tan CTA + accordion, cover floated right */}
          {currentIssue && (
            <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-16">
              <div>
                <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
                  {currentIssue.number} ({currentIssue.year})
                </h1>

                <Link
                  href={`/revista/${currentIssue.slug}`}
                  className="mt-6 inline-flex items-center bg-action-dark px-7 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
                >
                  Ver más
                </Link>

                <div className="mt-12">
                  <IssueContentsAccordion groups={groups} />
                </div>
              </div>

              <div className="justify-self-center lg:justify-self-end">
                <div className="relative aspect-[3/4] w-64 overflow-hidden shadow-xl sm:w-72 lg:w-[340px]">
                  {currentIssue.cover && (
                    <Image
                      src={currentIssue.cover}
                      alt={`${currentIssue.number} (${currentIssue.year})`}
                      fill
                      sizes="(min-width: 1024px) 340px, 288px"
                      className="object-cover"
                      priority
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Versiones Anteriores — cover thumb + meta + title list */}
          {others.length > 0 && (
            <div className="mt-20">
              <h2 className="font-serif text-3xl text-ink sm:text-4xl">
                Versiones Anteriores
              </h2>

              <div className="mt-10 border-t border-dashed border-line-dark">
                {others.map((issue) => (
                  <Link
                    key={issue.slug}
                    href={`/revista/${issue.slug}`}
                    className="group grid grid-cols-[96px_1fr] items-start gap-6 border-b border-dashed border-line-dark py-8"
                  >
                    <div className="relative aspect-[3/4] w-24 overflow-hidden bg-paper-cream shadow">
                      {issue.cover && (
                        <Image
                          src={issue.cover}
                          alt={`${issue.number} (${issue.year})`}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-ink-muted">
                        {issue.season} {issue.year}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-ink transition-colors group-hover:text-ink-soft">
                        {issue.number} ({issue.year})
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                        Volumen {issue.volume} · N.º {issue.issue} ·{" "}
                        {issue.articleCount} artículos
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
