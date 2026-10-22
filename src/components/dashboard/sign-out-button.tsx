"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SignOutButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [pending, setPending] = React.useState(false);

  async function signOut() {
    setPending(true);
    try {
      await createClient().auth.signOut();
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <button type="button" onClick={() => void signOut()} disabled={pending} className={cn("disabled:opacity-60", className)}>
      {children ?? (
        <>
          <LogOut className="size-4 shrink-0" aria-hidden />
          {pending ? "Signing out..." : "Sign out"}
        </>
      )}
    </button>
  );
}
