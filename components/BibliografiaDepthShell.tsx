"use client";

import type { ReactNode } from "react";
import { SheetWithDepth, SheetWithDepthStack } from "@/components/SheetWithDepth";

/** Wraps the /80-años page so it can recede ("depth") behind the Bibliografía
    sheet. The Outlet is the surface that scales/translates back; the sheet's
    `forComponent="closest"` binds to it. The trigger lives in the children. */
export default function BibliografiaDepthShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SheetWithDepthStack.Root asChild>
      <div>
        <SheetWithDepth.Outlet>{children}</SheetWithDepth.Outlet>
      </div>
    </SheetWithDepthStack.Root>
  );
}
