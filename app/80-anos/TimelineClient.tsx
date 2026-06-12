"use client";

import { useState } from "react";
import type { Epoca } from "@/lib/epocas";

/** Renders the director line with a single "Director: " prefix.
    Época 1's data is a bare name; the placeholders already embed the prefix —
    this keeps both robust if the content changes. */
function directorLine(director: string): string {
  if (!director) return "";
  return /^director\s*:/i.test(director.trim())
    ? director.trim()
    : `Director: ${director.trim()}`;
}

/** Splits the detail string into stacked lines (the mockup shows the month
    list and the year on separate rows). Splits on " / " when present. */
function detailLines(detail: string): string[] {
  if (!detail) return [];
  return detail
    .split(" / ")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TimelineClient({ epocas }: { epocas: Epoca[] }) {
  const [selected, setSelected] = useState(0);
  const active = epocas[selected];

  if (epocas.length === 0) return null;

  return (
    <div>
      {/* Year pills */}
      <div className="flex flex-wrap gap-3">
        {epocas.map((epoca, index) => {
          const isActive = index === selected;
          return (
            <button
              key={epoca.slug}
              type="button"
              onClick={() => setSelected(index)}
              aria-pressed={isActive}
              className={`min-w-[64px] px-5 py-2 text-sm tabular-nums tracking-wider transition-colors ${
                isActive
                  ? "bg-burgundy text-paper"
                  : "bg-action text-paper hover:bg-action-dark"
              }`}
            >
              {epoca.startYear}
            </button>
          );
        })}
      </div>

      {/* Local keyframe — a quiet 180ms opacity fade on pill switch. Scoped
          here so globals.css (Belen's tokens) stays untouched. */}
      <style>{`
        @keyframes epocaFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Detail panel — generous min-height so switching pills doesn't jump */}
      <div className="mt-12 min-h-[220px]">
        <div
          key={active.slug}
          className="motion-safe:[animation:epocaFadeIn_180ms_ease-out]"
        >
          <h3 className="font-serif text-4xl text-ink sm:text-5xl">
            {active.title}
          </h3>
          <div className="mt-6 space-y-1 text-sm leading-relaxed text-ink-muted">
            {directorLine(active.director) && (
              <p>{directorLine(active.director)}</p>
            )}
            {detailLines(active.detail).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
