import fs from "fs";
import path from "path";
import matter from "gray-matter";

const authorsDirectory = path.join(process.cwd(), "content/authors");

export interface Author {
  slug: string;
  name: string;
  photo: string;
  role: string;
  institution: string;
  bio: string;
  linkedin: string;
  sections: string[];
}

function parseAuthor(fileName: string): Author {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(authorsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    name: data.name ?? "",
    photo: data.photo ?? "",
    role: data.role ?? "",
    institution: data.institution ?? "",
    bio: content.trim(),
    linkedin: data.linkedin ?? "",
    sections: data.sections ?? [],
  };
}

export function getAllAuthors(): Author[] {
  if (!fs.existsSync(authorsDirectory)) return [];
  return fs
    .readdirSync(authorsDirectory)
    .filter((f) => f.endsWith(".md"))
    .map(parseAuthor)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAuthorBySlug(slug: string): Author | null {
  const fullPath = path.join(authorsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  return parseAuthor(`${slug}.md`);
}

export function getAuthorByName(name: string): Author | null {
  return getAllAuthors().find((a) => a.name === name) ?? null;
}
