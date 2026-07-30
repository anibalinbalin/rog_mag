"use client";

import { useState } from "react";

type Group = { label: string; sublabel?: string; items: string[] };

/** Belen's direction (2026-06): the issue's "Contenido" as a collapsible
    accordion. Renders only groups that have items. */
export default function IssueContentsAccordion({
  groups,
}: {
  groups: Group[];
}) {
  const [open, setOpen] = useState<number | null>(null);

  if (groups.length === 0) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-ink-muted">
        Contenido
      </p>

      <div className="mt-4 border-t border-line">
        {groups.map((group, i) => {
          const isOpen = open === i;
          return (
            <div key={group.label} className="border-b border-line">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between py-4 text-left"
              >
                <span className="font-serif text-xl font-semibold text-ink">
                  {group.label}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-ink-muted transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {isOpen && group.sublabel && (
                <p className="pb-3 font-serif text-lg font-medium text-ink-muted">
                  {group.sublabel}
                </p>
              )}
              {isOpen && (
                <ul className="space-y-2 pb-5">
                  {group.items.length > 0 ? (
                    group.items.map((item) => (
                      <li
                        key={item}
                        className="text-base leading-relaxed text-ink-soft"
                      >
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-base italic leading-relaxed text-ink-muted">
                      Contenido pendiente
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
