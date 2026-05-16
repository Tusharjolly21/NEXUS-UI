import { redirect } from "next/navigation";
import Link from "next/link";
import { Crown, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing – Nexus UI",
  description: "Manage your subscription and view invoices.",
};

export default async function DashboardBillingPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/billing");
  }

  return (
    <div className="px-8 py-10">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Billing
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and view invoices
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Subscription card */}
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center">
          <Crown className="size-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No Active Subscription
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Get unlimited access to all components, blocks, and templates with
            an All-Access Pass.
          </p>
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ size: "sm" }),
              "mt-6 rounded-lg bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            Get All Access
          </Link>
        </div>

        {/* Order history card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Receipt className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Order History</h2>
          </div>
          <div className="border-t border-border pt-4">
            <p className="py-6 text-center text-sm text-muted-foreground">
              No orders found
            </p>
          </div>
        </div>

        {/* Support card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">
            Need help with billing?
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            If you have any questions about your subscription or invoices, our
            support team is here to help.
          </p>
          <Link
            href="mailto:contact@nexus-ui.com"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-4 rounded-lg",
            )}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
