import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Try searching for a component or heading back home.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "gap-2 rounded-full border-border/70",
          )}
        >
          <Home className="size-4" />
          Go home
        </Link>
        <Link
          href="/components"
          className={cn(
            buttonVariants(),
            "gap-2 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90",
          )}
        >
          Browse components
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
        {[
          { href: "/templates", label: "Templates" },
          { href: "/blocks", label: "Blocks" },
          { href: "/pricing", label: "Pricing" },
          { href: "/blog", label: "Blog" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="transition-colors hover:text-foreground"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
