import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.10.11.186", "claude-code-sec.tailf626.ts.net"],
  images: {
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
