"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { pillClassName } from "@/components/site/pill-link";

/**
 * Posts the approval natively, but locks the button on the first tap: the emailed token is
 * single-use, so a second request in flight would only fail.
 */
export function ApproveForm({ fields, children }: { fields: Record<string, string>; children?: React.ReactNode }) {
  const [submitting, setSubmitting] = React.useState(false);

  return (
    <form action="/api/auth/approve" method="post" className="mt-6 grid gap-2" onSubmit={() => setSubmitting(true)}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" disabled={submitting} className={pillClassName("ink", "md", "w-full disabled:opacity-60")}>
        {submitting ? <Loader2 className="size-5 animate-spin" aria-label="Signing in" /> : "Approve sign-in"}
      </button>
      {children}
    </form>
  );
}
