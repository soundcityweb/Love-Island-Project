/** @type {import('next').NextConfig} */

const apiUrl = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
let apiHostname = "localhost";
let apiPort = "";
let apiProtocol = "http";

try {
  const parsedUrl = new URL(apiUrl);
  apiHostname = parsedUrl.hostname;
  apiPort = parsedUrl.port || "";
  const proto = parsedUrl.protocol.replace(":", "");
  if (proto === "http" || proto === "https") {
    apiProtocol = proto;
  }
} catch {
  // Keep defaults when API URL is not a valid URL.
}

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,

  async redirects() {
    return [
      { source: "/login", destination: "/admin/login", permanent: false },
    ];
  },

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
      {
        protocol: apiProtocol,
        hostname: apiHostname,
        ...(apiPort && { port: apiPort }),
        pathname: "/uploads/**",
      },
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
