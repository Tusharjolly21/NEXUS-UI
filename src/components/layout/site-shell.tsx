import { cookies } from "next/headers";
import { SiteFooter } from "@/components/site/site-footer";
import { LaunchBanner } from "@/components/site/launch-banner";
import { LAUNCH_BANNER_COOKIE, LAUNCH_BANNER_ID } from "@/lib/launch-banner";
import { SiteNav } from "@/components/site/site-nav";
import { SiteAutoplayQuiet } from "@/components/site/sound-switch";
import { ScrollToTop } from "@/components/site/scroll-to-top";
import { ProAccessProvider } from "@/components/pro/pro-access";
import { sessionHasPro, sessionPlanKind } from "@/lib/component-access";
import { preload } from "react-dom";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  // Only drives what the UI shows; every Pro resource is checked again on the server.
  const isPremium = await sessionHasPro();
  const plan = isPremium ? await sessionPlanKind() : "free";
  // Start fetching the early-slot numbers with the page, so the banner has them by the time it hydrates.
  if (!isPremium) preload("/api/slots", { as: "fetch", crossOrigin: "anonymous" });
  const bannerClosed = (await cookies()).get(LAUNCH_BANNER_COOKIE)?.value === LAUNCH_BANNER_ID;

  return (
    <ProAccessProvider isPro={isPremium} plan={plan} proCount={CATALOG_COUNTS.proComponents}>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#site-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg"
        >
          Skip to content
        </a>
        {/* Everyone sees the announcement until they close it, Pro members included (they get their own words) */}
        {bannerClosed ? null : <LaunchBanner isPro={isPremium} />}
        <SiteNav isPremium={isPremium} />
        <main id="site-main" tabIndex={-1} className="flex-1 outline-none">
          <SiteAutoplayQuiet>{children}</SiteAutoplayQuiet>
        </main>
        <SiteFooter />
        <ScrollToTop />
      </div>
    </ProAccessProvider>
  );
}
