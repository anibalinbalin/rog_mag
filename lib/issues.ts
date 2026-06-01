import fs from "fs";
import path from "path";
import matter from "gray-matter";

const issuesDirectory = path.join(process.cwd(), "content/issues");

export interface Issue {
  slug: string;
  title: string;
  number: string;
  year: number;
  volume: number;
  issue: number;
  season: string;
  articleCount: number;
  current: boolean;
  doctrina: string[];
  deInteres: string[];
}

function parseIssue(fileName: string): Issue {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(issuesDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);

  return {
    slug,
    title: data.title ?? "",
    number: data.number ?? "",
    year: data.year ?? 0,
    volume: data.volume ?? 0,
    issue: data.issue ?? 0,
    season: data.season ?? "",
    articleCount: data.articleCount ?? 0,
    current: data.current ?? false,
    doctrina: data.doctrina ?? [],
    deInteres: data.deInteres ?? [],
  };
}

export function getAllIssues(): Issue[] {
  if (!fs.existsSync(issuesDirectory)) return [];
  return fs
    .readdirSync(issuesDirectory)
    .filter((f) => f.endsWith(".md"))
    .map(parseIssue)
    .sort((a, b) => b.year - a.year || b.issue - a.issue);
}

export function getCurrentIssue(): Issue | null {
  return getAllIssues().find((i) => i.current) ?? null;
}

export function getIssueBySlug(slug: string): Issue | null {
  const fullPath = path.join(issuesDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  return parseIssue(`${slug}.md`);
}

export function getIssuesByYear(): Map<number, Issue[]> {
  const byYear = new Map<number, Issue[]>();
  for (const issue of getAllIssues()) {
    const list = byYear.get(issue.year) ?? [];
    list.push(issue);
    byYear.set(issue.year, list);
  }
  return byYear;
}
