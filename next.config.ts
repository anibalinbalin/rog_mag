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
  async redirects() {
    return [
      // Noticias is an editorial section — its permanent home is /secciones/noticias.
      {
        source: "/noticias",
        destination: "/secciones/noticias",
        permanent: true,
      },
      // The anniversary page moved from /80-anos to /80-años; keep the old URL working.
      {
        source: "/80-anos",
        destination: "/80-años",
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
