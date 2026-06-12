import fs from "fs";
import path from "path";
import matter from "gray-matter";

const paginasDirectory = path.join(process.cwd(), "content/paginas");

export interface HeroSlide {
  image: string;
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface PaginaInicio {
  title: string;
  slides: HeroSlide[];
}

export interface Pagina80Anos {
  title: string;
  yearsLabel: string;
  lede: string;
  intro: string;
  bibliografiaLabel: string;
  bibliografiaHref: string;
  timelineHeading: string;
  founderImage: string;
  founderCaption: string;
}

function readPagina(slug: string): { [key: string]: unknown } | null {
  const fullPath = path.join(paginasDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);
  return data;
}

export function getPaginaInicio(): PaginaInicio {
  const data = readPagina("inicio") ?? {};
  const rawSlides: Partial<HeroSlide>[] = Array.isArray(data.slides)
    ? data.slides
    : [];

  return {
    title: (data.title as string) ?? "",
    slides: rawSlides.map((slide) => ({
      image: slide?.image ?? "",
      heading: slide?.heading ?? "",
      subheading: slide?.subheading ?? "",
      ctaLabel: slide?.ctaLabel ?? "",
      ctaHref: slide?.ctaHref ?? "",
    })),
  };
}

export function getPagina80Anos(): Pagina80Anos {
  const data = readPagina("80-anos") ?? {};

  return {
    title: (data.title as string) ?? "",
    yearsLabel: (data.yearsLabel as string) ?? "",
    lede: (data.lede as string) ?? "",
    intro: (data.intro as string) ?? "",
    bibliografiaLabel: (data.bibliografiaLabel as string) ?? "",
    bibliografiaHref: (data.bibliografiaHref as string) ?? "",
    timelineHeading: (data.timelineHeading as string) ?? "",
    founderImage: (data.founderImage as string) ?? "",
    founderCaption: (data.founderCaption as string) ?? "",
  };
}
