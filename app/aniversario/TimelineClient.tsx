"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Epoca } from "@/lib/epocas";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ─────────────────────────────────────────────────────────
 * TIMELINE STORYBOARD — "Directional + depth"  (gated by prefers-reduced-motion)
 *
 *   while scrolling  the burgundy spine fills top→bottom (scaleY, scrub)
 *   per row          the director card flies in from the left and the detail
 *                    card from the right, on that row's own scroll progress
 *   per year         a slight parallax-drift (yPercent) gives depth
 *   at the centre     the year nearest the viewport centre becomes the hero —
 *      line          it inks, scales up, and weights to semibold; exactly ONE
 *                    at a time, so 1946 hands the spotlight off as you descend
 * ───────────────────────────────────────────────────────── */

const SCRUB = 0.6; // seconds of scroll catch-up (smoothing)
const SPINE = { start: "top 72%", end: "bottom 60%" } as const;
const CARDS = { throw: 96, start: "top 92%", end: "top 50%", ease: "power3.out" } as const;
const YEARS = {
  drift: 14, // yPercent parallax range
  pop: 1.45, // hero scale
  on: "#191919", // ink
  off: "#9b9b9b", // faint
  duration: 0.4,
  ease: "power3.out",
} as const;

/** Renders inline content: **bold** spans and single newlines as <br>. */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) => {
    if (/^\*\*[^*]+\*\*$/.test(chunk)) {
      return (
        <strong key={i} className="font-semibold text-ink-soft">
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    const lines = chunk.split("\n");
    return lines.map((line, li) => (
      <span key={`${i}-${li}`}>
        {line}
        {li < lines.length - 1 ? <br /> : null}
      </span>
    ));
  });
}

/** Detail card body: paragraphs are blank-line separated. */
function renderDetail(text: string) {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((para, i) => (
      <p key={i} className={i > 0 ? "mt-4" : undefined}>
        {renderInline(para)}
      </p>
    ));
}

/** Director card: one source line per visual line, italic. */
function renderDirector(text: string) {
  const lines = text.trim().split("\n").filter(Boolean);
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

export default function TimelineClient({ epocas }: { epocas: Epoca[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      // Reduced motion: no movement. 1946 stays the static anchor so the
      // section still reads as anchored to the founding year.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const founding = root.querySelector(".epoca-year[data-founding]");
        gsap.set(founding, { color: YEARS.on, scale: 1.3, fontWeight: 600, transformOrigin: "center" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = q(".epoca-row");
        const years = q(".epoca-year");
        const fill = root.querySelector<HTMLElement>(".epoca-spine-fill");

        // 1) Burgundy spine fills top→bottom as you scroll.
        if (fill) {
          gsap.set(fill, { transformOrigin: "top" });
          gsap.fromTo(
            fill,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: { trigger: root, start: SPINE.start, end: SPINE.end, scrub: SCRUB },
            }
          );
        }

        // 2) Cards fly in from their side, driven by each row's scroll progress.
        rows.forEach((row) => {
          const dir = row.querySelector<HTMLElement>(".epoca-director");
          const det = row.querySelector<HTMLElement>(".epoca-detail");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: row, start: CARDS.start, end: CARDS.end, scrub: SCRUB },
          });
          if (dir) tl.fromTo(dir, { x: -CARDS.throw, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: CARDS.ease }, 0);
          if (det) tl.fromTo(det, { x: CARDS.throw, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: CARDS.ease }, 0);
        });

        // 3) Years parallax-drift for depth as their row passes through.
        years.forEach((year) => {
          gsap.fromTo(
            year,
            { yPercent: YEARS.drift },
            {
              yPercent: -YEARS.drift,
              ease: "none",
              scrollTrigger: { trigger: year.closest(".epoca-row"), start: "top bottom", end: "bottom top", scrub: SCRUB },
            }
          );
        });

        // 4) Hero focus — exactly ONE year at a time. Each scroll tick we find
        //    the on-screen year closest to the viewport centre and promote it
        //    (ink + scale + semibold), demoting the previous. Prominence rides
        //    the scroll; no two years ever co-star.
        let active = -1;
        const rest = (el: Element) =>
          gsap.to(el, { color: YEARS.off, scale: 1, fontWeight: 400, duration: YEARS.duration, ease: YEARS.ease, overwrite: "auto" });
        const hero = (el: Element) =>
          gsap.to(el, { color: YEARS.on, scale: YEARS.pop, fontWeight: 600, duration: YEARS.duration, ease: YEARS.ease, overwrite: "auto" });

        const setActive = (idx: number) => {
          if (idx === active) return;
          if (active >= 0 && years[active]) rest(years[active]);
          if (idx >= 0 && years[idx]) hero(years[idx]);
          active = idx;
        };

        const update = () => {
          const centre = window.innerHeight / 2;
          let best = -1;
          let bestDist = Infinity;
          years.forEach((year, i) => {
            const r = year.getBoundingClientRect();
            const yc = r.top + r.height / 2;
            if (yc < 0 || yc > window.innerHeight) return; // off-screen years don't compete
            const d = Math.abs(yc - centre);
            if (d < bestDist) {
              bestDist = d;
              best = i;
            }
          });
          setActive(best);
        };

        ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onUpdate: update, onRefresh: update });
        update();
      });
    },
    { scope: rootRef }
  );

  if (epocas.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      {/* Chronology spine — centre channel, desktop only. A faint track with a
          burgundy fill that grows as you scroll. Inset so it runs between the
          first and last station rather than into the padding. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-12 bottom-12 hidden -translate-x-1/2 sm:block"
      >
        <div className="epoca-spine-track absolute inset-0 border-l-2 border-burgundy/15" />
        <div className="epoca-spine-fill absolute inset-0 border-l-2 border-burgundy" />
      </div>

      {epocas.map((epoca, index) => {
        const isFounding = index === 0;
        const showDirector = epoca.director.trim() !== "";
        const showDetail = epoca.detail.trim() !== "";

        return (
          <div
            key={epoca.slug}
            className="epoca-row relative grid min-h-[150px] items-center gap-y-3 py-6 sm:grid-cols-[1fr_120px_1fr] sm:gap-x-6 sm:py-8"
          >
            {/* Connectors — hairline from the node out to each card (desktop). */}
            {showDirector && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-1/2 top-1/2 z-0 hidden h-px w-[84px] -translate-y-1/2 bg-line-dark sm:block"
              />
            )}
            {showDetail && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 hidden h-px w-[84px] -translate-y-1/2 bg-line-dark sm:block"
              />
            )}

            {/* Left — director card */}
            <div className="order-2 text-center sm:order-none sm:justify-self-end sm:text-right">
              {showDirector && (
                <p className="epoca-director relative z-10 inline-block rounded-sm border border-line bg-paper px-5 py-3 text-sm italic leading-relaxed text-ink-muted shadow-[0_1px_2px_rgba(25,25,25,0.05)]">
                  {renderDirector(epoca.director)}
                </p>
              )}
            </div>

            {/* Centre — the year, centred on the spine (the station). All years
                rest equal; the one nearest the viewport centre becomes the hero. */}
            <div className="relative order-1 flex h-full items-center justify-center sm:order-none">
              <span
                data-founding={isFounding ? "" : undefined}
                className="epoca-year relative z-10 bg-paper-warm px-3 font-serif text-4xl font-normal leading-none tabular-nums text-ink-faint"
              >
                {epoca.startYear}
              </span>
            </div>

            {/* Right — detail card */}
            <div className="order-3 text-center sm:order-none sm:justify-self-start sm:text-left">
              {showDetail && (
                <div className="epoca-detail relative z-10 rounded-sm border border-line bg-paper px-5 py-4 text-sm leading-relaxed text-ink-muted shadow-[0_1px_2px_rgba(25,25,25,0.05)]">
                  {renderDetail(epoca.detail)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
