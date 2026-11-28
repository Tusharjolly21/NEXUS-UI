"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { SignupForm } from "@/components/signup-form";

export function PreviewSignupForm({
  compact = true,
}: { compact?: boolean } = {}) {
  if (compact) {
    return (
      <div className="flex h-auto min-h-[440px] w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-background p-4 sm:p-6">
        <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-base font-semibold text-foreground">
            Create your account
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start building for free
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-10 rounded-xl border border-border bg-muted/30" />
            <div className="h-10 rounded-xl border border-border bg-muted/30" />
          </div>
          <div className="mt-3 h-10 rounded-xl border border-border bg-muted/30" />
          <div className="mt-3 h-10 rounded-xl border border-border bg-muted/30" />
          <div className="mt-3 h-10 rounded-xl bg-primary/90" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-3xl border border-border p-3",
        "h-full min-h-[620px]",
      )}
    >
      <div
        className={cn(
          "card bg-base-100 shadow-sm rounded-xl border border-border bg-background",
          "w-full max-w-md",
        )}
      >
        <div className="card-body p-4 md:p-6">
          <h2 className="card-title text-lg font-semibold text-foreground">
            Welcome to Nexus-UI
          </h2>
          <p className="text-sm text-muted-foreground">
            Create your account to save favorites and access premium component
            docs.
          </p>
          <SignupForm
            className="w-full max-w-none border-0 bg-transparent p-0 shadow-none dark:bg-transparent"
            title="Create account"
            subtitle="Join Nexus-UI"
            submitLabel="Sign up"
            loadingLabel="Creating..."
            successLabel="Created"
            minPasswordLength={6}
            onSubmit={async () => {
              await new Promise<void>((resolve) => setTimeout(resolve, 700));
            }}
          />
        </div>
      </div>
    </div>
  );
}
