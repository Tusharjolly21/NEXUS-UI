import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/entitlements";
import { isSupabaseConfigured } from "@/lib/env";
import { createMetadata } from "@/lib/seo";
import TemplatesPageClient from "./templates-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Templates",
  description:
    "Full-page Next.js templates built for production SaaS. Animated landing pages, pricing flows, and dashboards you can copy and ship.",
  alternates: { canonical: "/templates" },
});

export default async function TemplatesPage() {
  let isPremium = false;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) isPremium = await hasPremiumAccess(user.id);
    } catch {
      // non-fatal
    }
  }

  return <TemplatesPageClient isPremium={isPremium} />;
}
