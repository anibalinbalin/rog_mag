"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/paginas";

const AUTO_ADVANCE_MS = 7000;

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
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback((index: number) => {
    setActive(index);
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    if (paused) return;
    if (reducedMotion.current) return;
    const id = window.setTimeout(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Destacados"
      className="relative isolate overflow-hidden bg-burgundy-dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Slides stacked; only opacity animates (GPU-safe crossfade) */}
      <div className="relative min-h-[440px] lg:min-h-[560px]">
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
              {/* Base gradient: dark on the reading side, transparent away from it */}
              <div
                className={
                  centered
                    ? "absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70"
                    : "absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent"
                }
              />
              {/* Centered slides sit text over the middle — add a vertical wash for contrast */}
              {centered && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/45" />
              )}

              <div
                className={`relative mx-auto flex min-h-[440px] max-w-[1280px] items-center px-4 py-20 lg:min-h-[560px] ${
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
                        ? "text-5xl italic sm:text-6xl lg:text-7xl"
                        : "text-4xl sm:text-5xl"
                    }`}
                  >
                    {slide.heading}
                  </h2>
                  {slide.subheading && (
                    <p
                      className={`font-serif leading-[1.15] drop-shadow-sm ${
                        centered
                          ? "mt-4 text-3xl sm:text-4xl"
                          : "mt-1 text-4xl sm:text-5xl"
                      }`}
                    >
                      {slide.subheading}
                    </p>
                  )}
                  {slide.ctaLabel && slide.ctaHref && (
                    <div className={centered ? "mt-8 flex justify-center" : ""}>
                      <Link
                        href={slide.ctaHref}
                        className="mt-0 inline-flex items-center bg-action-dark px-7 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
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

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-3">
          {slides.map((slide, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a la diapositiva ${i + 1}: ${slide.heading}`}
                aria-current={isActive}
                className={`h-3 w-3 rounded-full border border-paper transition-colors duration-150 ease-[ease] ${
                  isActive ? "bg-paper" : "bg-transparent hover:bg-paper/40"
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
