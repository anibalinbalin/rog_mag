"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion } from "motion/react";

/* ─────────────────────────────────────────────────────────────────
 * ZOOM STORYBOARD — minimal "lupa" for a scanned page
 *
 * One control: a zoom slider. Drag it to read closer; the page tracks
 * the slider 1:1 so it feels like direct manipulation, not a stepper.
 * Quiet − / + glyphs flank it for anyone who can't drag precisely.
 *
 *   open    overlay scales 0.985 → 1.0 over the spread (soft, no bounce)
 *   slider  scale follows the thumb continuously, fit (100%) → 320%
 *   − / +   nudge the zoom by one STEP
 *   drag    once zoomed in, the page can be dragged to move around
 *   dbl-tap toggles between fit and a comfortable read size
 * ───────────────────────────────────────────────────────────────── */

/* Overlay panel that covers the sheet with the focused page */
const OVERLAY = {
  initialScale: 0.985, // barely scales in — a settle, not a pop
  spring: { type: "spring" as const, visualDuration: 0.32, bounce: 0 },
};

/* Zoom range — continuous, slider-driven. */
const ZOOM = {
  min: 1, // fit
  max: 3.2, // ~320%
  step: 0.45, // − / + and keyboard nudge
  doubleTap: 2, // double-tap "read" size
  dragElastic: 0.12, // a little give at the pan edges, then settles back
};

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** A focused, minimal zoom viewer for a single scanned page. Covers the sheet;
    "Volver" returns to the tapa/sumario spread, "Cerrar" closes the whole sheet. */
export default function ScanZoom({
  src,
  pageLabel,
  caption,
  onBack,
  onClose,
}: {
  src: string;
  pageLabel: string; // "Tapa" | "Sumario"
  caption: string; // "Sociedades Anónimas · Junio 1946"
  onBack: () => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const overlaySpring = reduce ? { duration: 0 } : OVERLAY.spring;

  const [scale, setScale] = useState(ZOOM.min); // continuous zoom, slider-driven
  const isZoomed = scale > ZOOM.min;
  const pct = ((scale - ZOOM.min) / (ZOOM.max - ZOOM.min)) * 100; // slider fill %

  // Pan offset (driven by drag; clamped to bounds as the zoom changes).
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Measure the page box so drag stays bounded to what's actually off-screen.
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // transform-origin is centre → overflow splits evenly on each side.
  const overX = Math.max(0, ((scale - 1) * box.w) / 2);
  const overY = Math.max(0, ((scale - 1) * box.h) / 2);

  const zoomTo = useCallback(
    (next: number) => {
      const s = Math.min(ZOOM.max, Math.max(ZOOM.min, Math.round(next * 100) / 100));
      setScale(s);
      // keep the current pan inside the new bounds (and recentre at fit)
      const oX = Math.max(0, ((s - 1) * box.w) / 2);
      const oY = Math.max(0, ((s - 1) * box.h) / 2);
      x.set(Math.max(-oX, Math.min(oX, x.get())));
      y.set(Math.max(-oY, Math.min(oY, y.get())));
    },
    [box.w, box.h, x, y]
  );

  // Keyboard: +, −, 0 to fit, Esc to step back to the spread.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomTo(scale + ZOOM.step);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomTo(scale - ZOOM.step);
      } else if (e.key === "0") {
        e.preventDefault();
        zoomTo(ZOOM.min);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onBack();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [zoomTo, scale, onBack]);

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col bg-paper"
      initial={{ opacity: 0, scale: OVERLAY.initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={overlaySpring}
    >
      {/* Header: Volver · which page · Cerrar */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-3 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center gap-1.5 rounded-sm px-4 text-base text-ink-soft transition-colors hover:bg-paper-warm hover:text-ink"
        >
          <ChevronLeftIcon />
          Volver
        </button>

        <div className="min-w-0 text-center">
          <p className="truncate text-[11px] uppercase tracking-widest text-ink-muted">
            {caption}
          </p>
          <p className="font-serif text-lg leading-tight text-ink sm:text-xl">
            {pageLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-12 w-12 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-warm hover:text-ink"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Viewport — gestures here stay local (don't reach Silk's sheet swipe). */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden p-3 sm:p-6"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <motion.div
          ref={boxRef}
          className="relative aspect-[729/1000] h-full max-h-full max-w-full overflow-hidden rounded-sm bg-paper-cream shadow-lg"
          style={{ x, y, scale, cursor: isZoomed ? "grab" : "default" }}
          drag={isZoomed}
          dragConstraints={{ left: -overX, right: overX, top: -overY, bottom: overY }}
          dragElastic={ZOOM.dragElastic}
          whileDrag={{ cursor: "grabbing" }}
          onDoubleClick={() => zoomTo(isZoomed ? ZOOM.min : ZOOM.doubleTap)}
        >
          <Image
            src={src}
            alt={`${pageLabel} — ${caption}`}
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            draggable={false}
            className="pointer-events-none select-none object-contain"
            priority
          />
        </motion.div>

        {/* Hint appears only while zoomed; never blocks the page. */}
        <motion.p
          className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-sm bg-ink/75 px-4 py-1.5 text-xs text-paper"
          initial={false}
          animate={{ opacity: isZoomed ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        >
          Arrastrá la imagen para moverla
        </motion.p>
      </div>

      {/* The only control: a zoom slider. Minus / plus glyphs are quiet
          shortcuts; the page tracks the thumb directly. */}
      <div className="flex items-center justify-center gap-3 border-t border-line px-4 py-5 sm:gap-5 sm:px-6">
        <button
          type="button"
          onClick={() => zoomTo(scale - ZOOM.step)}
          disabled={scale <= ZOOM.min}
          aria-label="Alejar"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-warm hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-soft"
        >
          <MinusIcon />
        </button>

        <div className="relative flex h-8 w-full max-w-[360px] items-center">
          {/* visible track + burgundy fill behind the native input */}
          <div
            className="pointer-events-none absolute inset-x-0 h-2.5 rounded-full"
            style={{
              background: `linear-gradient(to right, var(--color-burgundy) ${pct}%, var(--color-line-dark) ${pct}%)`,
            }}
          />
          <input
            type="range"
            min={ZOOM.min}
            max={ZOOM.max}
            step={0.01}
            value={scale}
            onChange={(e) => zoomTo(parseFloat(e.target.value))}
            aria-label="Acercar o alejar la página"
            aria-valuetext={`${Math.round(scale * 100)} por ciento`}
            className="scanzoom-slider absolute inset-0 h-full w-full"
          />
        </div>

        <button
          type="button"
          onClick={() => zoomTo(scale + ZOOM.step)}
          disabled={scale >= ZOOM.max}
          aria-label="Acercar"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-warm hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-soft"
        >
          <PlusIcon />
        </button>
      </div>

      <style>{`
        .scanzoom-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          margin: 0;
        }
        .scanzoom-slider::-webkit-slider-runnable-track {
          height: 100%;
          background: transparent;
        }
        .scanzoom-slider::-moz-range-track {
          height: 100%;
          background: transparent;
        }
        .scanzoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: var(--color-burgundy);
          border: 3px solid var(--color-paper);
          box-shadow: 0 2px 7px rgba(0, 0, 0, 0.3);
          cursor: grab;
        }
        .scanzoom-slider::-webkit-slider-thumb:active { cursor: grabbing; }
        .scanzoom-slider::-moz-range-thumb {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: var(--color-burgundy);
          border: 3px solid var(--color-paper);
          box-shadow: 0 2px 7px rgba(0, 0, 0, 0.3);
          cursor: grab;
        }
        .scanzoom-slider:focus-visible::-webkit-slider-thumb {
          outline: 2px solid var(--color-burgundy);
          outline-offset: 3px;
        }
        .scanzoom-slider:focus-visible::-moz-range-thumb {
          outline: 2px solid var(--color-burgundy);
          outline-offset: 3px;
        }
      `}</style>
    </motion.div>
  );
}
