import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IssueContents from "@/components/IssueContents";
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

/** Issue detail — dominant feature treatment from the revista landing,
    applied to a single archived edition. */
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
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted">
                Vol. {issue.volume} · {issue.number} · {issue.season}
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-ink">
                {issue.number} ({issue.year}): {issue.title}
              </h1>

              <IssueContents issue={issue} />
            </div>

            <div>
              <div className="aspect-[3/4] w-full bg-paper-cream" />
              <p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">
                Volumen {issue.volume}, N.º {issue.issue}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-ink-muted">
                {issue.articleCount} artículos
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
