"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatDate } from "@/lib/format";

export type PubItem = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  section: string;
  coverImage: string;
};

/** Belen's direction (2026-06): Publicaciones as a searchable list — pill
    search field, dashed-rule rows, tan "Leer" CTA. Client-side text match. */
export default function PublicacionesSearch({ posts }: { posts: PubItem[] }) {
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const filtered = query
    ? posts.filter((p) =>
        [p.title, p.excerpt, p.author, p.section].some((field) =>
          field.toLowerCase().includes(query)
        )
      )
    : posts;

  return (
    <>
      {/* Title + search on one row */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="font-serif text-4xl text-ink sm:text-5xl">
          Publicaciones
        </h1>

        <div className="relative w-full lg:max-w-xl">
          <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar publicación"
          aria-label="Buscar publicación"
          className="w-full rounded-sm border border-line bg-paper py-3.5 pl-14 pr-5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-ink-muted"
          />
        </div>
      </div>

      {/* List */}
      <div className="mt-10 border-t border-dashed border-line-dark">
        {filtered.map((post) => (
          <div
            key={post.slug}
            className="grid grid-cols-[120px_1fr] items-start gap-6 border-b border-dashed border-line-dark py-8 last:border-b-0 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-10"
          >
            {/* Thumbnail (post cover) */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-cream">
              {post.coverImage && (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              )}
            </div>

            {/* Content */}
            <div>
              <span className="text-[11px] uppercase tracking-widest text-ink-muted">
                {formatDate(post.date)}
              </span>
              <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-ink">
                {post.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                {post.excerpt}
              </p>
              <p className="mt-4 text-xs uppercase tracking-widest text-ink-soft">
                {post.author}
              </p>
            </div>

            {/* CTA — own column on desktop, full-width row on mobile */}
            <Link
              href={`/publicaciones/${post.slug}`}
              className="col-span-2 inline-flex items-center justify-center justify-self-start rounded-sm bg-action-dark px-7 py-2.5 text-xs uppercase tracking-widest text-paper transition-opacity hover:opacity-90 sm:col-span-1 sm:justify-self-end"
            >
              Leer
            </Link>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="py-12 text-sm text-ink-muted">
            No se encontraron publicaciones para “{q}”.
          </p>
        )}
      </div>
    </>
  );
}
