"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { LoginForm } from "@/components/signup-form/login-form";

export function PreviewLoginForm({ compact = true }: { compact?: boolean } = {}) {
  if (compact) {
    return (
      <div className="flex h-auto min-h-[440px] w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-background p-4 sm:p-6">
        <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-base font-semibold text-foreground">Welcome back</p>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
          <div className="mt-4 h-10 rounded-xl border border-border bg-muted/30" />
          <div className="mt-3 h-10 rounded-xl border border-border bg-muted/30" />
          <div className="mt-3 h-10 rounded-xl bg-primary/90" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center rounded-3xl border border-border p-3", "h-full min-h-[540px]")}>
      <div className="w-full max-w-md rounded-xl border border-border bg-background">
        <div className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to your Nexus-UI account.</p>
          <LoginForm
            className="mt-4 w-full max-w-none border-0 bg-transparent p-0 shadow-none dark:bg-transparent"
            title=""
            subtitle=""
            submitLabel="Sign in"
            loadingLabel="Signing in..."
            successLabel="Signed in"
            onSubmit={async () => {
              await new Promise<void>((resolve) => setTimeout(resolve, 700));
            }}
          />
        </div>
      </div>
    </div>
  );
}
