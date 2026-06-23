"use client";

import { useEffect, useState } from "react";
import ScrollMapClient from "./ScrollMapClient";
import type { Epoca } from "@/lib/epocas";

/** Owns the A/B layout version (from the navbar VersionToggle, shared via the URL
 *  hash + "rdc-version" event) and remounts ScrollMapClient with a fresh `key` on
 *  change — so its GSAP/ScrollTrigger setup re-initialises against the new DOM
 *  instead of re-running in place (which left the transform-pinned map drifting).
 *  Starts at v1 to match the server HTML, then reads the hash on mount. */
export default function ScrollMap({ epocas }: { epocas: Epoca[] }) {
  const [version, setVersion] = useState<1 | 2>(1);

  useEffect(() => {
    setVersion(window.location.hash === "#v2" ? 2 : 1);
    const onVer = (e: Event) => setVersion((e as CustomEvent).detail === 2 ? 2 : 1);
    window.addEventListener("rdc-version", onVer);
    return () => window.removeEventListener("rdc-version", onVer);
  }, []);

  return <ScrollMapClient key={version} version={version} epocas={epocas} embedded />;
}
