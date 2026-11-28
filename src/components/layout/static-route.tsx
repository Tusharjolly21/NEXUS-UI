import { CanonicalPathname } from "@/components/layout/canonical-pathname";
import { StaticSiteShell } from "@/components/layout/static-site-shell";
import type { PriceRegion } from "@/lib/pricing";

/**
 * What every cached route's layout renders: the shell for a signed-out visitor, in the visitor's price region, standing
 * for the address they really see (`path`, see canonical-pathname.tsx).
 */
export function StaticRoute({ path, region, children }: { path: string; region: PriceRegion; children: React.ReactNode }) {
  return (
    <CanonicalPathname path={path}>
      <StaticSiteShell region={region}>{children}</StaticSiteShell>
    </CanonicalPathname>
  );
}
