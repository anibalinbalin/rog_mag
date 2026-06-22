"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import type { Epoca } from "@/lib/epocas";

gsap.registerPlugin(useGSAP, ScrollTrigger, MotionPathPlugin, DrawSVGPlugin);

/* ─────────────────────────────────────────────────────────
 * TEST PAGE — CodePen "Scroll Map, Split-Screen & Expandable"
 * (creativeocean / myOVZYO) ported to the 80 Años content, with
 * the real anniversary hero on the right.
 *
 *   A 50/50 split: the left panel is pinned while the hero + épocas
 *   scroll on the right. A dot rides a serpentine "80-year route"
 *   (1946 → 2026) as you scroll; a POV camera follows the dot so the
 *   current year stays centred; the route inks in (DrawSVG); and
 *   EXPANDIR blows the panel to full width, zooming out to the whole
 *   route.
 * ───────────────────────────────────────────────────────── */

const VB = 1500; // square viewBox
const CX = 750; // centre column
const TOP = 240; // y of the first station
const GAP = 340; // vertical distance between stations
const AMP = 200; // horizontal sweep of the serpentine

interface Hero {
  title: string;
  yearsLabel: string;
  lede: string;
  intro: string;
}

function stations(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    x: CX + AMP * Math.sin(i * 1.05),
    y: TOP + i * GAP,
  }));
}

/** Catmull-Rom → cubic bézier: a smooth route through the stations. */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  const f = (v: number) => v.toFixed(1);
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
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

export default function ScrollMapClient({ epocas, hero }: { epocas: Epoca[]; hero: Hero }) {
  const root = useRef<HTMLDivElement>(null);
  const pts = stations(epocas.length);
  const d = smoothPath(pts);

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
      // right. Stations aren't evenly spaced along the path (the serpentine's
      // curves add length unevenly), so remap the ride with a custom ease that
      // routes each even step of progress through that station's true path
      // fraction.
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

      // Pin the map across the whole section (hero + épocas).
      ScrollTrigger.create({ trigger: section, start: "top top", end: "bottom bottom", pin: map });

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
          scrollTrigger: { trigger: first, start: "center center", endTrigger: last, end: "center center", scrub: 1 },
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
      <section id="scrollmap" className="relative w-full">
        {/* Left — pinned "map" panel with the 80-year route */}
        <div className="map absolute left-0 top-0 z-50 h-screen w-1/2 overflow-hidden border-r border-line bg-paper-warm">
          <svg className="h-full w-full" viewBox={`0 0 ${VB} ${VB}`} preserveAspectRatio="xMidYMid slice" fill="none">
            <g className="pov">
              <g strokeLinecap="round" strokeLinejoin="round">
                {/* faint full track + burgundy route that inks in */}
                <path className="route-bg" d={d} stroke="#c9c8c4" strokeWidth={5} />
                <path className="route" d={d} stroke="#7a1738" strokeWidth={7} />

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

          {/* corner label so the panel reads as a "journey" */}
          <div className="pointer-events-none absolute left-6 top-6 font-serif text-sm uppercase tracking-[0.2em] text-burgundy">
            1946 — 2026
          </div>
        </div>

        {/* Right — the anniversary hero, then the épocas scroll past */}
        <div className="info relative ml-[50%] w-[44%] px-[3%] pt-[20vh] pb-[64vh] text-ink-muted">
          <header className="mb-[20vh] text-center">
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
          </header>

          {epocas.map((epoca) => (
            <article key={epoca.slug} className="epoca-block flex min-h-[78vh] flex-col justify-center border-t border-line py-12">
              <p className="font-serif text-6xl font-bold leading-none tabular-nums text-burgundy sm:text-7xl">
                {epoca.startYear}
              </p>
              {epoca.director.trim() !== "" && (
                <p className="mt-4 text-sm italic leading-relaxed text-ink-muted">
                  {epoca.director.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < epoca.director.split("\n").length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
              )}
              {epoca.detail.trim() !== "" && (
                <div className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">{renderDetail(epoca.detail)}</div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
