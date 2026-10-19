import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { createClient } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/entitlements";
import { isSupabaseConfigured } from "@/lib/env";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  let isPremium = false;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) isPremium = await hasPremiumAccess(user.id);
    } catch {
      // non-fatal: the nav falls back to the signed-out state
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav isPremium={isPremium} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
