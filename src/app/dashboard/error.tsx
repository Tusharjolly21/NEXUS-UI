"use client";

import Link from "next/link";
import { Card, DashboardPage } from "@/components/dashboard/ui";
import { pillClassName } from "@/components/site/pill-link";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <DashboardPage>
      <Card className="flex flex-col items-center px-6 py-16 text-center">
        <h1 className="text-[22px] font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 max-w-sm text-[15px] text-muted-foreground">
          We couldn&apos;t load this page. Your account and purchases are safe. Try again, and if it keeps happening email us.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className={pillClassName("ink", "md")}>
            Try again
          </button>
          <Link href="/dashboard" className={pillClassName("white", "md")}>
            Back to overview
          </Link>
        </div>
      </Card>
    </DashboardPage>
  );
}
