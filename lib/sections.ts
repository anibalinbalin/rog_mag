/** Editorial sections — the journal's named departments.
    Institutional identity (no personal branding), per the every.to
    column-landing pattern adapted for a law journal. */

export interface Section {
  slug: string;
  name: string;
  tagline: string;
}

export const sections: Section[] = [
  {
    slug: "doctrina",
    name: "Doctrina",
    tagline:
      "Análisis académico y dogmático del derecho comercial y de la empresa.",
  },
  {
    slug: "jurisprudencia",
    name: "Jurisprudencia",
    tagline:
      "Fallos comentados y tendencias de los tribunales en materia comercial.",
  },
  {
    slug: "noticias",
    name: "Noticias",
    tagline:
      "Novedades legislativas, congresos y actualidad del mundo jurídico.",
  },
];

export function getSectionBySlug(slug: string): Section | null {
  return sections.find((s) => s.slug === slug) ?? null;
}

export function getSectionByName(name: string): Section | null {
  return sections.find((s) => s.name === name) ?? null;
}
