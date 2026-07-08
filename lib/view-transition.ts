/** Bridges a View Transition to the actual App Router commit.
 *
 *  In dev there is no Link prefetch and the destination route compiles + fetches
 *  its RSC payload on demand — often 300ms+, sometimes seconds. A fixed delay
 *  (the every.to reference's `setTimeout(100)`) resolves the transition callback
 *  long before the new DOM commits, so the browser morphs old→old and swaps the
 *  real page in afterward, unanimated.
 *
 *  Instead, CoverMorphTransition hands its resolver here, and a listener mounted
 *  in the root layout (ViewTransitionCommit) calls `signalCommit()` from a
 *  layout effect when the pathname changes — i.e. once the new route (including
 *  its `.post-cover-transition` cover) has committed to the DOM. That is the
 *  moment to capture the "new" snapshot. A safety timeout guarantees the
 *  transition can never hang if a navigation fails or the route has no cover. */

let pendingResolve: (() => void) | null = null;
let safetyTimer: ReturnType<typeof setTimeout> | null = null;

/** Register the transition callback's resolver; call from inside the
 *  startViewTransition callback right before navigating. */
export function awaitCommit(resolve: () => void, timeoutMs = 2000) {
  // Drop any stale pending resolver first (defensive; clicks are sequential).
  signalCommit();
  pendingResolve = resolve;
  safetyTimer = setTimeout(signalCommit, timeoutMs);
}

/** Resolve the pending transition callback (route committed, or safety fired). */
export function signalCommit() {
  if (safetyTimer !== null) {
    clearTimeout(safetyTimer);
    safetyTimer = null;
  }
  if (pendingResolve) {
    const resolve = pendingResolve;
    pendingResolve = null;
    resolve();
  }
}
