import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IssueCover from "@/components/IssueCover";
import { getAllIssues, getIssueBySlug } from "@/lib/issues";

export function generateStaticParams() {
  return getAllIssues().map((issue) => ({ slug: issue.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getIssueBySlug(slug);
  if (!issue) return {};
  return {
    title: `${issue.number} (${issue.year}) — ${issue.title}`,
  };
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getIssueBySlug(slug);
  if (!issue) notFound();

  return (
    <>
      <Header />

      <main>
        <section className="mx-auto max-w-2xl px-6 pb-20 pt-10">
          <div className="grid gap-10 sm:grid-cols-[1fr_220px]">
            <div>
              <h1 className="font-serif text-3xl leading-tight text-ink">
                {issue.number} ({issue.year}): {issue.title}
              </h1>

              <h2 className="mt-8 font-serif text-xl font-semibold text-ink">
                Contenido
              </h2>

              <div className="mt-4">
                <p className="text-sm text-ink-muted">Doctrina</p>
                <ul className="mt-2 space-y-1.5">
                  {issue.doctrina.map((item) => (
                    <li key={item} className="text-base text-ink-soft">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {issue.deInteres.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-ink-muted">De interés</p>
                  <ul className="mt-2 space-y-1.5">
                    {issue.deInteres.map((item) => (
                      <li key={item} className="text-base text-ink-soft">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="self-start">
              <IssueCover issue={issue} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
