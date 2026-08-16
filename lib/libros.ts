import fs from "fs";
import path from "path";
import matter from "gray-matter";

const librosDirectory = path.join(process.cwd(), "content/libros");

export interface Libro {
  slug: string;
  title: string;
  author: string;
  year: number;
  description: string;
  note: string;
  coverImage: string;
  purchaseUrl: string;
  publisher: string;
}

function parseLibro(fileName: string): Libro {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(librosDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);

  return {
    slug,
    title: data.title ?? "",
    author: data.author ?? "",
    year: Number(data.year) || 0,
    description: data.description ?? "",
    note: data.note ?? "",
    coverImage: data.coverImage ?? "",
    purchaseUrl: data.purchaseUrl ?? "",
    publisher: data.publisher ?? "",
  };
}

export function getAllLibros(): Libro[] {
  if (!fs.existsSync(librosDirectory)) return [];
  return fs
    .readdirSync(librosDirectory)
    .filter((f) => f.endsWith(".md"))
    .map(parseLibro)
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return a.title.localeCompare(b.title, "es");
    });
}

export function getLibrosByYear(): Map<number, Libro[]> {
  const libros = getAllLibros();
  const byYear = new Map<number, Libro[]>();
  for (const libro of libros) {
    byYear.set(libro.year, [...(byYear.get(libro.year) ?? []), libro]);
  }
  return byYear;
}
