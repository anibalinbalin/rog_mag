import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IssueCover from "@/components/IssueCover";
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
      <Header />

      <main>
        <section className="mx-auto max-w-2xl px-6 pb-20 pt-10">
          {/* Current issue */}
          {currentIssue && (
            <div className="grid gap-10 sm:grid-cols-[1fr_220px]">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-muted">
                  Última edición
                </p>
                <h1 className="mt-3 font-serif text-3xl leading-tight text-ink">
                  {currentIssue.number} ({currentIssue.year}):{" "}
                  {currentIssue.title}
                </h1>

                <h2 className="mt-8 font-serif text-xl font-semibold text-ink">
                  Contenido
                </h2>

                <div className="mt-4">
                  <p className="text-sm text-ink-muted">Doctrina</p>
                  <ul className="mt-2 space-y-1.5">
                    {currentIssue.doctrina.map((item) => (
                      <li key={item} className="text-base text-ink-soft">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {currentIssue.deInteres.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-ink-muted">De interés</p>
                    <ul className="mt-2 space-y-1.5">
                      {currentIssue.deInteres.map((item) => (
                        <li key={item} className="text-base text-ink-soft">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="self-start">
                <IssueCover issue={currentIssue} />
              </div>
            </div>
          )}

          {/* Archive grouped by year */}
          <h2 className="mt-16 border-b border-line pb-4 font-serif text-2xl text-ink">
            Archivo
          </h2>

          <div className="mt-8 space-y-10">
            {years.map((year) => (
              <div key={year}>
                <h3 className="font-serif text-xl font-semibold text-ink">
                  {year}
                </h3>

                <div className="mt-4 divide-y divide-line">
                  {byYear.get(year)!.map((issue) => (
                    <Link
                      key={issue.slug}
                      href={`/revista/${issue.slug}`}
                      className="group flex items-baseline justify-between py-4"
                    >
                      <div>
                        <p className="text-base text-ink transition-colors group-hover:text-ink-soft">
                          {issue.number} · {issue.season}
                        </p>
                        <p className="mt-1 text-sm text-ink-muted">
                          Vol. {issue.volume} · {issue.articleCount} artículos
                        </p>
                      </div>
                      <span className="text-sm text-ink-muted transition-colors group-hover:text-ink">
                        Ver →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
