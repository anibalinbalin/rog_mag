"use client";

import { DialRoot, DialTimeline } from "dialkit";
import "dialkit/styles.css";

/** DialKit authoring surfaces — dev only (mounted behind a NODE_ENV check in
    the root layout, like Agentation). Any useDialKit()/useDialTimeline() hook
    in the tree renders here; without these surfaces the hooks just return
    their defaults, so production is unaffected. */
export default function DevDials() {
  return (
    <>
      <DialRoot position="top-right" />
      <DialTimeline />
    </>
  );
}
