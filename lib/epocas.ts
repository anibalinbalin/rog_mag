import fs from "fs";
import path from "path";
import matter from "gray-matter";

const epocasDirectory = path.join(process.cwd(), "content/epocas");

/** A person portrait shown on an época (render-only — not yet a Tina field).
 *  `aspect` is a CSS `aspect-ratio` string ("4/3" landscape, "3/4" portrait). */
export interface EpocaPhoto {
  src: string;
  alt: string;
  name: string;
  aspect: string;
}

export interface Epoca {
  slug: string;
  title: string;
  startYear: number;
  endYear: number;
  director: string;
  detail: string;
  photos: EpocaPhoto[];
  content: string;
}

function parseEpoca(fileName: string): Epoca {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(epocasDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const photos: EpocaPhoto[] = Array.isArray(data.photos)
    ? data.photos.map((p: Partial<EpocaPhoto>) => ({
        src: p.src ?? "",
        alt: p.alt ?? p.name ?? "",
        name: p.name ?? "",
        aspect: p.aspect ?? "3/4",
      }))
    : [];

  return {
    slug,
    title: data.title ?? "",
    startYear: data.startYear ?? 0,
    endYear: data.endYear ?? 0,
    director: data.director ?? "",
    detail: data.detail ?? "",
    photos,
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
