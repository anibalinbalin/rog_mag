"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Epoca } from "@/lib/epocas";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ─────────────────────────────────────────────────────────
 * TIMELINE STORYBOARD — "Directional + focus"  (gated by prefers-reduced-motion)
 *
 *   while scrolling  the burgundy spine fills top→bottom (scaleY, scrub)
 *   per row          the director card flies in from the left and the detail
 *                    card from the right, on that row's own scroll progress
 *   per year         a continuous depth-of-field focus: each year is small and
 *                    faded at rest, and grows + inks + comes to full opacity as
 *                    it approaches the viewport centre, easing back out as it
 *                    recedes. The peak is at the centre, so focus rides the
 *                    scroll smoothly rather than snapping between winners.
 *                    A slight parallax-drift (yPercent) keeps the depth cue.
 * ───────────────────────────────────────────────────────── */

const SCRUB = 0.6; // seconds of scroll catch-up (smoothing)
const SPINE = { start: "top 72%", end: "bottom 60%" } as const;
const CARDS = { throw: 96, start: "top 92%", end: "top 50%", ease: "power3.out" } as const;
const FOCUS = {
  restScale: 0.9, // size when far from centre
  heroScale: 1.45, // size at the centre (peak)
  restOpacity: 0.7, // off-centre years stay a clear, readable grey
  drift: 14, // yPercent parallax range (depth)
  on: "#191919", // ink — at the centre only
  off: "#9b9b9b", // grey — above and below
  growEase: "power2.out", // size expands steadily as it approaches…
  fallEase: "power2.in", // …and eases back as it recedes (plateau at centre)
  inkInEase: "power3.in", // colour holds grey until close, then inks at centre
  inkOutEase: "power3.out", // and drops back to grey quickly as it recedes
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
      // section still reads as anchored to the founding year; the rest stay
      // at full opacity and a single weight, legible and still.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const founding = root.querySelector(".epoca-year[data-founding]");
        gsap.set(founding, { color: FOCUS.on, scale: 1.3, fontWeight: 600, transformOrigin: "center center" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = q(".epoca-row");
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

        rows.forEach((row) => {
          // 2) Cards fly in from their side, driven by each row's scroll progress.
          const dir = row.querySelector<HTMLElement>(".epoca-director");
          const det = row.querySelector<HTMLElement>(".epoca-detail");
          const cards = gsap.timeline({
            scrollTrigger: { trigger: row, start: CARDS.start, end: CARDS.end, scrub: SCRUB },
          });
          if (dir) cards.fromTo(dir, { x: -CARDS.throw, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: CARDS.ease }, 0);
          if (det) cards.fromTo(det, { x: CARDS.throw, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: CARDS.ease }, 0);

          // 3) Year focus — a continuous depth-of-field that peaks at the
          //    viewport centre. The row crosses centre at the timeline's
          //    midpoint, so the year grows + inks + comes to full opacity on
          //    the approach and eases back out as it recedes. Riding scroll
          //    (scrub) means focus is shared smoothly, never snapped.
          const year = row.querySelector<HTMLElement>(".epoca-year");
          if (year) {
            gsap.set(year, { transformOrigin: "center center" });
            const focus = gsap.timeline({
              scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: SCRUB },
            });
            // Size + opacity grow steadily across the approach…
            focus
              .fromTo(
                year,
                { scale: FOCUS.restScale, opacity: FOCUS.restOpacity },
                { scale: FOCUS.heroScale, opacity: 1, ease: FOCUS.growEase, duration: 0.5 },
                0
              )
              .to(
                year,
                { scale: FOCUS.restScale, opacity: FOCUS.restOpacity, ease: FOCUS.fallEase, duration: 0.5 },
                0.5
              )
              // …but the ink is concentrated at the centre, on its own steeper
              // curve: years above and below stay grey, and only the year at the
              // centre darkens to near-black — so the eye lands on one year.
              .fromTo(
                year,
                { color: FOCUS.off },
                { color: FOCUS.on, ease: FOCUS.inkInEase, duration: 0.5 },
                0
              )
              .to(year, { color: FOCUS.off, ease: FOCUS.inkOutEase, duration: 0.5 }, 0.5);

            // …with a slight parallax-drift across the same range for depth.
            gsap.fromTo(
              year,
              { yPercent: FOCUS.drift },
              {
                yPercent: -FOCUS.drift,
                ease: "none",
                scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: SCRUB },
              }
            );
          }
        });
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
