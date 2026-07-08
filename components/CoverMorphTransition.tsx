"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { awaitCommit } from "@/lib/view-transition";

/** Every.to's article thumbnail-to-cover transition, ported to the App Router.
 *
 *  Wrap a container that holds a normal <Link> (or several) plus a cover element
 *  marked with `data-post-card-image`. On click of a matching link, only that
 *  cover gets the shared `view-transition-name`, SPA navigation runs inside
 *  document.startViewTransition, and the inline name is cleared when the
 *  transition finishes. The destination page's cover carries the matching name
 *  via the `.post-cover-transition` class (see globals.css), so the browser
 *  morphs the cover geometry while the rest of the page crossfades.
 *
 *  Timing/easing live entirely in globals.css (400ms cubic-bezier(.4,0,.2,1)),
 *  ported verbatim from the every.to reference. */

// Only ONE element may carry `view-transition-name: post-cover` at a time, so
// the active element + in-flight flag are module-level singletons shared across
// every wrapper instance on the page (clicks are sequential).
let activeTransitionElement: HTMLElement | null = null;
let transitionInFlight = false;

function clearActiveTransitionName() {
  if (activeTransitionElement) {
    activeTransitionElement.style.viewTransitionName = "";
    activeTransitionElement = null;
  }
  transitionInFlight = false;
}

function isModifiedClick(event: React.MouseEvent) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function linkMatches(anchor: HTMLAnchorElement, href: string) {
  if (!href) return true;
  if (anchor.getAttribute("href") === href) return true;
  try {
    return anchor.href === new URL(href, window.location.href).href;
  } catch {
    return false;
  }
}

type StartViewTransition = (
  callback: () => Promise<void> | void,
) => { finished: Promise<void> };

interface CoverMorphTransitionProps {
  /** Destination the wrapper is responsible for (must equal the inner Links' href). */
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Selector for the cover element that receives the shared transition name. */
  imageSelector?: string;
  transitionName?: string;
  /** Safety cap: resolve the transition even if the route never commits. */
  commitTimeoutMs?: number;
  disabled?: boolean;
}

export default function CoverMorphTransition({
  href,
  children,
  className = "",
  imageSelector = "[data-post-card-image]",
  transitionName = "post-cover",
  commitTimeoutMs = 2000,
  disabled = false,
}: CoverMorphTransitionProps) {
  const router = useRouter();

  // Warm the destination on mount so the morph's commit lands inside the 2s
  // safety window. Without this, a cold on-demand route compile in dev can take
  // longer than the safety timeout (measured >2s / up to ~5s), the transition
  // resolves with no committed cover, and you get a plain swap — the classic
  // "morph only works on the second click" symptom. There are only ~3 wrappers
  // on /revistas, so warming at mount is cheap.
  useEffect(() => {
    // Production: viewport Link prefetch + this cover the RSC prefetch.
    router.prefetch(href);
    // Dev: router.prefetch is a no-op, so kick off the on-demand route compile
    // directly. Gated to dev — must never change production behavior.
    if (process.env.NODE_ENV === "development") {
      fetch(href, { priority: "low" }).catch(() => {});
    }
  }, [router, href]);

  const handleClickCapture = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (
        event.defaultPrevented ||
        disabled ||
        transitionInFlight ||
        typeof window === "undefined"
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement)?.closest?.("a");
      if (
        !anchor ||
        !linkMatches(anchor as HTMLAnchorElement, href) ||
        isModifiedClick(event) ||
        ((anchor as HTMLAnchorElement).target &&
          (anchor as HTMLAnchorElement).target !== "_self") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      event.preventDefault();
      clearActiveTransitionName();
      transitionInFlight = true;

      const cover =
        event.currentTarget.querySelector<HTMLElement>(imageSelector);
      if (cover) {
        cover.style.viewTransitionName = transitionName;
        activeTransitionElement = cover;
      }

      const navigate = () => router.push(href, { scroll: true });

      const startViewTransition = (
        document as Document & {
          startViewTransition?: StartViewTransition;
        }
      ).startViewTransition;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Fallback: plain SPA navigation, no morph.
      if (!startViewTransition || prefersReducedMotion) {
        clearActiveTransitionName();
        navigate();
        return;
      }

      // Resolve the transition callback on the ACTUAL route commit (signalled by
      // ViewTransitionCommit in the root layout), not a fixed delay — dev-mode
      // on-demand compile makes the commit land hundreds of ms out. A safety
      // timeout guarantees the transition can't hang if the nav never commits.
      const transition = startViewTransition.call(
        document,
        () =>
          new Promise<void>((resolve) => {
            awaitCommit(resolve, commitTimeoutMs);
            navigate();
          }),
      );

      transition.finished.finally(clearActiveTransitionName);
    },
    [disabled, href, imageSelector, router, transitionName, commitTimeoutMs],
  );

  return (
    <div className={className} onClickCapture={handleClickCapture}>
      {children}
    </div>
  );
}
