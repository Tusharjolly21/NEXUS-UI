import { cookies } from "next/headers";
import { SiteFooter } from "@/components/site/site-footer";
import { LaunchBanner } from "@/components/site/launch-banner";
import { LAUNCH_BANNER_COOKIE, LAUNCH_BANNER_ID } from "@/lib/launch-banner";
import { SiteNav } from "@/components/site/site-nav";
import { ProAccessProvider } from "@/components/pro/pro-access";
import { sessionHasPro, sessionPlanKind } from "@/lib/component-access";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  // Only drives what the UI shows; every Pro resource is checked again on the server.
  const isPremium = await sessionHasPro();
  const plan = isPremium ? await sessionPlanKind() : "free";
  const bannerClosed = (await cookies()).get(LAUNCH_BANNER_COOKIE)?.value === LAUNCH_BANNER_ID;

  return (
    <ProAccessProvider isPro={isPremium} plan={plan} proCount={CATALOG_COUNTS.proComponents}>
      <div className="flex min-h-dvh flex-col">
        {bannerClosed || isPremium ? null : <LaunchBanner />}
        <SiteNav isPremium={isPremium} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </ProAccessProvider>
  );
}
