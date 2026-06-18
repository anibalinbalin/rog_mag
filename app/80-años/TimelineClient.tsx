"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Epoca } from "@/lib/epocas";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ─────────────────────────────────────────────────────────
 * TIMELINE STORYBOARD  (all motion gated by prefers-reduced-motion)
 *
 *   on scroll-in   each row fades up (y 16→0) once, staggered — the
 *                  history assembles as you descend
 *   while scrolling the dashed spine draws top→bottom (clip-path, scrub)
 *   at viewport     the year nearest centre turns ink + grows slightly;
 *      centre       the others rest in gray — a moving "you are here"
 * ───────────────────────────────────────────────────────── */

const REVEAL = { duration: 0.6, ease: "power2.out", stagger: 0.12 };
const ACTIVE = { on: "#191919", off: "#9b9b9b", scale: 1.05, duration: 0.3 };

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
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = q(".epoca-row");

        // 1) Rows fade up, once, as each enters the viewport.
        gsap.set(rows, { opacity: 0, y: 16 });
        ScrollTrigger.batch(rows, {
          start: "top 85%",
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, overwrite: true, ...REVEAL }),
        });

        // 2) Dashed spine draws top→bottom (clip-path reveals the dashes).
        if (lineRef.current) {
          gsap.fromTo(
            lineRef.current,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0 0 0% 0)",
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top 70%",
                end: "bottom 65%",
                scrub: true,
              },
            }
          );
        }

        // 3) Active year — the one crossing viewport centre turns ink + grows.
        //    The founding year (data-founding) stays ink permanently.
        q(".epoca-year:not([data-founding])").forEach((year) => {
          ScrollTrigger.create({
            trigger: year,
            start: "top 60%",
            end: "bottom 40%",
            onToggle: (self) =>
              gsap.to(year, {
                color: self.isActive ? ACTIVE.on : ACTIVE.off,
                scale: self.isActive ? ACTIVE.scale : 1,
                duration: ACTIVE.duration,
                overwrite: true,
              }),
          });
        });
      });
    },
    { scope: rootRef }
  );

  if (epocas.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      {/* Dashed chronology spine — centre channel, desktop only. Inset so it
          runs between the first and last station rather than into the padding. */}
      <div
        ref={lineRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-12 bottom-12 hidden -translate-x-1/2 border-l-2 border-dashed border-burgundy/45 sm:block"
      />

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
                <p className="relative z-10 inline-block rounded-sm border border-line bg-paper px-5 py-3 text-sm italic leading-relaxed text-ink-muted shadow-[0_1px_2px_rgba(25,25,25,0.05)]">
                  {renderDirector(epoca.director)}
                </p>
              )}
            </div>

            {/* Centre — the year, centred on the spine (the station) */}
            <div className="relative order-1 flex h-full items-center justify-center sm:order-none">
              <span
                data-founding={isFounding ? "" : undefined}
                className={`epoca-year relative z-10 bg-paper-warm px-3 font-serif tabular-nums leading-none ${
                  isFounding
                    ? "text-5xl font-semibold text-ink sm:text-6xl"
                    : "text-4xl text-ink-faint"
                }`}
              >
                {epoca.startYear}
              </span>
            </div>

            {/* Right — detail card */}
            <div className="order-3 text-center sm:order-none sm:justify-self-start sm:text-left">
              {showDetail && (
                <div className="relative z-10 rounded-sm border border-line bg-paper px-5 py-4 text-sm leading-relaxed text-ink-muted shadow-[0_1px_2px_rgba(25,25,25,0.05)]">
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
