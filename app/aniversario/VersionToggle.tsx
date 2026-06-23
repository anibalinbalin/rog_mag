"use client";

import { useEffect, useState } from "react";

/** A/B toggle for the /80-años timeline layout so Belén can compare designs.
 *  Wired through the URL hash (so /80-años#v2 is shareable) plus an "rdc-version"
 *  event for instant in-page switches. ScrollMapClient listens to the same
 *  channel — neither component owns the other's state. */
export default function VersionToggle() {
  const [v, setV] = useState<1 | 2>(1);

  useEffect(() => {
    setV(window.location.hash === "#v2" ? 2 : 1);
    const onVer = (e: Event) => setV((e as CustomEvent).detail === 2 ? 2 : 1);
    window.addEventListener("rdc-version", onVer);
    return () => window.removeEventListener("rdc-version", onVer);
  }, []);

  const select = (n: 1 | 2) => {
    const url = new URL(window.location.href);
    url.hash = n === 2 ? "v2" : "";
    window.history.replaceState(null, "", url.toString().replace(/#$/, ""));
    setV(n);
    window.dispatchEvent(new CustomEvent("rdc-version", { detail: n }));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.65rem] uppercase tracking-[0.15em] text-ink-muted">Versión</span>
      <div className="flex items-center rounded-full border border-line p-0.5">
        {([1, 2] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => select(n)}
            aria-pressed={v === n}
            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
              v === n ? "bg-burgundy text-paper" : "text-ink-soft hover:text-ink"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
