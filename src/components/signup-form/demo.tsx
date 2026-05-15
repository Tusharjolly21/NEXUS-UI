"use client";

import * as React from "react";
import { SignupForm, type SignupFormValues } from "./signup-form";

export function SignupFormDemo() {
  async function handleSubmit(values: SignupFormValues) {
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
    if (values.email.endsWith("@example.com")) {
      throw new Error("Demo validation error");
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-8 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Forms</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Signup Form
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Customizable auth form built with shadcn input/label and subtle framer-motion transitions.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-muted/30 p-4 dark:bg-zinc-950/70">
          <SignupForm onSubmit={handleSubmit} />
        </div>
        <div className="rounded-2xl border border-border bg-muted/30 p-4 dark:bg-zinc-950/70">
          <SignupForm
            title="Join the beta"
            subtitle="Early access to new Nexus-UI primitives."
            submitLabel="Request access"
            loadingLabel="Sending request..."
            successLabel="Request sent"
            showNameField={false}
            showConfirmPasswordField={false}
            minPasswordLength={6}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
}
