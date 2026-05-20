import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

loadEnvConfig(process.cwd());

const apiUrl = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
let apiHostname = "localhost";
let apiPort = "";
let apiProtocol: "http" | "https" = "http";

try {
  const parsedUrl = new URL(apiUrl);
  apiHostname = parsedUrl.hostname;
  apiPort = parsedUrl.port || "";

  const parsedProtocol = parsedUrl.protocol.replace(":", "");
  if (parsedProtocol === "http" || parsedProtocol === "https") {
    apiProtocol = parsedProtocol;
  }
} catch {
  // Keep defaults when NEXT_PUBLIC_API_URL is not a valid URL.
}

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,

  async redirects() {
    console.error('[nextConfig] redirects');
    return [
      { source: "/login", destination: "/admin/login", permanent: false },
    ];
  },

  /**
   * Proxy /api/uploads/** to the NestJS static file server for any remaining
   * legacy records that still hold local /uploads/ paths.
   */
  async rewrites() {
    return [
      {
        source: "/api/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Legacy: allow the real API hostname for any pre-migration local paths.
      {
        protocol: apiProtocol,
        hostname: apiHostname,
        ...(apiPort && { port: apiPort }),
        pathname: "/uploads/**",
      } as RemotePattern,
      // Cloudinary: allow next/image to optimise Cloudinary-hosted assets.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
