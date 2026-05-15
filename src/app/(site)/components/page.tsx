import { Suspense } from "react";
import { ComponentsBrowser } from "@/components/library/components-browser";

export default function ComponentsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-4 py-16">
          <p className="text-sm text-muted-foreground">Loading library…</p>
        </div>
      }
    >
      <ComponentsBrowser />
    </Suspense>
  );
}
