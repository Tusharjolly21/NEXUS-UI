import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { ProAccessProvider } from "@/components/pro/pro-access";
import { sessionHasPro } from "@/lib/component-access";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  // Only drives what the UI shows; every Pro resource is checked again on the server.
  const isPremium = await sessionHasPro();

  return (
    <ProAccessProvider isPro={isPremium} proCount={CATALOG_COUNTS.proComponents}>
      <div className="flex min-h-dvh flex-col">
        <SiteNav isPremium={isPremium} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </ProAccessProvider>
  );
}
