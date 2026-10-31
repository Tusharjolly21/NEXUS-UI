import { StaticSiteShell } from "@/components/layout/static-site-shell";

export default function StaticLayout({ children }: { children: React.ReactNode }) {
  return <StaticSiteShell>{children}</StaticSiteShell>;
}
