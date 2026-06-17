/**
 * BookCover3D — magazine/journal cover rendered as a tasteful 3D hardcover book.
 *
 * SIZING CONTRACT:
 *   The component is `w-full` internally. The parent controls the actual rendered
 *   width by passing a width class via `className` (e.g. `w-64 sm:w-72 lg:w-[340px]`).
 *   The component always fills that width and maintains a 3:4 (portrait book) aspect
 *   ratio for the front face.
 *
 * 3D ANATOMY:
 *   ┌────────────────┐
 *   │ spine │  cover  │ page edges
 *   │ (left)│  image  │ (right thin sliver)
 *   └────────────────┘
 *      soft drop shadow beneath
 *
 *   - `perspective` wrapper creates the 3D viewing frustum
 *   - `.book-face` is rotated -18° on the Y axis so the spine naturally appears
 *     on the left and page edges on the right
 *   - Spine: absolute overlay, thin left strip, dark burgundy gradient
 *   - Page edges: absolute overlay, thin right strip, striped cream lines
 *   - Shadow: a blurred, offset div layered behind the book face
 *
 * SERVER COMPONENT: no client hooks, safe for Next.js App Router RSC.
 */

import Image from "next/image";

export default function BookCover3D({
  src,
  alt,
  priority,
  className,
}: {
  src?: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    /**
     * Outer shell: positions the shadow layer and provides the perspective
     * depth for the Y-rotation. Padding-bottom on the shadow demands a bit
     * of extra vertical room below the book, so we use `pb-6` here.
     */
    <div className={`w-full pb-6 ${className ?? ""}`}>
      {/* Perspective frustum — all 3D children live inside.
          `relative` so the absolute drop-shadow below anchors to this box. */}
      <div
        className="relative"
        style={{ perspective: "900px", perspectiveOrigin: "60% 50%" }}
      >
        {/* ── Drop shadow ──────────────────────────────────────────────────
            A blurred rectangle placed slightly below and behind the book face.
            It's a sibling (not a child) of the rotated face so it stays flat
            in screen-space and doesn't rotate with the book. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "6%",
            right: "10%",
            bottom: "-18px",
            height: "40px",
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.38) 0%, transparent 80%)",
            filter: "blur(14px)",
            zIndex: 0,
            transform: "scaleX(0.92)",
          }}
        />

        {/* ── Book face wrapper — carries the Y-rotation ───────────────────
            Relative so the spine/edge overlays can be absolute children. */}
        <div
          className="relative w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateY(-18deg)",
            /* 3:4 portrait ratio for the front face */
            aspectRatio: "3 / 4",
            zIndex: 1,
          }}
        >
          {/* ── Front cover image (or cream placeholder) ───────────────── */}
          <div className="absolute inset-0 overflow-hidden bg-paper-cream">
            {src ? (
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 340px, (min-width: 640px) 288px, 256px"
                className="object-cover"
                priority={priority}
              />
            ) : null}
          </div>

          {/* ── Spine overlay (left edge) ──────────────────────────────────
              A narrow vertical strip (≈8% of cover width) that darkens the
              left side of the rotated face to read as the bound spine.
              The gradient goes from deeper-dark at the far-left to transparent
              so it blends naturally into the cover image. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0"
            style={{
              width: "8%",
              background:
                "linear-gradient(to right, rgba(74,22,40,0.82) 0%, rgba(74,22,40,0.45) 55%, transparent 100%)",
            }}
          />

          {/* ── Page-edge overlay (right edge) ────────────────────────────
              A thin sliver (≈5% of cover width) on the right side, styled
              with subtle horizontal stripes to suggest stacked paper edges.
              Uses a repeating-linear-gradient of cream tones. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0"
            style={{
              width: "5%",
              background:
                "repeating-linear-gradient(to bottom, #f4f3ec 0px, #f4f3ec 2px, #dddcd5 2px, #dddcd5 3px)",
              /* A light left-edge shade makes the sliver read as a separate
                 surface from the cover face */
              boxShadow: "inset 2px 0 4px rgba(0,0,0,0.12)",
            }}
          />

          {/* ── Cover-face edge shadow (right of cover) ───────────────────
              Very subtle darkening along the extreme right edge of the cover
              so the page-edge sliver above it reads as behind/beside the face. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0"
            style={{
              width: "12%",
              background:
                "linear-gradient(to left, rgba(0,0,0,0.18) 0%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
