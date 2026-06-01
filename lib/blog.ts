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
  excerpt: string;
  author: string;
  authorRole: string;
  date: string;
  content: string;
}

export interface PostWithHtml extends Post {
  contentHtml: string;
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
    excerpt: data.excerpt ?? "",
    author: data.author ?? "",
    authorRole: data.authorRole ?? "",
    date: data.date ?? "",
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

export function formatDate(dateString: string): string {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const date = new Date(dateString + "T00:00:00");
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}
