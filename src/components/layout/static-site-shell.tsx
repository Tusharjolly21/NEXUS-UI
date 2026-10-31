import { SiteFooter } from "@/components/site/site-footer";
import { LaunchBanner } from "@/components/site/launch-banner";
import { SiteNav } from "@/components/site/site-nav";
import { SiteAutoplayQuiet } from "@/components/site/sound-switch";
import { ScrollToTop } from "@/components/site/scroll-to-top";
import { ProAccessProvider } from "@/components/pro/pro-access";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";

/**
 * SiteShell for a visitor who is known to be signed out, with nothing read per request, so the
 * pages inside it can be built once and served from the CDN.
 *
 * It is only reached through the rewrite in next.config.mjs, which sends the homepage here when the
 * request carries no sign-in cookie and no "launch banner closed" cookie. Anyone with either cookie
 * gets the regular SiteShell, so a signed-in visitor sees exactly what they always did. What this
 * renders is what SiteShell renders for that visitor: free plan, banner open. Keep the markup in sync
 * with SiteShell (src/components/layout/site-shell.tsx).
 */
export function StaticSiteShell({ children }: { children: React.ReactNode }) {
  return (
    <ProAccessProvider isPro={false} plan="free" proCount={CATALOG_COUNTS.proComponents}>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#site-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg"
        >
          Skip to content
        </a>
        <LaunchBanner />
        <SiteNav isPremium={false} />
        <main id="site-main" tabIndex={-1} className="flex-1 outline-none">
          <SiteAutoplayQuiet>{children}</SiteAutoplayQuiet>
        </main>
        <SiteFooter />
        <ScrollToTop />
      </div>
    </ProAccessProvider>
  );
}
