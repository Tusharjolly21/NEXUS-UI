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
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://www.gstatic.com https://static.cloudflareinsights.com ${adsenseScriptHosts}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://i.pravatar.cc https://picsum.photos https://fastly.picsum.photos https://cdn.jsdelivr.net https://cdn.simpleicons.org https://*.google-analytics.com https://*.googletagmanager.com ${adsenseBeaconHosts}`,
      "font-src 'self' https://fonts.gstatic.com",
      // audio and video from this site, plus the short silent clip (a data: URL) that keeps phone audio on the media channel
      "media-src 'self' data: blob:",
      `connect-src 'self' blob: https://cdn.jsdelivr.net https://*.supabase.co https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com/g/collect https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.gstatic.com https://cloudflareinsights.com ${adsenseBeaconHosts}`,
      "worker-src 'self' blob:",
      `frame-src 'self' https://checkout.stripe.com ${adsenseFrameHosts}`,
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
    // The sounds page shows the library's own source.
    "/sounds": ["./src/lib/ui-sounds.ts"],
    // Component pages list the guides that link to them.
    "/components/[slug]": ["./content/blog/*.mdx"],
    // Block pages read section source at request time (only for sessions allowed to see it).
    "/blocks/[slug]": [
      "./src/components/blocks/**/*.{ts,tsx}",
      "./src/components/{interactive-dots,layered-wave-background,particle-noise,wavy-lines}/**/*.{ts,tsx}",
      "./src/app/globals.css",
    ],
    "/components/[slug]": ["./.generated/registry/**/*.json", "./content/build-prompts/*.md"],
    // Pro build prompts live outside public/ and are only read by this gated route.
    "/api/prompt/[slug]": ["./content/build-prompts/*.md"],
    // Video prompts, source, kit and render script: same idea, read only by the gated route.
    "/api/videos/[slug]/[part]": ["./content/videos/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Optimised copies are kept for a month instead of a minute, so repeat visits skip the work.
    minimumCacheTTL: 2678400,
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
      // `/%2Fdashboard` (an encoded slash straight after the host) makes Vercel's runtime look for a
      // pages-router file that doesn't exist and answer 500. Send it to the page it was meant to be.
      { source: "/%2F:path(.*)", destination: "/:path", permanent: false },
      { source: "/docs", destination: "/docs/introduction", permanent: true },
      { source: "/demos", destination: "/components", permanent: true },
      { source: "/Nexus", destination: "/", permanent: true },
      // Components that are really page sections now live on the Blocks pages (moved-sections.ts).
      { source: "/components/cinematic-logo-cloud", destination: "/blocks/block-logo-clouds#cinematic-logo-cloud", permanent: true },
      { source: "/components/step-flow", destination: "/blocks/block-features#step-flow", permanent: true },
      { source: "/components/hero-aurora-spotlight", destination: "/blocks/block-hero#aurora-hero-spotlight", permanent: true },
      { source: "/components/bento-signal-grid", destination: "/blocks/block-why-choose-us#signal-bento-grid", permanent: true },
      { source: "/components/float-glass-navbar", destination: "/blocks/block-navigation#float-glass-navbar", permanent: true },
      { source: "/components/orbit-footer", destination: "/blocks/block-footer#orbit-footer", permanent: true },
      { source: "/components/toggle-pricing-pro", destination: "/blocks/block-pricing-section#toggle-pricing", permanent: true },
      { source: "/components/split-signup-convert", destination: "/blocks/block-signup#split-signup-convert", permanent: true },
      { source: "/components/workbench-sidebar", destination: "/blocks/block-sidebar#workbench-sidebar", permanent: true },
      { source: "/components/lattice-feature-grid", destination: "/blocks/block-features#lattice-feature-grid", permanent: true },
      { source: "/components/motion-faq-disclosure", destination: "/blocks/block-faq-folder-card#motion-faq-disclosure", permanent: true },
      { source: "/components/nebula-cta-glow", destination: "/blocks/block-cta#nebula-cta-glow", permanent: true },
      { source: "/components/editorial-blog-rail", destination: "/blocks/block-blog-content-sections#editorial-blog-rail", permanent: true },
      { source: "/components/split-contact-glass", destination: "/blocks/block-contact-page#split-contact-glass", permanent: true },
      { source: "/components/dot-grid-hero", destination: "/blocks/block-hero#interactive-dot-grid-hero", permanent: true },
      { source: "/components/starfield-hero", destination: "/blocks/block-hero#interactive-starfield-hero", permanent: true },
      { source: "/components/shooting-stars-grid", destination: "/blocks/block-hero#shooting-stars-grid", permanent: true },
      { source: "/components/animated-bento-grid", destination: "/blocks/block-why-choose-us#animated-bento-grid", permanent: true },
      { source: "/components/bento-grid-skeleton", destination: "/blocks/block-why-choose-us#bento-grid-skeleton", permanent: true },
      { source: "/components/scrolling-testimonials", destination: "/blocks/block-social-proof#scrolling-testimonials", permanent: true },
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
      // Static media from /public (images, fonts, 3D models, videos, sounds): a day in the browser and
      // CDN, then a week of serving the old copy while a fresh one loads. Not immutable, because
      // some of these files are replaced in place under the same name.
      {
        source: "/:file*.(svg|png|jpg|jpeg|webp|avif|gif|ico|otf|woff2|glb|mp4|webm|ogg|mp3)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
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
