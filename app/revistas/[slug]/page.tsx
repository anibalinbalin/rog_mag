import { notFound } from "next/navigation";
import databaseClient from "@/tina/__generated__/databaseClient";
import { plainify } from "@/lib/tina-serialize";
import IssueClient from "./IssueClient";
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

type TinaIssueProps = Awaited<ReturnType<typeof databaseClient.queries.issue>>;

/** Issue detail — dominant feature treatment from the revista landing,
    applied to a single archived edition.

    Content is fetched through the Tina databaseClient so the admin's
    contextual editing can live-update the page; rendering happens in
    IssueClient (useTina + TinaMarkdown). */
export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let tinaProps: TinaIssueProps | null = null;
  try {
    tinaProps = plainify(
      await databaseClient.queries.issue({ relativePath: `${slug}.md` })
    );
  } catch {
    tinaProps = null;
  }
  if (!tinaProps) notFound();

  return (
    <IssueClient
      data={tinaProps.data}
      variables={tinaProps.variables}
      query={tinaProps.query}
    />
  );
}
