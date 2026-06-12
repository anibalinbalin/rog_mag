import fs from "fs";
import path from "path";
import matter from "gray-matter";

const epocasDirectory = path.join(process.cwd(), "content/epocas");

export interface Epoca {
  slug: string;
  title: string;
  startYear: number;
  endYear: number;
  director: string;
  detail: string;
  content: string;
}

function parseEpoca(fileName: string): Epoca {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(epocasDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title ?? "",
    startYear: data.startYear ?? 0,
    endYear: data.endYear ?? 0,
    director: data.director ?? "",
    detail: data.detail ?? "",
    content,
  };
}

export function getEpocas(): Epoca[] {
  if (!fs.existsSync(epocasDirectory)) return [];
  return fs
    .readdirSync(epocasDirectory)
    .filter((f) => f.endsWith(".md"))
    .map(parseEpoca)
    .sort((a, b) => a.startYear - b.startYear);
}
