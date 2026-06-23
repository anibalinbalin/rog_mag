"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import type { Epoca } from "@/lib/epocas";

gsap.registerPlugin(useGSAP, ScrollTrigger, MotionPathPlugin, DrawSVGPlugin);

/* ─────────────────────────────────────────────────────────
 * 80 Años scroll-map — CodePen "Scroll Map, Split-Screen &
 * Expandable" (creativeocean / myOVZYO) ported to the épocas.
 *
 *   A 1/3 ⁄ 2/3 split: the left map panel is pinned while the hero +
 *   épocas scroll on the right. A dot rides a straight "80-year route"
 *   (1946 → 2026) as you scroll; a POV camera follows the dot so the
 *   current year stays centred; and the route inks in (DrawSVG).
 * ───────────────────────────────────────────────────────── */

const VB = 1500; // square viewBox
const CX = 750; // centre column
const TOP = 240; // y of the first station
const GAP = 340; // vertical distance between stations

interface Hero {
  title: string;
  yearsLabel: string;
  lede: string;
  intro: string;
}

// Stations march straight down the centre column — a plain vertical timeline.
function stations(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    x: CX,
    y: TOP + i * GAP,
  }));
}

/** A straight vertical line from the first station to the last. */
function linePath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  const f = (v: number) => v.toFixed(1);
  const a = pts[0];
  const b = pts[pts.length - 1];
  return `M ${f(a.x)} ${f(a.y)} L ${f(b.x)} ${f(b.y)}`;
}

/** Title: break onto two lines at " y de la Empresa", like /80-años. */
function renderTitle(title: string) {
  const marker = " y de la Empresa";
  const idx = title.indexOf(marker);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <br />
      {title.slice(idx + 1)}
    </>
  );
}

/** Intro: emphasize the founder and the original journal title. */
function renderIntro(intro: string) {
  const SPLIT = /(Sagunto Pérez Fontana|Revista de Derecho Comercial\s*[–—-]\s*Sociedades Anónimas)/g;
  const MATCH = /^(Sagunto Pérez Fontana|Revista de Derecho Comercial\s*[–—-]\s*Sociedades Anónimas)$/;
  return intro.split(SPLIT).map((part, i) =>
    MATCH.test(part) ? (
      <strong key={i} className="font-semibold text-ink-soft">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/** Detail body: blank-line paragraphs, **bold** spans. */
function renderDetail(text: string) {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((para, i) => (
      <p key={i} className={i ? "mt-3" : ""}>
        {para.split(/(\*\*[^*]+\*\*)/g).map((c, j) =>
          /^\*\*[^*]+\*\*$/.test(c) ? (
            <strong key={j} className="font-semibold text-ink-soft">
              {c.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{c}</span>
          )
        )}
      </p>
    ));
}

export default function ScrollMapClient({
  epocas,
  hero,
  embedded = false,
}: {
  epocas: Epoca[];
  /** Optional — the full anniversary hero on the right column. Omitted (or with
   *  `embedded`) the right column leads with a slim section intro instead, so the
   *  map can sit inside a page that already has its own hero (e.g. /80-años). */
  hero?: Hero;
  embedded?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pts = stations(epocas.length);
  const d = linePath(pts);

  useGSAP(
    () => {
      const r = root.current;
      if (!r || epocas.length === 0) return;

      const map = r.querySelector<HTMLElement>(".map");
      const pov = r.querySelector<SVGGElement>(".pov");
      const povg = r.querySelector<SVGGElement>(".pov > g");
      const dot = r.querySelector<SVGCircleElement>(".dot");
      const route = r.querySelector<SVGPathElement>(".route");
      const section = r.querySelector<HTMLElement>("#scrollmap");
      if (!map || !pov || !povg || !dot || !route || !section) return;

      const yTo = gsap.quickTo(povg, "y", { duration: 1, ease: "expo" });

      // Zoom arc bounds + dive timing (wide → close → wide).
      const POV_SCALE = 2.0; // close ride
      const WIDE_SCALE = 0.7; // establishing / closing shot

      // ── Sync map ↔ content ───────────────────────────────
      // The dot must sit on a station exactly when that época is centred on the
      // right. On the straight route the stations are evenly spaced, so this
      // remap is effectively linear — kept (rather than a bare linear ease) so
      // the alignment stays exact if the station spacing ever changes.
      const blocks = Array.from(r.querySelectorAll<HTMLElement>(".epoca-block"));
      const first = blocks[0];
      const last = blocks[blocks.length - 1];
      if (!first || !last) return;
      const N = pts.length;
      const pathHeight = (N - 1) * GAP;
      const routeCenterY = TOP + pathHeight / 2;
      const fitScale = 1240 / pathHeight; // zoom out far enough to frame the whole route
      const L = route.getTotalLength();
      const SAMPLES = 700;
      const frac = pts.map((s) => {
        let bestLen = 0;
        let bestD = Infinity;
        for (let k = 0; k <= SAMPLES; k++) {
          const len = (k / SAMPLES) * L;
          const pt = route.getPointAtLength(len);
          const dd = (pt.x - s.x) ** 2 + (pt.y - s.y) ** 2;
          if (dd < bestD) {
            bestD = dd;
            bestLen = len;
          }
        }
        return bestLen / L;
      });
      const rideEase = (t: number) => {
        const ci = t * (N - 1);
        const i = Math.min(N - 2, Math.max(0, Math.floor(ci)));
        return frac[i] + (frac[i + 1] - frac[i]) * (ci - i);
      };

      // Pin the camera's scale pivot to the SVG origin so the tall route scales
      // about the dot, not its bbox centre (which would drift the framing).
      gsap.set(pov, { svgOrigin: "0 0", x: 750, y: 750, scale: WIDE_SCALE });

      // Pin the map across the whole section (hero + épocas). Embedded inside a
      // page wrapped by a transformed ancestor (e.g. /80-años's Silk depth
      // shell, whose outlet has will-change:transform), a position:fixed pin is
      // positioned relative to THAT ancestor, not the viewport, and drifts off
      // screen — so pin by transform there. Standalone keeps the cheaper fixed pin.
      const pinType: "fixed" | "transform" = embedded ? "transform" : "fixed";
      ScrollTrigger.create({ trigger: section, start: "top top", end: "bottom bottom", pin: map, pinType });

      // The "1946 — 2026" corner caption is a header for the rail at rest. Once
      // you scroll and the year stations start riding, it collides with them —
      // so fade it out over the first screen of scroll. Reversible: scrub fades
      // it back in at the top.
      const mapLabel = r.querySelector<HTMLElement>(".map-label");
      if (mapLabel) {
        gsap.to(mapLabel, {
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + window.innerHeight * 0.6, scrub: true },
        });
      }

      // ── Zoom arc ─────────────────────────────────────────
      // Dive from WIDE to POV as you scroll the hero and ARRIVE on 1946 (the
      // founding year) — not somewhere between 1946 and 1971. Hold close through
      // the journey, then at the very end pull all the way out to frame the
      // WHOLE map. Separate triggers (the dive needs to start before the ride
      // does), as real tweens since a quickTo on scale doesn't cooperate with
      // svgOrigin.
      gsap.fromTo(
        pov,
        { scale: WIDE_SCALE },
        {
          scale: POV_SCALE,
          ease: "power2.inOut",
          scrollTrigger: { trigger: section, start: "top top", endTrigger: first, end: "center center", scrub: 1 },
        }
      );
      // Final stage: zoom out to the fit scale (real tween — a quickTo on scale
      // doesn't cooperate with svgOrigin)…
      gsap.fromTo(
        pov,
        { scale: POV_SCALE },
        {
          scale: fitScale,
          ease: "power2.inOut",
          immediateRender: false,
          scrollTrigger: { trigger: last, start: "center center", endTrigger: section, end: "bottom bottom", scrub: 1 },
        }
      );
      // (the camera recentre that pairs with this zoom-out is driven by the
      // single povg.y controller below.)

      // ── The scroll-driven ride ───────────────────────────
      // Scrubbed across "first época centred → last época centred", so progress
      // == which época is centred. Dot + route inking use the remap ease so each
      // station lands when its época is centred.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: first,
            start: "center center",
            endTrigger: last,
            end: "center center",
            scrub: 1,
            // ── Magnet snap ──────────────────────────────────
            // Settle the dot onto a year when scrolling pauses; a deliberate
            // scroll moves on. snapTo increments of 1/(N-1) == each station
            // (progress is remapped so station i is centred at i/(N-1), so the
            // content centres on that year too). Confined to the year ride —
            // the opening dive and final pull-out are separate triggers, so they
            // stay free-scroll. Tuned in the magnet playground.
            snap: {
              snapTo: 1 / (N - 1),
              duration: { min: 0.29, max: 0.59 },
              ease: "expo.out",
              directional: true,
              delay: 0.08,
            },
          },
        })
        .to(dot, { motionPath: { path: route }, immediateRender: true, ease: rideEase, duration: 1 }, 0)
        .from(route, { drawSVG: "0 0", ease: rideEase, duration: 1 }, 0);

      // ── Camera height: ONE controller for povg.y ─────────
      // A single trigger spanning the whole ride so nothing else fights over
      // povg.y. While riding it follows the dot's height; once the last época
      // scrolls past centre it blends up to the route's middle, so the final
      // zoomed-out stage frames every year (1946 → 2026) of the inked route.
      ScrollTrigger.create({
        trigger: first,
        start: "center center",
        endTrigger: section,
        end: "bottom bottom",
        onUpdate: () => {
          const dy = gsap.getProperty(dot, "y") as number;
          const lr = last.getBoundingClientRect();
          const overshoot = window.innerHeight / 2 - (lr.top + lr.height / 2);
          const blend = Math.min(1, Math.max(0, overshoot / (window.innerHeight * 0.5)));
          const be = blend * blend * (3 - 2 * blend);
          yTo(-(dy + (routeCenterY - dy) * be));
        },
      });

      // ── Keep the final época framed while the camera pulls out ──
      // The left zooms out over "last centred → section bottom"; without this
      // the right column would scroll the last época (2024) up and away, leaving
      // empty space. Pin only the last block's INNER content (pinSpacing:false so
      // the article box itself keeps scrolling — the camera-recenter above reads
      // its live rect). End far past the bottom so it never un-pins on screen; it
      // pins exactly where the content already sits (no jump) and holds 2024
      // centred through the whole zoom-out.
      const lastInner = last.querySelector<HTMLElement>(".epoca-inner");
      if (lastInner) {
        ScrollTrigger.create({
          trigger: last,
          start: "center center",
          // Standalone: end far past the bottom so 2024 never un-pins on screen
          // (there's nothing below it). Embedded: end exactly at the section
          // bottom so 2024 releases WITH the map and the footer follows cleanly —
          // otherwise the held content floats on over the footer.
          ...(embedded
            ? { endTrigger: section, end: "bottom bottom" }
            : { end: () => "+=" + Math.round(window.innerHeight * 4) }),
          pin: lastInner,
          pinSpacing: false,
          pinType,
        });
      }

      // centre the route horizontally; start panned to the first station
      gsap.set(povg, { x: -CX, y: -(gsap.getProperty(dot, "y") as number) });
    },
    { scope: root, dependencies: [] }
  );

  if (epocas.length === 0) {
    return <p className="p-12 text-ink-muted">No hay épocas para mostrar.</p>;
  }

  return (
    <div ref={root} className="bg-paper">
      <section id="scrollmap" className="relative mx-auto w-full max-w-[1280px]">
        {/* Left — pinned "map" panel with the 80-year route. Embedded inside a
            page with a sticky h-24 navbar (z-50), the full-height panel would
            cover the navbar's left half — so inset it below the navbar there and
            sit under it (z-40). Standalone keeps the full-bleed h-screen panel. */}
        <div
          className={`map absolute left-0 w-1/5 overflow-hidden border-r border-line bg-paper-warm ${
            embedded ? "top-24 z-40 h-[calc(100svh-6rem)]" : "top-0 z-50 h-screen"
          }`}
        >
          <svg className="h-full w-full" viewBox={`0 0 ${VB} ${VB}`} preserveAspectRatio="xMidYMid slice" fill="none">
            <g className="pov">
              <g strokeLinecap="round" strokeLinejoin="round">
                {/* faint full track + burgundy route that inks in */}
                <path className="route-bg" d={d} stroke="#c9c8c4" strokeWidth={3} />
                <path className="route" d={d} stroke="#7a1738" strokeWidth={4} />

                {/* stations: a ring + the year. The year carries a paper-coloured
                    halo (paint-order: stroke) so the route threads cleanly behind
                    the numerals instead of slicing through them — a cartographic
                    label casing in the panel's own background colour. */}
                {pts.map((p, i) => (
                  <g key={epocas[i].slug}>
                    <circle cx={p.x} cy={p.y} r={9} fill="#f0efe9" stroke="#7a1738" strokeWidth={3} />
                    <text
                      x={p.x}
                      y={p.y - 32}
                      textAnchor="middle"
                      fill="#191919"
                      stroke="#f0efe9"
                      strokeWidth={14}
                      strokeLinejoin="round"
                      paintOrder="stroke"
                      style={{ fontFamily: "var(--font-crimson), Georgia, serif", fontWeight: 600 }}
                      fontSize={54}
                    >
                      {epocas[i].startYear}
                    </text>
                  </g>
                ))}

                <circle className="dot-start" cx={pts[0].x} cy={pts[0].y} r={9} fill="#7a1738" />
                <circle className="dot" cx={0} cy={0} r={13} fill="#7a1738" stroke="#fff" strokeWidth={4} />
              </g>
            </g>
          </svg>

          {/* corner label so the panel reads as a "journey" — fades out once the
              year stations start riding (see the fade tween in useGSAP). */}
          <div className="map-label pointer-events-none absolute left-6 top-6 font-serif text-sm uppercase tracking-[0.2em] text-burgundy">
            1946 — 2026
          </div>
        </div>

        {/* Right — the anniversary hero (or a slim section intro when embedded),
            then the épocas scroll past. The header height is the runway the
            opening dive zooms across, so keep it tall either way. */}
        <div
          className={`info relative ml-[22%] w-[78%] pl-[3%] pr-4 pt-[20vh] text-ink-muted sm:pr-6 ${
            embedded ? "pb-[40vh]" : "pb-[64vh]"
          }`}
        >
          <header className="mb-[20vh] text-center">
            {embedded || !hero ? (
              <div className="pt-[6vh]">
                <p className="font-serif text-2xl font-semibold italic text-ink sm:text-3xl">
                  Seis épocas de historia en ocho décadas
                </p>
                <p className="mt-5 text-xs uppercase tracking-[0.25em] text-burgundy">1946 — 2026</p>
              </div>
            ) : (
              <>
                {/* Title + years, with the decorative ghost "80" hugging them */}
                <div className="relative isolate">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-[56%] select-none font-serif text-[15rem] italic leading-none text-paper-gray/70 sm:text-[20rem]"
                  >
                    80
                  </span>

                  <h1 className="font-serif text-3xl font-bold leading-[1.1] text-ink sm:text-4xl">
                    {renderTitle(hero.title)}
                  </h1>
                  <p className="mt-4 font-serif text-xl font-semibold italic text-ink sm:text-2xl">
                    {hero.yearsLabel}
                  </p>
                </div>

                <p className="mx-auto mt-16 max-w-md font-serif text-lg font-semibold leading-relaxed text-ink sm:text-xl">
                  {hero.lede}
                </p>

                <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-ink-muted">
                  {renderIntro(hero.intro)}
                </p>
              </>
            )}
          </header>

          {epocas.map((epoca) => (
            <article key={epoca.slug} className="epoca-block flex min-h-[78vh] flex-col justify-center border-t border-line py-12">
              <div className="epoca-inner">
                {/* Image(s) on top — generous, using the room — then the text
                    below. The year is intentionally omitted: it already labels
                    this station on the map, so repeating it here was redundant. */}
                <div className="flex w-full flex-wrap items-end gap-5">
                  {epoca.photos.length > 0 ? (
                    epoca.photos.map((photo) => {
                      const [w, h] = photo.aspect.split("/").map(Number);
                      const landscape = !(w && h) || w >= h;
                      return (
                        <figure
                          key={photo.src}
                          // The image row spans the full content width (out to the
                          // Suscribirme button's line). Landscape fills it; two
                          // portraits share it evenly, so together they match a
                          // landscape's width.
                          className={landscape ? "w-full" : "min-w-0 flex-1 basis-0"}
                        >
                          <div
                            className="relative overflow-hidden rounded-sm border border-line bg-paper-cream"
                            style={{ aspectRatio: photo.aspect }}
                          >
                            <Image
                              src={photo.src}
                              alt={photo.alt}
                              fill
                              sizes={landscape ? "(min-width: 640px) 42rem, 90vw" : "(min-width: 640px) 21rem, 45vw"}
                              className={`object-cover ${landscape ? "object-center" : "object-top"}`}
                            />
                          </div>
                          {photo.name && (
                            <figcaption className="mt-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink-muted">
                              {photo.name}
                            </figcaption>
                          )}
                        </figure>
                      );
                    })
                  ) : (
                    <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-sm border border-dashed border-line bg-paper-cream">
                      <div className="flex flex-col items-center gap-2 text-ink-muted/70">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="9" cy="9" r="1.6" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                        <span className="text-[0.7rem] uppercase tracking-[0.2em]">Imagen</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text below the image(s). */}
                <div className="mt-6 max-w-2xl">
                  {epoca.director.trim() !== "" && (
                    <p className="text-sm italic leading-relaxed text-ink-muted">
                      {epoca.director.split("\n").map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < epoca.director.split("\n").length - 1 ? <br /> : null}
                        </span>
                      ))}
                    </p>
                  )}
                  {epoca.detail.trim() !== "" && (
                    <div className="mt-4 text-base leading-relaxed text-ink-soft">{renderDetail(epoca.detail)}</div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
