import { Suspense } from "react";
import { DocsSidebarLayout } from "@/components/library/docs-sidebar-layout";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100dvh-4rem)] w-full animate-pulse bg-background dark:bg-zinc-950">
          <div className="hidden w-[min(100%,260px)] shrink-0 border-r border-border lg:block" />
          <div className="min-w-0 flex-1 p-6 sm:p-8">
            <div className="h-8 max-w-md rounded-md bg-muted" />
            <div className="mt-6 h-4 max-w-lg rounded bg-muted/70" />
            <div className="mt-3 h-4 max-w-sm rounded bg-muted/50" />
          </div>
        </div>
      }
    >
      <DocsSidebarLayout>{children}</DocsSidebarLayout>
    </Suspense>
  );
}
