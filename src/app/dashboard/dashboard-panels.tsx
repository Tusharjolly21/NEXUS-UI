"use client";

import Link from "next/link";
import { useDiscovery } from "@/hooks/use-discovery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardPanels({ email }: { email: string | null }) {
  const { favorites, bookmarks, recent } = useDiscovery();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {email ? (
              <>
                Signed in as <span className="text-primary">{email}</span>
              </>
            ) : (
              "Local session — connect Supabase to sync purchases and cloud saves."
            )}
          </p>
        </div>
        <Link
          href="/pricing"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-full border-border text-foreground",
          )}
        >
          Manage billing
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-card-foreground">Saved components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {favorites
              .filter((f) => f.kind === "component")
              .map((f) => (
                <Link key={f.slug} className="block text-primary hover:text-foreground" href={`/components/${f.slug}`}>
                  {f.slug}
                </Link>
              ))}
            {!favorites.filter((f) => f.kind === "component").length ? <p>No favorites yet.</p> : null}
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-card-foreground">Bookmarked templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {bookmarks
              .filter((b) => b.kind === "template")
              .map((b) => (
                <Link key={b.slug} className="block text-primary hover:text-foreground" href={`/templates/${b.slug}`}>
                  {b.slug}
                </Link>
              ))}
            {!bookmarks.filter((b) => b.kind === "template").length ? <p>No bookmarks yet.</p> : null}
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-card-foreground">Recently viewed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {recent.map((slug) => (
              <Link key={slug} className="block text-primary hover:text-foreground" href={`/components/${slug}`}>
                {slug}
              </Link>
            ))}
            {!recent.length ? <p>Open components to populate history.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-card-foreground">Downloads & purchases</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Stripe webhook marks orders in Supabase when configured. Until then, successful checkouts redirect here with{" "}
          <code className="text-primary">?checkout=success</code>.
        </CardContent>
      </Card>
    </div>
  );
}
