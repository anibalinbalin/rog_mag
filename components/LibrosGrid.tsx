"use client";

import Image from "next/image";
import { useState } from "react";
import type { Libro } from "@/lib/libros";

function LibroCard({ libro }: { libro: Libro }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = libro.description.length > 200;

  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-6 border-b border-dashed border-line-dark py-8 last:border-b-0 sm:grid-cols-[160px_1fr] sm:items-center sm:gap-10">
      {/* Cover */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-cream p-3">
        {libro.coverImage && (
          <Image
            src={libro.coverImage}
            alt={libro.title}
            fill
            sizes="160px"
            className="object-contain [filter:drop-shadow(0_4px_8px_rgb(0_0_0_/_0.12))]"
          />
        )}
      </div>

      {/* Text */}
      <div>
        <span className="text-[11px] uppercase tracking-widest text-ink-muted">
          {libro.publisher}
        </span>
        <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-ink">
          {libro.title}
        </h3>
        {libro.description && (
          <div className="mt-3">
            <p
              className={`max-w-2xl text-sm leading-relaxed text-ink-soft ${
                !expanded && needsTruncation ? "line-clamp-3" : ""
              }`}
            >
              {libro.description}
            </p>
            {needsTruncation && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-sm text-burgundy underline underline-offset-4 transition-colors hover:text-burgundy-dark"
              >
                {expanded ? "Leer menos" : "Leer más"}
              </button>
            )}
          </div>
        )}
        <p className="mt-4">
          <span className="font-serif text-base italic text-burgundy">
            {libro.author}
          </span>
        </p>
        {libro.purchaseUrl && (
          <a
            href={libro.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit rounded-sm bg-burgundy/10 px-4 py-1.5 text-xs uppercase tracking-widest text-burgundy transition-colors hover:bg-burgundy/15"
          >
            {libro.publisher === "FCU"
              ? "Adquirir en FCU"
              : "Adquirir en La Ley"}
          </a>
        )}
      </div>
    </div>
  );
}

export default function LibrosGrid({
  librosByYear,
}: {
  librosByYear: [number, Libro[]][];
}) {
  return (
    <div className="mt-10 space-y-16">
      {librosByYear.map(([year, libros]) => (
        <section key={year}>
          <h2 className="font-serif text-3xl text-ink sm:text-4xl">{year}</h2>
          <div className="mt-10 border-t border-dashed border-line-dark">
            {libros.map((libro) => (
              <LibroCard key={libro.slug} libro={libro} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
