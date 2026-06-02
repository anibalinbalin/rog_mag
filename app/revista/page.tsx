import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IssueContents from "@/components/IssueContents";
import { getCurrentIssue, getIssuesByYear } from "@/lib/issues";

export const metadata = {
  title: "Revista — Revista de Derecho Comercial y de la Empresa",
};

export default function RevistaPage() {
  const currentIssue = getCurrentIssue();
  const byYear = getIssuesByYear();
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 py-12">
          {/* Current issue — dominant feature treatment */}
          {currentIssue && (
            <div className="grid gap-10 border-b border-dashed border-line-dark pb-12 lg:grid-cols-[1fr_300px]">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-muted">
                  Última edición
                </p>
                <h1 className="mt-4 font-serif text-4xl leading-tight text-ink">
                  {currentIssue.number} ({currentIssue.year}):{" "}
                  {currentIssue.title}
                </h1>

                <IssueContents issue={currentIssue} />
              </div>

              <div>
                <div className="aspect-[3/4] w-full bg-paper-cream" />
                <p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">
                  Volumen {currentIssue.volume}, N.º {currentIssue.issue}
                </p>
              </div>
            </div>
          )}

          {/* Archive — section rhythm with year groups */}
          <div className="pt-12">
            <h2 className="text-xl font-medium uppercase tracking-wide text-ink">
              Archivo
            </h2>

            <div className="mt-8 space-y-12">
              {years.map((year) => (
                <div key={year}>
                  <p className="font-serif text-2xl font-semibold text-ink">
                    {year}
                  </p>
                  <div className="mt-4 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
                    {byYear.get(year)!.map((issue) => (
                      <Link
                        key={issue.slug}
                        href={`/revista/${issue.slug}`}
                        className="group bg-paper p-6 transition-colors hover:bg-paper-warm"
                      >
                        <p className="text-xs uppercase tracking-widest text-ink-muted">
                          Vol. {issue.volume} · {issue.number}
                        </p>
                        <p className="mt-3 font-serif text-xl font-semibold text-ink">
                          {issue.season}
                        </p>
                        <p className="mt-1 text-sm text-ink-muted">
                          {issue.articleCount} artículos
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
