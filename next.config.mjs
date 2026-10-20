/** @type {import('next').NextConfig} */
// Plain ESM config avoids the `next.config.ts` require-hook path that can break or stall on Node.js 24.15+.
// Google AdSense: loader + ad-quality scripts, ad frames, and the beacons they send.
// Ad creatives render inside doubleclick/googlesyndication iframes, so their own images
// and scripts are governed by those frames, not by this policy.
const adsenseScriptHosts =
  "https://pagead2.googlesyndication.com https://*.googlesyndication.com https://partner.googleadservices.com https://www.googletagservices.com https://adservice.google.com https://*.adtrafficquality.google https://fundingchoicesmessages.google.com";
const adsenseFrameHosts =
  "https://googleads.g.doubleclick.net https://*.doubleclick.net https://*.googlesyndication.com https://www.google.com https://*.adtrafficquality.google";
const adsenseBeaconHosts =
  "https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://www.google.com https://csi.gstatic.com";

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
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://www.gstatic.com https://app.lemonsqueezy.com https://static.cloudflareinsights.com ${adsenseScriptHosts}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://i.pravatar.cc https://picsum.photos https://fastly.picsum.photos https://cdn.jsdelivr.net https://cdn.simpleicons.org https://*.google-analytics.com https://*.googletagmanager.com ${adsenseBeaconHosts}`,
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' blob: https://cdn.jsdelivr.net https://*.supabase.co https://api.lemonsqueezy.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com/g/collect https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.gstatic.com https://cloudflareinsights.com ${adsenseBeaconHosts}`,
      "worker-src 'self' blob:",
      `frame-src 'self' https://*.lemonsqueezy.com https://checkout.stripe.com ${adsenseFrameHosts}`,
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig = {
  // No dev badge: template preview images are captured from the dev server.
  devIndicators: false,
  poweredByHeader: false,
  compress: true,
  outputFileTracingIncludes: {
    // Pro template screenshots are served only through the gated route, never from public/.
    "/api/template-shot/[slug]/[n]": ["./private/template-shots/**/*"],
    // The template zip (src/lib/template-zip.ts) reads the page, its imports, the public files it
    // references, the versions to pin, and the template's build prompt (PROMPT.md).
    "/api/download/template": [
      "./package.json",
      "./package-lock.json",
      "./src/components/**/*",
      "./src/hooks/**/*",
      "./src/lib/utils.ts",
      "./src/@types/*.d.ts",
      "./public/**/*",
      "./content/build-prompts/templates/*.md",
    ],
    // Template build prompts: outside public/, only read by this gated route.
    "/api/prompt/template/[slug]": ["./content/build-prompts/templates/*.md"],
    "/api/registry/[name]": ["./.generated/registry/**/*.json"],
    "/api/prompt/blocks/[id]": ["./content/build-prompts/blocks/*.md"],
    // Component pages list the guides that link to them.
    "/components/[slug]": ["./content/blog/*.mdx"],
    // Block pages read section source at request time (only for sessions allowed to see it).
    "/blocks/[slug]": [
      "./src/components/blocks/**/*.{ts,tsx}",
      "./src/components/{interactive-dots,layered-wave-background,particle-noise,wavy-lines}/**/*.{ts,tsx}",
      "./src/app/globals.css",
    ],
    "/components/[slug]": ["./.generated/registry/**/*.json"],
    // Pro build prompts live outside public/ and are only read by this gated route.
    "/api/prompt/[slug]": ["./content/build-prompts/*.md"],
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
      // The project's production vercel.app address serves the same site; send it to the one
      // canonical host so search engines never index a second copy. (Preview deployments use other
      // hostnames and are unaffected.)
      {
        source: "/:path*",
        has: [{ type: "host", value: "nexus-ui-olive.vercel.app" }],
        destination: "https://www.nexus-ui.com/:path*",
        permanent: true,
      },
      { source: "/docs", destination: "/docs/introduction", permanent: true },
      { source: "/demos", destination: "/components", permanent: true },
      { source: "/Nexus", destination: "/", permanent: true },
      // Old `?cat=` filter links → crawlable category pages (unknown slugs 404 there).
      {
        source: "/components",
        has: [{ type: "query", key: "cat", value: "(?<cat>(?!all$)[a-z0-9-]+)" }],
        destination: "/components/category/:cat",
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
