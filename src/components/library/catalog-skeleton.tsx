export function CatalogSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden lg:flex-row">
      {/* sidebar */}
      <aside className="relative hidden w-[272px] shrink-0 border-r border-border/40 lg:flex lg:flex-col">
        <div className="space-y-3 p-4">
          <div className="h-8 w-full animate-pulse rounded-xl bg-muted" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded-lg bg-muted/70" />
            ))}
          </div>
        </div>
      </aside>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10 lg:py-16 xl:px-14">
          {/* heading */}
          <div className="pb-10 lg:pb-14">
            <div className="h-12 w-48 animate-pulse rounded-xl bg-muted" />
            <div className="mt-5 h-5 w-96 animate-pulse rounded-lg bg-muted/70" />
          </div>

          {/* filter bar */}
          <div className="mb-8 h-12 w-full animate-pulse rounded-2xl bg-muted/50" />

          {/* card grid */}
          <div className="grid gap-10 lg:grid-cols-2 xl:gap-x-12 xl:gap-y-14">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[480px] animate-pulse overflow-hidden rounded-[28px] bg-muted/55 dark:bg-white/[0.055]"
              >
                <div className="m-2.5 h-[300px] rounded-[22px] bg-muted dark:bg-white/[0.08]" />
                <div className="space-y-3 px-8 pt-5">
                  <div className="h-8 w-2/3 rounded-xl bg-muted dark:bg-white/[0.06]" />
                  <div className="h-4 w-full rounded-lg bg-muted/70 dark:bg-white/[0.04]" />
                  <div className="h-4 w-4/5 rounded-lg bg-muted/70 dark:bg-white/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
