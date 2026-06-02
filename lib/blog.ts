import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface Post {
  slug: string;
  title: string;
  category: string;
  section: string;
  excerpt: string;
  author: string;
  authorRole: string;
  date: string;
  content: string;
}

export interface PostWithHtml extends Post {
  contentHtml: string;
}

/** Normalize a frontmatter date to "YYYY-MM-DD".
    Handles plain strings ("2026-05-15"), ISO datetimes written by the Tina
    editor ("2026-05-15T00:00:00.000Z"), and Date objects from unquoted YAML. */
function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.split("T")[0];
  return "";
}

function parsePost(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title ?? "",
    category: data.category ?? "",
    section: data.section ?? "Doctrina",
    excerpt: data.excerpt ?? "",
    author: data.author ?? "",
    authorRole: data.authorRole ?? "",
    date: normalizeDate(data.date),
    content,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md"))
    .map(parsePost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  return parsePost(`${slug}.md`);
}

export async function getPostWithHtml(
  slug: string
): Promise<PostWithHtml | null> {
  const post = getPostBySlug(slug);
  if (!post) return null;
  const processed = await remark().use(html).process(post.content);
  return { ...post, contentHtml: processed.toString() };
}

export function getPostsBySection(sectionName: string): Post[] {
  return getAllPosts().filter((p) => p.section === sectionName);
}

export function getPostsByAuthor(authorName: string): Post[] {
  return getAllPosts().filter((p) => p.author === authorName);
}

/** Related posts: same section first, then same author, excluding the
    current post. Vertical-list treatment under articles (every.to pattern). */
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const others = getAllPosts().filter((p) => p.slug !== post.slug);
  const sameSection = others.filter((p) => p.section === post.section);
  const sameAuthor = others.filter(
    (p) => p.section !== post.section && p.author === post.author
  );
  return [...sameSection, ...sameAuthor].slice(0, limit);
}

// Client-safe implementation lives in lib/format.ts; re-exported here so
// server-side consumers keep importing from "@/lib/blog".
export { formatDate } from "./format";
