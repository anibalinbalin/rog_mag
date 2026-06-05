"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { SearchDoc } from "@/lib/search";

/** Accent-insensitive normalization — mirror of lib/search normalizeText,
    duplicated here so this client component never imports the fs-touching
    server module. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const GROUPS: { type: SearchDoc["type"]; label: string }[] = [
  { type: "post", label: "Artículos" },
  { type: "author", label: "Autores" },
  { type: "issue", label: "Ediciones" },
];

export default function SearchClient({ corpus }: { corpus: SearchDoc[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(searchParams?.get("q") ?? "");

  // Focus the input on mount (every.to search-page behavior).
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the URL shareable (?q=...) without polluting history.
  useEffect(() => {
    const base = pathname ?? "/buscar";
    const next = query ? `${base}?q=${encodeURIComponent(query)}` : base;
    router.replace(next, { scroll: false });
  }, [query, pathname, router]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return null;
    const terms = q.split(/\s+/);

    return corpus
      .map((doc) => {
        if (!terms.every((term) => doc.haystack.includes(term))) return null;
        // Rank title matches above body/metadata matches.
        const titleNorm = normalize(doc.title);
        const score = terms.every((term) => titleNorm.includes(term)) ? 0 : 1;
        return { doc, score };
      })
      .filter((r): r is { doc: SearchDoc; score: number } => r !== null)
      .sort((a, b) => a.score - b.score)
      .map((r) => r.doc);
  }, [query, corpus]);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Oversized serif search input — every.to search-page treatment */}
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar artículos, autores, ediciones…"
        className="w-full border-b-2 border-line-dark bg-transparent pb-4 font-serif text-3xl text-ink placeholder:text-ink-muted/60 focus:border-burgundy focus:outline-none sm:text-4xl"
      />

      {/* Result count / state line */}
      {results !== null && (
        <p className="mt-6 text-xs uppercase tracking-widest text-ink-muted">
          {results.length === 0
            ? "Sin resultados"
            : `${results.length} resultado${results.length === 1 ? "" : "s"}`}
        </p>
      )}

      {/* Grouped results */}
      {results !== null && results.length > 0 && (
        <div className="mt-8 space-y-12">
          {GROUPS.map((group) => {
            const groupResults = results.filter((r) => r.type === group.type);
            if (groupResults.length === 0) return null;

            return (
              <section key={group.type}>
                <h2 className="border-b border-dashed border-line-dark pb-3 text-xs uppercase tracking-widest text-ink-muted">
                  {group.label}
                </h2>
                <ul className="divide-y divide-line">
                  {groupResults.map((doc) => (
                    <li key={doc.href}>
                      <Link href={doc.href} className="group block py-5">
                        <p className="font-serif text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-burgundy">
                          {doc.title}
                        </p>
                        {doc.excerpt && (
                          <p className="mt-2 font-serif text-base leading-relaxed text-ink-muted">
                            {doc.excerpt}
                          </p>
                        )}
                        {doc.meta && (
                          <p className="mt-2 text-xs uppercase tracking-widest text-ink-muted">
                            {doc.meta}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* No-results state */}
      {results !== null && results.length === 0 && (
        <p className="mt-10 border-t border-dashed border-line-dark pt-10 text-center font-serif text-lg text-ink-muted">
          No se encontraron resultados para «{query.trim()}». Pruebe con otros
          términos.
        </p>
      )}

      {/* Empty state — quick links into the sections */}
      {results === null && (
        <div className="mt-10">
          <p className="text-xs uppercase tracking-widest text-ink-muted">
            Explorar
          </p>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                href="/secciones/doctrina"
                className="font-serif text-lg text-ink-soft underline-offset-4 transition-colors hover:text-burgundy hover:underline"
              >
                Doctrina
              </Link>
            </li>
            <li>
              <Link
                href="/secciones/jurisprudencia"
                className="font-serif text-lg text-ink-soft underline-offset-4 transition-colors hover:text-burgundy hover:underline"
              >
                Jurisprudencia
              </Link>
            </li>
            <li>
              <Link
                href="/secciones/noticias"
                className="font-serif text-lg text-ink-soft underline-offset-4 transition-colors hover:text-burgundy hover:underline"
              >
                Noticias
              </Link>
            </li>
            <li>
              <Link
                href="/autores"
                className="font-serif text-lg text-ink-soft underline-offset-4 transition-colors hover:text-burgundy hover:underline"
              >
                Autores
              </Link>
            </li>
            <li>
              <Link
                href="/revista"
                className="font-serif text-lg text-ink-soft underline-offset-4 transition-colors hover:text-burgundy hover:underline"
              >
                Archivo de la revista
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
