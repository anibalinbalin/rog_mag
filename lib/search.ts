import { getAllPosts, formatDate } from "./blog";
import { getAllAuthors } from "./authors";
import { getAllIssues } from "./issues";

/** A searchable document for the reader-facing site search (/buscar).
    The corpus is built server-side at render/build time and handed to the
    client, which filters it locally — no search backend needed at this
    content volume. */
export interface SearchDoc {
  type: "post" | "author" | "issue";
  title: string;
  href: string;
  /** Secondary display line: author · date / role · institution / year. */
  meta: string;
  /** Short display text under the title (posts only). */
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

/** Strip markdown syntax down to searchable plain text. */
function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, " ")
    .replace(/[*_`>#]/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSearchCorpus(): SearchDoc[] {
  const posts: SearchDoc[] = getAllPosts().map((post) => ({
    type: "post",
    title: post.title,
    href: `/publicaciones/${post.slug}`,
    meta: [post.author, formatDate(post.date)].filter(Boolean).join(" · "),
    excerpt: post.excerpt,
    haystack: normalizeText(
      [
        post.title,
        post.excerpt,
        post.category,
        post.section,
        post.author,
        stripMarkdown(post.content),
      ].join(" ")
    ),
  }));

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
    href: `/revista/${issue.slug}`,
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

  return [...posts, ...authors, ...issues];
}
