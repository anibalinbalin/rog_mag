"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { signalCommit } from "@/lib/view-transition";

/** Mounted once in the root layout (which persists across navigations). When the
 *  pathname changes, the new route's DOM has committed — resolve any pending
 *  cover-morph transition so the browser captures the destination cover. See
 *  lib/view-transition.ts. Renders nothing. */
export default function ViewTransitionCommit() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    signalCommit();
  }, [pathname]);

  return null;
}
