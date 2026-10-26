// This lives in the (index) route group so the skeleton only wraps the /blog list. If it sat at the
// top of /blog it would also wrap /blog/[slug]; the response status is then already sent as "200" by
// the time notFound() runs, and Google files a missing post as a duplicate of the home page.
export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-10 md:py-14">
      {/* hero skeleton */}
      <div className="rounded-3xl border border-border/60 bg-muted/25 px-6 py-10 sm:px-10 sm:py-12 dark:bg-white/[0.025]">
        <div className="h-6 w-32 animate-pulse rounded-full bg-muted" />
        <div className="mt-5 h-9 w-3/4 animate-pulse rounded-xl bg-muted" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-lg bg-muted/70" />
        <div className="mt-2 h-4 w-5/6 animate-pulse rounded-lg bg-muted/70" />
      </div>

      {/* post list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-background/80 p-5 dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-6 w-3/4 animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-md bg-muted/70" />
                <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted/70" />
              </div>
              <div className="mt-1 size-4 shrink-0 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
