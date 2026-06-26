"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Stepper, useAutoPlay } from "pasito/react";
import "pasito/styles.css";
import type { HeroSlide } from "@/lib/paginas";

const AUTO_ADVANCE_MS = 3000;

const PLAY_ICON = (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M11.1967 2.71828C8.53683 0.970354 5 2.8783 5 6.0611V17.9387C5 21.1215 8.53684 23.0294 11.1967 21.2815L20.234 15.3427C22.6384 13.7627 22.6384 10.2371 20.234 8.65706L11.1967 2.71828Z"
      fill="white"
    />
  </svg>
);

const PAUSE_ICON = (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 6C4 4.34315 5.34315 3 7 3C8.65685 3 10 4.34315 10 6V18C10 19.6569 8.65685 21 7 21C5.34315 21 4 19.6569 4 18V6Z"
      fill="white"
    />
    <path
      d="M14 6C14 4.34315 15.3431 3 17 3C18.6569 3 20 4.34315 20 6V18C20 19.6569 18.6569 21 17 21C15.3431 21 14 19.6569 14 18V6Z"
      fill="white"
    />
  </svg>
);

/** Per-slide layout: the first slide reads like the original desk hero
    (left-aligned), the rest are centered like the "80 años" mockup. */
function isCentered(index: number) {
  return index > 0;
}

/** Sensible object-position per slide. Slide 0 (desk photo) keeps the journal
    in frame on the right; the 80-años portrait (bound volumes) is centered so
    the spines read behind the centered text. */
function objectPosition(index: number) {
  return index === 0 ? "object-right" : "object-center";
}

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Pasito drives the auto-advance and the active pill's visible fill progress.
  const { playing, toggle, filling, fillDuration } = useAutoPlay({
    count: slides.length,
    active,
    onStepChange: setActive,
    stepDuration: AUTO_ADVANCE_MS,
    loop: true,
  });

  // Start playing on mount (autoplay is paused by default), unless the visitor
  // prefers reduced motion — then it waits behind the Play button.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current || reducedMotion || slides.length < 2) return;
    autoStartedRef.current = true;
    toggle();
  }, [toggle, reducedMotion, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Destacados"
      className="relative isolate overflow-hidden bg-burgundy-dark"
    >
      {/* Slides stacked; only opacity animates (GPU-safe crossfade).
          Fills the viewport below the sticky h-24 (6rem) header so the hero
          owns the whole first screen. */}
      <div className="relative min-h-[calc(100svh-6rem)]">
        {slides.map((slide, i) => {
          const centered = isCentered(i);
          const isActive = i === active;
          return (
            <div
              key={i}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-[ease] motion-reduce:transition-none ${
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.heading || "Destacado"}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover ${objectPosition(i)}`}
              />

              <div
                className={`relative mx-auto flex min-h-[calc(100svh-6rem)] max-w-[1280px] items-center px-4 py-20 ${
                  centered ? "justify-center text-center" : ""
                }`}
              >
                <div
                  className={`text-paper ${
                    centered ? "max-w-2xl" : "max-w-xl"
                  }`}
                >
                  <h2
                    className={`font-serif leading-[1.1] drop-shadow-sm ${
                      centered
                        ? "text-6xl italic sm:text-7xl lg:text-8xl"
                        : "text-5xl sm:text-6xl"
                    }`}
                  >
                    {slide.heading}
                  </h2>
                  {slide.subheading && (
                    <p
                      className={`font-serif leading-[1.15] drop-shadow-sm ${
                        centered
                          ? "mt-4 text-4xl sm:text-5xl"
                          : "mt-1 text-5xl sm:text-6xl"
                      }`}
                    >
                      {slide.subheading}
                    </p>
                  )}
                  {slide.ctaLabel && slide.ctaHref && (
                    <div className={centered ? "mt-8 flex justify-center" : "mt-8"}>
                      <Link
                        href={slide.ctaHref}
                        className="inline-flex items-center rounded-sm bg-action-dark px-7 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
                      >
                        {slide.ctaLabel}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pasito autoplay player — the fill-progress pill stepper + a play/pause toggle */}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-3">
          <Stepper
            className="hero-stepper"
            count={slides.length}
            active={active}
            onStepClick={setActive}
            filling={filling}
            fillDuration={fillDuration}
          />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pausar" : "Reproducir"}
            className="grid size-8 place-items-center rounded-full bg-white/20 backdrop-blur-xl transition-colors hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper/80"
          >
            {playing ? PAUSE_ICON : PLAY_ICON}
          </button>
        </div>
      )}
    </section>
  );
}
