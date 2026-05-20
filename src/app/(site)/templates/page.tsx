import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/entitlements";
import { isSupabaseConfigured } from "@/lib/env";
import TemplatesPageClient from "./templates-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Templates – Nexus UI",
  description:
    "Full-page Next.js templates built for production. Copy, customize, ship.",
};

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
