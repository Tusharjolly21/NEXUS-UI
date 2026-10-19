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
  // Content Security Policy — mitigates XSS and data injection attacks
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://i.pravatar.cc https://picsum.photos https://fastly.picsum.photos https://cdn.jsdelivr.net https://*.google-analytics.com https://*.googletagmanager.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' blob: https://*.supabase.co https://api.lemonsqueezy.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com/g/collect https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.gstatic.com",
      "worker-src 'self' blob:",
      "frame-src 'self' https://*.lemonsqueezy.com https://checkout.stripe.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  outputFileTracingIncludes: {
    "/api/download/template": [
      "./package.json",
      "./src/app/globals.css",
      "./src/components/**/*",
      "./src/lib/utils.ts",
      "./public/templates/**/*",
      "./public/videos/**/*",
      "./public/models/**/*",
      "./public/fonts/**/*",
      "./public/*.{png,jpg,jpeg,webp,svg}",
    ],
    "/api/registry/[name]": ["./.generated/registry/**/*.json"],
    "/components/[slug]": ["./.generated/registry/**/*.json"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // Section roots without their own page — Search Console reported these as 404s.
  async redirects() {
    return [
      { source: "/docs", destination: "/docs/introduction", permanent: true },
      { source: "/demos", destination: "/components", permanent: true },
      { source: "/Nexus", destination: "/", permanent: true },
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
