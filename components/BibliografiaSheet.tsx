"use client";

import Image from "next/image";
import { Scroll } from "@silk-hq/components";
import { SheetWithDepth } from "@/components/SheetWithDepth";

export type BibliografiaSheetProps = {
  label: string;
  eyebrow: string;
  name: string;
  years: string;
  photo: string;
  photoAlt: string;
  body: string[];
  /** Styles for the trigger button (kept identical to the previous CTA). */
  buttonClassName?: string;
};

const DEFAULT_BUTTON =
  "inline-flex items-center rounded-sm bg-action px-7 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90";

/** "Bibliografía Fontana" CTA on /80-años. Opens a Silk "sheet with depth":
    the page recedes behind a bottom sheet holding Pérez Fontana's portrait and
    biography. Dismiss via the X, the backdrop, swipe-down, or Esc. */
export default function BibliografiaSheet({
  label,
  eyebrow,
  name,
  years,
  photo,
  photoAlt,
  body,
  buttonClassName,
}: BibliografiaSheetProps) {
  return (
    <SheetWithDepth.Root>
      <SheetWithDepth.Trigger className={buttonClassName ?? DEFAULT_BUTTON}>
        {label}
      </SheetWithDepth.Trigger>

      <SheetWithDepth.Portal>
        <SheetWithDepth.View>
          <SheetWithDepth.Backdrop />
          <SheetWithDepth.Content>
            <div className="relative h-full">
              {/* Dismiss — top right, matching the mockup. Wrapped in an
                  absolute div because Silk's base styles set the Trigger itself
                  to position:relative (which would override a Tailwind class). */}
              <div className="absolute right-4 top-4 z-10 sm:right-8 sm:top-8">
                <SheetWithDepth.Trigger
                  action="dismiss"
                  aria-label="Cerrar"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-warm"
                >
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
                </SheetWithDepth.Trigger>
              </div>

              <Scroll.Root className="h-full">
                <Scroll.View className="h-full" scrollGestureTrap={{ yEnd: true }}>
                  <Scroll.Content>
                    <div className="mx-auto max-w-4xl px-6 pb-20 pt-20 sm:px-10 sm:pt-24">
                      {/* Header: portrait + name side by side */}
                      <div className="grid gap-8 sm:grid-cols-[22rem_1fr] sm:gap-12">
                        <div
                          className={`relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-paper-cream sm:w-[22rem] ${
                            photo ? "" : "border border-dashed border-line"
                          }`}
                        >
                          {photo ? (
                            <Image
                              src={photo}
                              alt={photoAlt}
                              fill
                              sizes="352px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-muted/70">
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
                              <span className="text-[0.7rem] uppercase tracking-[0.2em]">
                                Imagen
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-end">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
                            {eyebrow}
                          </p>
                          <SheetWithDepth.Title className="mt-4 font-serif text-3xl font-bold leading-tight text-ink sm:text-4xl">
                            {name}
                            {years ? (
                              <>
                                <br />
                                {years}
                              </>
                            ) : null}
                          </SheetWithDepth.Title>
                        </div>
                      </div>

                      {/* Body: full width below */}
                      <div className="mt-10 space-y-4 text-base leading-relaxed text-ink-soft">
                        {body.map((paragraph, i) => (
                          <p
                            key={i}
                            dangerouslySetInnerHTML={{ __html: paragraph }}
                          />
                        ))}
                      </div>
                    </div>
                  </Scroll.Content>
                </Scroll.View>
              </Scroll.Root>
            </div>
          </SheetWithDepth.Content>
        </SheetWithDepth.View>
      </SheetWithDepth.Portal>
    </SheetWithDepth.Root>
  );
}
