"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { Scroll } from "@silk-hq/components";
import { SheetWithDepth } from "@/components/SheetWithDepth";
import ScanZoom from "@/components/ScanZoom";
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

/** Magnifier-with-plus — the "ampliar" affordance that fades in over the
    exposed inside page when a magazine is open. */
function MagnifyPlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5M11 8.5v5M8.5 11h5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Deterministic per-issue jitter so each magazine opens a little differently —
    a slightly different angle, speed and a faint resting tilt — instead of every
    cover flipping identically. Keyed off the issue (year+month) so the server and
    client agree (no hydration flicker), and stable across renders. */
function bookJitter(seed: number) {
  const rnd = (salt: number) => {
    // avalanche hash (murmur3 finalizer) so consecutive issues scatter rather
    // than ramping in lockstep down a row.
    let h = Math.imul((seed ^ Math.imul(salt, 0x9e3779b1)) | 0, 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h ^= h >>> 16;
    return ((h >>> 0) % 100000) / 100000; // [0,1)
  };
  const angle = 150 + Math.round(rnd(1) * 22); // 150–172° open
  return {
    angle,
    tilt: +((rnd(2) * 2 - 1) * 1.3).toFixed(2), // −1.3…+1.3° resting tilt
    dur: 460 + Math.round(rnd(3) * 150), // 460–610ms
    // How far (as a % of the book's own width) the open cover's free edge
    // reaches to the left of the spine — |cos(angle)|, since the cover is
    // hinged on the left and rotates flat toward the viewer. Anchors the
    // ground/neighbor shadow (.archivo-ground) right at each book's actual
    // tip instead of guessing an average, so it never overlaps (and gets
    // hidden behind) the opaque open cover.
    reach: Math.abs(Math.cos((angle * Math.PI) / 180)),
  };
}

/** "Publicaciones desde 1946" — the digitized "Sociedades Anónimas" archive
    (tapas y sumarios). Browse by decade, then by year; each month shows just
    the cover, which flips open on hover — like a real magazine — to reveal the
    sumario inside. */
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
  // The issue currently enlarged in the depth sheet (null = closed). Holds both
  // the cover (tapa) and the sumario so the sheet can show the full spread.
  const [viewing, setViewing] = useState<{
    cover: string;
    sumario: string;
    label: string;
    year: number;
  } | null>(null);
  // Which page is open in the focused zoom viewer (null = showing the spread).
  const [zoomPage, setZoomPage] = useState<"cover" | "sumario" | null>(null);

  // Closing the sheet always drops back to the spread, so re-opening another
  // issue never lands mid-zoom on a stale page.
  const closeSheet = () => {
    setViewing(null);
    setZoomPage(null);
  };

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
            className="w-full rounded-sm border border-line-dark bg-paper py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-action focus:outline-none"
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
              className={`rounded-sm border px-5 py-2 text-sm tabular-nums tracking-wide transition-colors ${
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
                    className="inline-flex items-center gap-2 rounded-sm bg-burgundy/10 px-4 py-1.5 text-xs uppercase tracking-widest text-burgundy transition-colors hover:bg-burgundy/15"
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
                    className="inline-flex items-center gap-2 rounded-sm bg-burgundy/10 px-4 py-1.5 text-xs uppercase tracking-widest text-burgundy transition-colors hover:bg-burgundy/15"
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
              {visibleMonths.map((m) => {
                const book = bookJitter(active.year * 100 + Number(m.num));
                const bookStyle = {
                  "--open": `${book.angle}deg`,
                  "--tilt": `${book.tilt}deg`,
                  "--dur": `${book.dur}ms`,
                  "--ground-right": `${(100 * (1 + book.reach)).toFixed(1)}%`,
                } as CSSProperties;
                const bookClass =
                  "archivo-book group relative mx-auto aspect-[729/1000] w-[82%] max-w-[160px] hover:z-20";

                /* Magazine flip-open: the cover is hinged on the spine and swings
                   open on hover to reveal the sumario inside (two-faced — cover art
                   in front, a cream inside-cover behind). Each book opens to a
                   slightly different angle, speed and resting tilt (deterministic
                   per issue, so SSR matches). All children are phrasing content so
                   the whole book can be a <button> when there's a sumario to open.
                   Pure CSS; reduced motion keeps clean static covers. */
                const inner = (
                  <span className="archivo-inner">
                    {m.sumario && (
                      <Image
                        className="archivo-sum"
                        src={m.sumario}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="160px"
                      />
                    )}
                    <span className="archivo-cast" aria-hidden="true" />
                    <span className="archivo-ground" aria-hidden="true" />
                    <span className="archivo-cover">
                      <Image
                        className="archivo-front"
                        src={m.cover}
                        alt={`Sociedades Anónimas — ${m.label} ${active.year}`}
                        fill
                        sizes="160px"
                      />
                      <span className="archivo-back" aria-hidden="true" />
                    </span>
                    {/* "ampliar" affordance — fades in over the exposed inside page
                        once the cover is open (only when there's a sumario). */}
                    {m.sumario && (
                      <span className="archivo-hint" aria-hidden="true">
                        <MagnifyPlusIcon />
                      </span>
                    )}
                  </span>
                );

                return (
                  <div key={m.num} className="text-center">
                    <p className="mb-4 text-sm uppercase tracking-widest text-ink-muted">
                      {m.label}
                    </p>
                    {m.sumario ? (
                      <button
                        type="button"
                        onClick={() =>
                          setViewing({
                            cover: m.cover,
                            sumario: m.sumario!,
                            label: m.label,
                            year: active.year,
                          })
                        }
                        aria-label={`Ampliar el sumario de ${m.label} ${active.year}`}
                        className={`${bookClass} block cursor-pointer appearance-none border-0 bg-transparent p-0`}
                        style={bookStyle}
                      >
                        {inner}
                      </button>
                    ) : (
                      <div className={bookClass} style={bookStyle}>
                        {inner}
                      </div>
                    )}
                  </div>
                );
              })}
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

      {/* One shared "sheet with depth" for the whole grid: clicking any open
          magazine slides its tapa + sumario scans up over the page (which
          recedes). The spread is the overview; tapping a page opens a focused
          zoom viewer (ScanZoom) built for older readers. Dismiss via the X, the
          backdrop, swipe-down, or Esc. Depth recede binds to the page's
          DepthShell Outlet (forComponent="closest"). */}
      <SheetWithDepth.Root
        presented={!!viewing}
        onPresentedChange={(open) => {
          if (!open) closeSheet();
        }}
      >
        <SheetWithDepth.Portal>
          <SheetWithDepth.View>
            <SheetWithDepth.Backdrop />
            {/* Full-width sheet: with both the tapa and the sumario shown as a
                two-up spread, the width earns its keep instead of wasting paper. */}
            <SheetWithDepth.Content>
              <div className="relative h-full">
                {/* Global close — hidden while the focused viewer is up (it has
                    its own Volver + Cerrar) so there's never a stray control. */}
                {!zoomPage && (
                  <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
                    <SheetWithDepth.Trigger
                      action="dismiss"
                      aria-label="Cerrar"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-warm"
                    >
                      <CloseIcon />
                    </SheetWithDepth.Trigger>
                  </div>
                )}

                <Scroll.Root className="h-full">
                  <Scroll.View className="h-full" scrollGestureTrap={{ yEnd: true }}>
                    <Scroll.Content>
                      <div className="px-5 pb-16 pt-16 sm:px-8 sm:pt-20">
                        {viewing && (
                          <>
                            <p className="text-center text-xs uppercase tracking-widest text-ink-muted">
                              Sociedades Anónimas · {viewing.label} {viewing.year}
                            </p>
                            <SheetWithDepth.Title className="mt-2 text-center font-serif text-2xl text-ink sm:text-3xl">
                              Tapa y sumario
                            </SheetWithDepth.Title>
                            <p className="mt-3 text-center text-sm text-ink-muted">
                              Tocá una página para ampliarla y leerla cómodo.
                            </p>
                            {/* Tapa + sumario side by side on wider screens (a
                                real two-page spread), stacked on phones. Each page
                                is a button that opens the focused zoom viewer. */}
                            <div className="mx-auto mt-8 flex max-w-5xl flex-col items-start gap-8 sm:flex-row sm:justify-center sm:gap-10">
                              {([
                                { key: "cover", label: "Tapa", src: viewing.cover },
                                { key: "sumario", label: "Sumario", src: viewing.sumario },
                              ] as const).map((p) => (
                                <figure key={p.key} className="w-full sm:w-1/2 sm:max-w-[420px]">
                                  <button
                                    type="button"
                                    onClick={() => setZoomPage(p.key)}
                                    aria-label={`Ampliar ${p.label.toLowerCase()} — Sociedades Anónimas ${viewing.label} ${viewing.year}`}
                                    className="group relative block w-full cursor-zoom-in overflow-hidden rounded-sm bg-paper-cream shadow-lg transition-shadow hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
                                  >
                                    <Image
                                      src={p.src}
                                      alt={`${p.label} — Sociedades Anónimas ${viewing.label} ${viewing.year}`}
                                      width={729}
                                      height={1000}
                                      sizes="(min-width: 640px) 420px, 100vw"
                                      className="h-auto w-full"
                                    />
                                    {/* Always-visible "Ampliar" pill — older readers
                                        shouldn't have to discover a hover affordance. */}
                                    <span className="pointer-events-none absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-paper/95 px-4 py-2 text-sm font-medium text-ink shadow-md ring-1 ring-black/5 transition-transform group-hover:scale-105">
                                      <MagnifyPlusIcon />
                                      Ampliar
                                    </span>
                                  </button>
                                  <figcaption className="mt-3 text-center text-xs uppercase tracking-widest text-ink-muted">
                                    {p.label}
                                  </figcaption>
                                </figure>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </Scroll.Content>
                  </Scroll.View>
                </Scroll.Root>

                {/* Focused, elderly-friendly zoom for the chosen page. Keyed so
                    switching tapa↔sumario remounts clean (fresh zoom + pan). */}
                {viewing && zoomPage && (
                  <ScanZoom
                    key={zoomPage}
                    src={zoomPage === "cover" ? viewing.cover : viewing.sumario}
                    pageLabel={zoomPage === "cover" ? "Tapa" : "Sumario"}
                    caption={`Sociedades Anónimas · ${viewing.label} ${viewing.year}`}
                    onBack={() => setZoomPage(null)}
                    onClose={closeSheet}
                  />
                )}
              </div>
            </SheetWithDepth.Content>
          </SheetWithDepth.View>
        </SheetWithDepth.Portal>
      </SheetWithDepth.Root>

      <style>{`
        @keyframes archivoFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ── Magazine flip-open ──────────────────────────────
           rest  : closed cover (the inner sits at its faint --tilt).
           hover : the cover swings open on the left spine by --open, casting a
                   shadow that sweeps across the sumario toward the spine as the
                   cover lifts, ending as the resting spine-gutter shade.
           Per-issue --open / --dur / --tilt make each one a little different. */
        .archivo-book { perspective: 1500px; }
        .archivo-inner {
          position: absolute; inset: 0;
          transform: rotate(var(--tilt, 0deg));
          transform-style: preserve-3d;
        }
        .archivo-sum {
          object-fit: cover;
          transform: translateZ(-2px);
          box-shadow: 0 8px 18px rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.05);
        }
        /* Cast shadow on the page plane: full-page at rest (invisible), it fades
           in while scaling down to a spine gutter, so on hover it reads as the
           opening cover's shadow retreating across the page. transform/opacity
           only; shares --dur and the cover's split easings (plain close here,
           overshoot on :hover below) so cover and shadow move as one unit. */
        .archivo-cast {
          position: absolute; inset: 0;
          pointer-events: none; opacity: 0;
          transform: translateZ(-1px);
          transform-origin: left center;
          background: linear-gradient(90deg, rgba(40,22,10,.36), rgba(40,22,10,.1) 62%, transparent);
          transition: opacity var(--dur, 520ms) cubic-bezier(0.4, 0, 0.2, 1),
                      transform var(--dur, 520ms) cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* Ground + neighbor shadow: as the cover lifts open, a soft shadow
           fades in over the page background and onto whichever magazine
           sits in the neighboring cell — grounding the cover as something
           physically lifted above the page. --ground-right anchors this
           element's right edge to each book's own tip (the open cover's
           free edge, computed per-book from --open in bookJitter), so it
           starts exactly where the opaque cover ends instead of guessing
           an average — a flat plane sized to overlap the cover itself would
           just get hidden behind it (it swings to a higher, viewer-facing
           depth). No 3D transform here on purpose: this element sits outside
           .archivo-inner's own box (right can exceed 100%), and combining
           that with translateZ inside a preserve-3d ancestor silently drops
           the paint in Chromium — confirmed by testing, not assumed. Plain
           2D scale is enough; --dur/easing keep it moving with the cover. */
        .archivo-ground {
          position: absolute; top: 4%; bottom: 4%;
          right: var(--ground-right, 6%); width: 85%;
          pointer-events: none; opacity: 0;
          transform: scaleX(0.7);
          transform-origin: right center;
          background: radial-gradient(ellipse 130% 100% at right center, rgba(40,22,10,.32), rgba(40,22,10,.22) 32%, rgba(40,22,10,.08) 62%, transparent 88%);
          transition: opacity var(--dur, 520ms) cubic-bezier(0.4, 0, 0.2, 1),
                      transform var(--dur, 520ms) cubic-bezier(0.4, 0, 0.2, 1);
        }
        .archivo-cover {
          position: absolute; inset: 0;
          transform-origin: left center;
          transform-style: preserve-3d;
          /* CLOSE (mouse-out): plain ease-out, NO overshoot. The bouncy open
             easing lives in the :hover rule below — applied here too it would
             swing the cover past closed and bounce back, reading as a phantom
             "second flip" on mouse-out. */
          transition: transform var(--dur, 520ms) cubic-bezier(0.4, 0, 0.2, 1);
        }
        .archivo-front {
          object-fit: cover;
          backface-visibility: hidden;
          box-shadow: 0 8px 18px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.05);
        }
        .archivo-back {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          transform: rotateY(180deg);
          background: #e9e6dd;
          box-shadow: inset 0 0 44px rgba(60,40,20,.14);
        }
        .archivo-back::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,.06), transparent 55%);
        }
        /* "ampliar" badge over the exposed inside page — hidden until the book is
           open (it lives above the sumario plane; pointer-events off so the click
           falls through to the book button). */
        .archivo-hint {
          position: absolute; right: 7px; bottom: 7px;
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 999px;
          background: rgba(250, 248, 243, 0.92);
          color: var(--color-ink-soft, #4a4036);
          box-shadow: 0 2px 8px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.04);
          opacity: 0; transform: translateZ(1px) scale(0.8);
          transition: opacity var(--dur, 520ms) ease-out,
                      transform var(--dur, 520ms) ease-out;
          pointer-events: none;
        }
        .archivo-book:focus-visible {
          outline: 2px solid var(--color-burgundy, #7a1f2b);
          outline-offset: 4px;
          border-radius: 2px;
        }
        @media (hover: hover) {
          /* OPEN (hover): overshoot easing so the cover snaps a touch past its
             resting angle and settles, like a real cover being flipped open. */
          .archivo-book:hover .archivo-cover {
            transform: rotateY(calc(-1 * var(--open, 160deg)));
            transition: transform var(--dur, 520ms) cubic-bezier(0.34, 1.25, 0.5, 1);
          }
          .archivo-book:hover .archivo-cast {
            opacity: 1;
            transform: translateZ(-1px) scaleX(0.34);
            transition: opacity var(--dur, 520ms) cubic-bezier(0.34, 1.25, 0.5, 1),
                        transform var(--dur, 520ms) cubic-bezier(0.34, 1.25, 0.5, 1);
          }
          .archivo-book:hover .archivo-ground {
            opacity: 1;
            transform: scaleX(1);
            transition: opacity var(--dur, 520ms) cubic-bezier(0.34, 1.25, 0.5, 1),
                        transform var(--dur, 520ms) cubic-bezier(0.34, 1.25, 0.5, 1);
          }
          .archivo-book:hover .archivo-hint {
            opacity: 1; transform: translateZ(1px) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .archivo-cover { transition: none; }
          .archivo-book:hover .archivo-cover { transform: none; }
          .archivo-cast { display: none; }
          .archivo-ground { display: none; }
          /* No flip → the inside page never exposes, so the hint would float
             over a closed cover. Hide it; the book is still a button. */
          .archivo-hint { display: none; }
        }
      `}</style>
    </div>
  );
}
