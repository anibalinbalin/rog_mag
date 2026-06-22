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
const AMP = 220; // horizontal sweep of the serpentine

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
  const pathHeight = Math.max(1, (epocas.length - 1) * GAP);

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
      const expandBtn = r.querySelector<HTMLButtonElement>(".expand-map");
      const closeBtn = r.querySelector<HTMLButtonElement>(".close-map");
      if (!map || !pov || !povg || !dot || !route || !section) return;

      let expanded = false;
      const xTo = gsap.quickTo(povg, "x", { duration: 1, ease: "expo" });
      const yTo = gsap.quickTo(povg, "y", { duration: 1, ease: "expo" });

      // Pin the camera's scale pivot to the SVG origin (the dot's post-translate
      // position), NOT the content bbox centre — otherwise a tall route scales
      // about a point far down and the framing drifts as it zooms.
      gsap.set(pov, { svgOrigin: "0 0" });

      // ── The scroll-driven ride ───────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "0 0", end: "100% 100%", pin: map, scrub: 1 },
        onUpdate: () => {
          if (expanded) return;
          xTo(-(gsap.getProperty(dot, "x") as number));
          yTo(-(gsap.getProperty(dot, "y") as number));
        },
      })
        .to(dot, { motionPath: { path: route }, immediateRender: true, ease: "none" }, 0)
        .from(route, { drawSVG: "0 0", ease: "none" }, 0)
        // a gentle zoom "breathe" across the ride (subtle, calm)
        .fromTo(pov, { x: 750, y: 750, scale: 2 }, { scale: 2.18, ease: "sine.inOut", duration: 0.15, yoyo: true, repeat: 1, repeatDelay: 0.2 }, 0);

      // centre the camera on the dot's starting point
      gsap.set(povg, {
        x: -(gsap.getProperty(dot, "x") as number),
        y: -(gsap.getProperty(dot, "y") as number),
      });

      // ── Expand / collapse ────────────────────────────────
      const fitScale = VB / (pathHeight + 560); // zoom out to fit the whole route
      const fitGY = -(TOP + pathHeight / 2);

      const onExpand = () => {
        if (expanded) return;
        expanded = true;
        document.documentElement.style.overflow = "hidden";
        gsap
          .timeline({ defaults: { duration: 0.85, ease: "power3.inOut" } })
          .to(map, { width: "100%", maxWidth: "100%" }, 0)
          .to(tl, { progress: 1 }, 0)
          .to(pov, { scale: fitScale, x: 750, y: 750 }, 0)
          .to(povg, { x: -CX, y: fitGY }, 0)
          .to(closeBtn, { autoAlpha: 1, duration: 0.3 }, 0.4);
      };
      const onClose = () => {
        gsap
          .timeline({ defaults: { duration: 0.8, ease: "power3.inOut" } })
          .to(closeBtn, { autoAlpha: 0, duration: 0.2 }, 0)
          .to(map, { width: "50%", maxWidth: "50%" }, 0)
          .to(pov, { scale: 2, x: 750, y: 750 }, 0)
          .to(povg, { x: -(gsap.getProperty(dot, "x") as number), y: -(gsap.getProperty(dot, "y") as number) }, 0)
          .add(() => {
            document.documentElement.style.overflow = "";
            expanded = false;
            ScrollTrigger.refresh();
          });
      };

      expandBtn?.addEventListener("click", onExpand);
      closeBtn?.addEventListener("click", onClose);
      return () => {
        expandBtn?.removeEventListener("click", onExpand);
        closeBtn?.removeEventListener("click", onClose);
      };
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
                <path className="route-bg" d={d} stroke="#c9c8c4" strokeWidth={4} />
                <path className="route" d={d} stroke="#7a1738" strokeWidth={6} />

                {/* stations: a ring + the year, the current one rides under the dot */}
                {pts.map((p, i) => (
                  <g key={epocas[i].slug}>
                    <circle cx={p.x} cy={p.y} r={9} fill="#f0efe9" stroke="#7a1738" strokeWidth={3} />
                    <text
                      x={p.x}
                      y={p.y - 34}
                      textAnchor="middle"
                      fill="#191919"
                      style={{ fontFamily: "var(--font-crimson), Georgia, serif", fontWeight: 600 }}
                      fontSize={62}
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
        <div className="info relative ml-[50%] w-[44%] px-[3%] py-[20vh] text-ink-muted">
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
            <article key={epoca.slug} className="flex min-h-[78vh] flex-col justify-center border-t border-line py-12">
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

          <div className="border-t border-line pt-12">
            <button className="expand-map inline-flex items-center gap-2 rounded-sm border border-burgundy bg-burgundy px-6 py-3 font-serif text-lg text-white transition-transform active:scale-[0.97]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="m11.39 15.18-4.97 4.97 1.76 1.66c.81.81.24 2.19-.91 2.19H1.28C.57 24 0 23.42 0 22.71v-6a1.28 1.28 0 0 1 2.19-.91l1.66 1.77 4.97-4.97a.86.86 0 0 1 1.21 0l1.36 1.36c.33.33.33.88 0 1.21Zm1.22-6.36 4.97-4.97-1.76-1.66A1.28 1.28 0 0 1 16.73 0h6c.71 0 1.28.58 1.28 1.29v6a1.28 1.28 0 0 1-2.19.91l-1.66-1.77-4.97 4.97a.86.86 0 0 1-1.21 0l-1.36-1.36a.86.86 0 0 1 0-1.21Z" />
              </svg>
              EXPANDIR MAPA
            </button>
          </div>
        </div>
      </section>

      {/* fullscreen close button (hidden until expanded) */}
      <button
        className="close-map fixed bottom-5 right-5 z-[200] rounded-full border border-line bg-paper p-3 text-burgundy opacity-0 shadow-[0_2px_10px_rgba(25,25,25,0.15)]"
        aria-label="Cerrar mapa"
      >
        <svg width={26} viewBox="0 0 24 24" className="fill-current">
          <path d="M20.58.33a1.1 1.1 0 0 1 1.59 0l1.5 1.5c.44.44.44 1.15 0 1.59L19.59 7.5l1.83 1.83a1.13 1.13 0 0 1-.8 1.93h-6.75c-.62 0-1.12-.5-1.12-1.12V3.38a1.12 1.12 0 0 1 1.92-.8l1.83 1.83zM3.37 12.75h6.75c.62 0 1.12.5 1.12 1.12v6.75a1.12 1.12 0 0 1-1.92.8l-1.83-1.83-4.08 4.08c-.44.44-1.15.44-1.59 0l-1.5-1.5a1.1 1.1 0 0 1 0-1.59L4.4 16.5l-1.83-1.83a1.1 1.1 0 0 1-.24-1.23c.17-.42.58-.7 1.04-.7Z" />
        </svg>
      </button>
    </div>
  );
}
