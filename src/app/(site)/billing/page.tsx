import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing – Nexus UI",
};

export default async function BillingPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/billing");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Billing</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Manage your subscription and payment details.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-24 text-center">
        <div className="mb-4 grid size-14 place-items-center rounded-2xl border border-border bg-background shadow-sm">
          <CreditCard className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-base font-semibold text-foreground">No active subscription</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          You&apos;re on the free plan. Upgrade to unlock premium components, templates, and blocks.
        </p>
        <Link
          href="/pricing"
          className={cn(
            buttonVariants({ size: "sm" }),
            "mt-6 rounded-full bg-foreground px-6 text-[13px] font-semibold text-background hover:bg-foreground/90",
          )}
        >
          View pricing
        </Link>
      </div>
    </div>
  );
}
