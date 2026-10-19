import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getOwnedTemplateSlugs, hasPremiumAccess } from "@/lib/entitlements";
import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { PillLink } from "@/components/site/pill-link";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard — Nexus UI",
  description: "Your Nexus UI dashboard.",
};

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const isPremium = await hasPremiumAccess(user.id);
  const owned = isPremium ? null : await getOwnedTemplateSlugs(user.id);
  const templatesYours = isPremium ? CATALOG_COUNTS.templates : (owned?.size ?? 0);
  const blocksYours = isPremium ? CATALOG_COUNTS.blocks : blocksManifest.filter((b) => !b.premium).length;

  const displayName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "there";
  const firstName = String(displayName).split(" ")[0];

  const stats = [
    { value: CATALOG_COUNTS.components, of: CATALOG_COUNTS.components, label: "Components you can use", tint: "bg-tint-violet" },
    { value: blocksYours, of: CATALOG_COUNTS.blocks, label: "Blocks you can use", tint: "bg-tint-sky" },
    { value: templatesYours, of: CATALOG_COUNTS.templates, label: "Templates you own", tint: "bg-tint-butter" },
  ];

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-[960px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="pg-display text-[clamp(36px,5vw,52px)] text-foreground">Hi, {firstName}</h1>
            <p className="mt-2 text-[17px] text-muted-foreground">
              {isPremium ? "Your plan includes every template and block." : "You're on the free plan."}
            </p>
          </div>
          {isPremium ? (
            <span className="rounded-full bg-tint-mint px-3.5 py-1.5 text-[13px] font-semibold text-[#126b3a] dark:text-[#7ee2a8]">
              Paid plan active
            </span>
          ) : (
            <PillLink href="/pricing" size="sm">
              Compare plans
            </PillLink>
          )}
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <li key={s.label} className={cn("rounded-tile p-6", s.tint)}>
              <p className="text-[40px] font-bold leading-none tracking-[-0.04em] text-foreground">
                {s.value}
                {s.value !== s.of ? <span className="text-[20px] font-semibold text-muted-foreground"> of {s.of}</span> : null}
              </p>
              <p className="mt-2 text-[14.5px] text-body">{s.label}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { href: "/components", title: "Browse components", body: isPremium ? `All ${CATALOG_COUNTS.components} are yours, with a one-line install.` : `${CATALOG_COUNTS.freeComponents} free, ${CATALOG_COUNTS.proComponents} more with Pro.` },
            {
              href: "/templates",
              title: isPremium || templatesYours ? "Open your templates" : "Browse templates",
              body: isPremium || templatesYours
                ? "Every template page has a Download source button for what you own."
                : `${CATALOG_COUNTS.templates} complete landing pages with live previews.`,
            },
            { href: "/dashboard/orders", title: "Orders", body: "Receipts for everything you've bought." },
            { href: "/dashboard/api-key", title: "API tokens", body: "A token for installing premium items with the shadcn CLI." },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="pg-float rounded-tile bg-card p-6 transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
            >
              <h2 className="text-[17px] font-semibold text-foreground">{l.title}</h2>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">{l.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
