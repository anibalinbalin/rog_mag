import type { NextConfig } from "next";

// Build stamp surfaced in the top strip (see app/layout.tsx) so editors can
// confirm at a glance whether their browser is on the latest deploy. Stamped
// from Vercel's git SHA at build time; "local" when built outside Vercel.
const buildSha = (process.env.VERCEL_GIT_COMMIT_SHA || "local").slice(0, 7);
const buildDate = `${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`;

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_SHA: buildSha,
    NEXT_PUBLIC_BUILD_DATE: buildDate,
  },
  allowedDevOrigins: ["10.10.11.186", "claude-code-sec.tailf626.ts.net"],
  images: { unoptimized: true,
    // Editor media uploads live in Cloudinary (see tina/config.tsx media store).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dz9zexfaf/**",
      },
    ],
  },
  // The public URL keeps the ñ (/80-años); it maps internally to the ASCII
  // app/aniversario route so `next dev` resolves it (a non-ASCII folder name
  // 404s in the dev server). List the raw and percent-encoded forms since the
  // incoming path can arrive either way.
  async rewrites() {
    // beforeFiles: run before the filesystem route check. In `next dev` the
    // non-ASCII path 404s during that check, so an afterFiles rewrite never
    // gets its turn — beforeFiles rewrites it to the ASCII route first.
    return {
      beforeFiles: [
        { source: "/80-años", destination: "/aniversario" },
        { source: "/80-a%C3%B1os", destination: "/aniversario" },
      ],
    };
  },
  async redirects() {
    return [
      // Noticias is an editorial section — its permanent home is /secciones/noticias.
      {
        source: "/noticias",
        destination: "/secciones/noticias",
        permanent: true,
      },
      // The anniversary page is canonical at /80-años (keep the ñ — "anos"
      // without it reads badly in Spanish). The route folder is ASCII
      // (app/aniversario) so `next dev` resolves it, and a rewrite (below)
      // serves the page under the accented URL. Fold the alternates onto it.
      {
        source: "/80-anos",
        destination: "/80-años",
        permanent: true,
      },
      {
        source: "/aniversario",
        destination: "/80-años",
        permanent: true,
      },
      // The /80-años-test experiment (the split-screen scroll-map) won and was
      // promoted into the canonical /80-años page, so the test route is gone.
      // Fold every test URL onto the canonical one so old links still land.
      {
        source: "/80-años-test",
        destination: "/80-años",
        permanent: true,
      },
      {
        source: "/80-a%C3%B1os-test",
        destination: "/80-años",
        permanent: true,
      },
      {
        source: "/80-anos-test",
        destination: "/80-años",
        permanent: true,
      },
      {
        source: "/aniversario-test",
        destination: "/80-años",
        permanent: true,
      },
      // /testmapbelen was the original noindex scroll-map experiment; its layout
      // is now the canonical /80-años, so the route is removed — fold it on too.
      {
        source: "/testmapbelen",
        destination: "/80-años",
        permanent: true,
      },
      // The magazine archive moved /revista → /revistas (plural, matches the
      // "Revistas" nav label). Fold the old singular URLs — listing and each
      // issue — onto the new ones so existing links and bookmarks keep working.
      {
        source: "/revista",
        destination: "/revistas",
        permanent: true,
      },
      {
        source: "/revista/:slug*",
        destination: "/revistas/:slug*",
        permanent: true,
      },
      // The B layout was promoted from /b to the site root; keep old URLs working.
      {
        source: "/b",
        destination: "/",
        permanent: true,
      },
      {
        source: "/b/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
