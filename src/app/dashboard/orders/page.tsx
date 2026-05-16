import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders – Nexus UI",
  description: "View your purchased products and subscriptions.",
};

export default async function DashboardOrdersPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/orders");
  }

  return (
    <div className="px-8 py-10">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Your Orders
        </h1>
        <p className="mt-1 text-muted-foreground">
          View your purchased products and subscriptions
        </p>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-24 text-center">
        <Package className="size-12 text-muted-foreground" />
        <h2 className="mt-4 font-semibold text-foreground">No orders yet</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          You haven&apos;t made any purchases yet. Explore our components and
          templates to find something you love.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/components"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg")}
          >
            Browse Components
          </Link>
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-lg bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            Get All Access
          </Link>
        </div>
      </div>
    </div>
  );
}
