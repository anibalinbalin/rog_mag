"use client";

import type { ReactNode } from "react";
import { SheetWithDepth, SheetWithDepthStack } from "@/components/SheetWithDepth";

/** Wraps a whole page so it can recede ("depth") behind a SheetWithDepth. The
    Outlet is the surface that scales/translates back; any SheetWithDepth.Root in
    the children binds to it via forComponent="closest". Triggers live inside.
    (Same mechanism as BibliografiaDepthShell on /80-años, but page-agnostic.) */
export default function DepthShell({ children }: { children: ReactNode }) {
  return (
    <SheetWithDepthStack.Root asChild>
      <div>
        <SheetWithDepth.Outlet>{children}</SheetWithDepth.Outlet>
      </div>
    </SheetWithDepthStack.Root>
  );
}
