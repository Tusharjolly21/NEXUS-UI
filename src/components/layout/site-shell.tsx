import { SiteFooter } from "@/components/layout/site-footer";
import { Navbar } from "@/components/navbar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
