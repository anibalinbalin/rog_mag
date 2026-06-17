import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCover3D from "@/components/BookCover3D";
import IssueContentsAccordion from "@/components/IssueContentsAccordion";
import { getCurrentIssue, getAllIssues, type Issue } from "@/lib/issues";

export const metadata = {
  title: "Revista — Revista de Derecho Comercial y de la Empresa",
};

/** "MAYO 2026"-style label (month falls back to season). Uppercased in CSS. */
function issueDateLabel(issue: Issue) {
  return `${issue.month || issue.season} ${issue.year}`.trim();
}

/** "Revista de Derecho Comercial y de la Empresa 3-4" — full title + the bare
    number (drops the "No. " prefix), exactly as the mockup lists past issues. */
function issueListTitle(issue: Issue) {
  const bare = issue.number.replace(/^(no\.?|nº)\s*/i, "").trim();
  return `${issue.title} ${bare}`.trim();
}

export default function RevistaPage() {
  const currentIssue = getCurrentIssue();
  const others = getAllIssues().filter((i) => !i.current);

  // The four mockup categories, always shown (empty ones render "pendiente").
  const groups = currentIssue
    ? [
        { label: "Doctrina", items: currentIssue.doctrina },
        { label: "De interés", items: currentIssue.deInteres },
        {
          label: "Actualidad Sociedades Comerciales",
          items: currentIssue.actualidadSociedades,
        },
        { label: "Concursos", items: currentIssue.concursos },
      ]
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
                  className="mt-6 inline-flex items-center rounded-sm bg-action-dark px-7 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
                >
                  Ver más
                </Link>

                <div className="mt-12">
                  <IssueContentsAccordion groups={groups} />
                </div>
              </div>

              <div className="justify-self-center lg:justify-self-end">
                <BookCover3D
                  src={currentIssue.cover}
                  alt={`${currentIssue.number} (${currentIssue.year})`}
                  priority
                  className="w-64 sm:w-72 lg:w-[340px]"
                />
              </div>
            </div>
          )}

          {/* Revistas Anteriores — cover thumb + date + title + dek list */}
          {others.length > 0 && (
            <div className="mt-20">
              <h2 className="font-serif text-3xl text-ink sm:text-4xl">
                Revistas Anteriores
              </h2>

              <div className="mt-10 border-t border-dashed border-line-dark">
                {others.map((issue) => (
                  <Link
                    key={issue.slug}
                    href={`/revista/${issue.slug}`}
                    className="group grid grid-cols-[88px_1fr] items-start gap-6 border-b border-dashed border-line-dark py-8 sm:grid-cols-[112px_1fr] sm:gap-8"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-cream shadow">
                      {issue.cover && (
                        <Image
                          src={issue.cover}
                          alt={`${issue.number} (${issue.year})`}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-ink-muted">
                        {issueDateLabel(issue)}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-ink transition-colors group-hover:text-ink-soft">
                        {issueListTitle(issue)}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                        {issue.description ||
                          `Volumen ${issue.volume} · N.º ${issue.issue} · ${issue.articleCount} artículos`}
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
