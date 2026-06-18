"use client";

import { useState } from "react";
import Image from "next/image";
import type { ArchivoYear } from "@/lib/archivo";

/** Decades shown as filter pills (mockup), even before every one has scans —
    the timeline reads as complete and fills in as Belén adds folders. */
const DECADES = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

/** "Publicaciones desde 1946" — the digitized "Sociedades Anónimas" archive
    (tapas y sumarios). Browse by decade, then by year; each month shows the
    cover with its sumario peeking out behind it. */
export default function PublicacionesArchivo({ years }: { years: ArchivoYear[] }) {
  const byDecade = new Map<number, ArchivoYear[]>();
  for (const y of years) {
    const d = Math.floor(y.year / 10) * 10;
    byDecade.set(d, [...(byDecade.get(d) ?? []), y]);
  }
  const firstWithData = DECADES.find((d) => byDecade.has(d)) ?? DECADES[0];

  const [decade, setDecade] = useState(firstWithData);
  const [yearIdx, setYearIdx] = useState(0);
  const [query, setQuery] = useState("");

  const decadeYears = byDecade.get(decade) ?? [];
  const safeIdx = Math.min(yearIdx, Math.max(0, decadeYears.length - 1));
  const active = decadeYears[safeIdx] ?? null;
  const hasPrev = safeIdx > 0;
  const hasNext = safeIdx < decadeYears.length - 1;

  const q = query.trim().toLowerCase();
  const visibleMonths = active
    ? active.months.filter(
        (m) =>
          !q ||
          m.label.toLowerCase().includes(q) ||
          String(active.year).includes(q)
      )
    : [];

  return (
    <div>
      {/* Title + subtitle (left) · search (right) */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl text-ink sm:text-4xl">
            Publicaciones desde 1946
          </h2>
          <p className="mt-2 text-xs uppercase tracking-widest text-ink-muted">
            Tapas y sumarios
          </p>
        </div>

        <label className="relative block w-full sm:w-[360px]">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar revista"
            className="w-full rounded-full border border-line-dark bg-paper py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-action focus:outline-none"
          />
        </label>
      </div>

      {/* Decade pills */}
      <div className="mt-10 flex flex-wrap gap-3">
        {DECADES.map((d) => {
          const isActive = d === decade;
          return (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDecade(d);
                setYearIdx(0);
              }}
              aria-pressed={isActive}
              className={`rounded-full border px-5 py-2 text-sm tabular-nums tracking-wide transition-colors ${
                isActive
                  ? "border-burgundy bg-burgundy text-paper shadow-sm"
                  : "border-line-dark bg-paper text-ink-soft hover:border-burgundy hover:text-burgundy"
              }`}
            >
              {d}s
            </button>
          );
        })}
      </div>

      {/* Year archive for the active decade */}
      <div className="mt-14">
        {active ? (
          <>
            <div className="text-center">
              <h3 className="font-serif text-6xl font-bold tabular-nums leading-none text-ink sm:text-7xl">
                {active.year}
              </h3>
              {active.director && (
                <p className="mt-4 font-serif text-lg italic text-ink-muted sm:text-xl">
                  Director: {active.director}
                </p>
              )}
            </div>

            <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="justify-self-start">
                {hasPrev && (
                  <button
                    type="button"
                    onClick={() => setYearIdx((i) => i - 1)}
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-ink-soft transition-colors hover:text-ink"
                  >
                    <span aria-hidden="true">←</span> Año anterior
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-2.5">
                {decadeYears.map((y, i) => (
                  <button
                    key={y.year}
                    type="button"
                    onClick={() => setYearIdx(i)}
                    aria-label={`Ver ${y.year}`}
                    aria-pressed={i === safeIdx}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      i === safeIdx
                        ? "bg-action"
                        : "bg-line-dark hover:bg-ink-muted"
                    }`}
                  />
                ))}
              </div>

              <div className="justify-self-end">
                {hasNext && (
                  <button
                    type="button"
                    onClick={() => setYearIdx((i) => i + 1)}
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-ink-soft transition-colors hover:text-ink"
                  >
                    Siguiente año <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
            </div>

            <div
              key={active.year}
              className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 motion-safe:[animation:archivoFadeIn_200ms_ease-out] sm:grid-cols-3 lg:grid-cols-6"
            >
              {visibleMonths.map((m) => (
                <div key={m.num} className="text-center">
                  <p className="mb-4 text-sm uppercase tracking-widest text-ink-muted">
                    {m.label}
                  </p>
                  {/* Cover in front, sumario peeking out behind it (right) */}
                  <div className="relative mx-auto w-full max-w-[180px]">
                    {m.sumario && (
                      <Image
                        src={m.sumario}
                        alt=""
                        aria-hidden="true"
                        width={729}
                        height={1000}
                        sizes="160px"
                        className="absolute right-0 top-[5%] z-0 h-auto w-[76%] shadow-md ring-1 ring-black/5"
                      />
                    )}
                    <Image
                      src={m.cover}
                      alt={`Sociedades Anónimas — ${m.label} ${active.year}`}
                      width={729}
                      height={1000}
                      sizes="160px"
                      className="relative z-10 h-auto w-[80%] shadow-md ring-1 ring-black/5"
                    />
                  </div>
                </div>
              ))}
              {visibleMonths.length === 0 && (
                <p className="col-span-full py-8 text-center text-sm text-ink-muted">
                  No se encontraron revistas para “{query}”.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-sm text-ink-muted">
            Contenido pendiente para esta década.
          </p>
        )}
      </div>

      <style>{`
        @keyframes archivoFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
