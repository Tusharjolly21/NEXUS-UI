/** @type {import('next').NextConfig} */
// Plain ESM config avoids the `next.config.ts` require-hook path that can break or stall on Node.js 24.15+.
const securityHeaders = [
  // Prevents MIME-type sniffing — blocks drive-by downloads and XSS via wrong content type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Blocks the page from being framed by other sites (clickjacking protection)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Enables DNS prefetching for faster navigation
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Sends full referrer on same-origin, only origin on cross-origin — privacy-safe for analytics
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  // Restricts browser feature access — reduces attack surface
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      // Permanent redirect from bare domain to www — fixes 307 temporary redirects
      {
        source: "/:path*",
        has: [{ type: "host", value: "nexus-ui.com" }],
        destination: "https://www.nexus-ui.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Prevent indexing of URL-parameter pages that duplicate catalog content
      {
        source: "/components",
        has: [{ type: "query", key: "view" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
      {
        source: "/blocks",
        has: [{ type: "query", key: "view" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
      {
        source: "/blocks",
        has: [{ type: "query", key: "cat" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
    ];
  },
};

export default nextConfig;