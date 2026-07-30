import { getAllAuthors } from "./authors";
import { getAllIssues } from "./issues";

/** A searchable document for the reader-facing site search (/buscar).
    The corpus is built server-side at render/build time and handed to the
    client, which filters it locally — no search backend needed at this
    content volume. */
export interface SearchDoc {
  type: "author" | "issue";
  title: string;
  href: string;
  /** Secondary display line: role · institution / volume · year. */
  meta: string;
  /** Short display text under the title (currently unused by both types). */
  excerpt: string;
  /** Pre-normalized searchable text (lowercase, accents stripped). */
  haystack: string;
}

/** Lowercase + strip accents so "jurisprudencia" matches "Jurisprudencía". */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function getSearchCorpus(): SearchDoc[] {
  const authors: SearchDoc[] = getAllAuthors().map((author) => ({
    type: "author",
    title: author.name,
    href: `/autores/${author.slug}`,
    meta: [author.role, author.institution].filter(Boolean).join(" · "),
    excerpt: "",
    haystack: normalizeText(
      [
        author.name,
        author.role,
        author.institution,
        author.sections.join(" "),
        author.bio,
      ].join(" ")
    ),
  }));

  const issues: SearchDoc[] = getAllIssues().map((issue) => ({
    type: "issue",
    title: `${issue.number} (${issue.year}): ${issue.title}`,
    href: `/revistas/${issue.slug}`,
    meta: [
      issue.volume ? `Vol. ${issue.volume}` : null,
      issue.season || null,
      `${issue.articleCount} artículos`,
    ]
      .filter(Boolean)
      .join(" · "),
    excerpt: "",
    haystack: normalizeText(
      [
        issue.title,
        issue.number,
        String(issue.year),
        issue.season,
        issue.doctrina.join(" "),
        issue.deInteres.join(" "),
      ].join(" ")
    ),
  }));

  return [...authors, ...issues];
}
