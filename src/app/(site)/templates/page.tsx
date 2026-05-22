import type { Metadata } from "next";
import Link from "next/link";
import { getCachedUser } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/entitlements";
import { isSupabaseConfigured } from "@/lib/env";
import { createMetadata } from "@/lib/seo";
import { templates } from "@/lib/catalog/templates";
import TemplatesPageClient from "./templates-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Free Next.js Landing Page Templates — SaaS & Marketing",
  description:
    "Free Next.js landing page templates for SaaS and marketing. Animated, production-ready, built with Tailwind CSS and Framer Motion. Copy and ship.",
  alternates: { canonical: "/templates" },
});

export default async function TemplatesPage() {
  let isPremium = false;
  if (isSupabaseConfigured()) {
    try {
      const user = await getCachedUser();
      if (user) isPremium = await hasPremiumAccess(user.id);
    } catch {
      // non-fatal
    }
  }

  return (
    <>
      {/* Server-rendered index for search engine discovery. Hidden visually. */}
      <ul aria-hidden className="sr-only">
        {templates.map((t) => (
          <li key={t.slug}>
            <Link href={`/templates/${t.slug}`}>{t.title}</Link>
          </li>
        ))}
      </ul>
      <TemplatesPageClient isPremium={isPremium} />
    </>
  );
}
