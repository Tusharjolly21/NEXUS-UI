"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { pillClassName } from "@/components/site/pill-link";

/**
 * Allow / Deny, posted natively, but only once: Supabase accepts one decision per request, so a second tap (or a
 * double click) would fail and the browser would follow that failure instead of the redirect back to the app.
 */
export function ConsentForm({ authorizationId }: { authorizationId: string }) {
  const [choice, setChoice] = React.useState<"approve" | "deny" | null>(null);
  const submitted = React.useRef(false);

  return (
    <form
      action="/api/oauth/consent"
      method="post"
      className="mt-6 grid gap-2"
      onSubmit={(event) => {
        if (submitted.current) {
          event.preventDefault();
          return;
        }
        submitted.current = true;
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        setChoice(submitter?.value === "deny" ? "deny" : "approve");
      }}
    >
      <input type="hidden" name="authorization_id" value={authorizationId} />
      <button
        type="submit"
        name="decision"
        value="approve"
        aria-disabled={choice !== null}
        className={pillClassName("ink", "md", "w-full aria-disabled:opacity-60")}
      >
        {choice === "approve" ? <Loader2 className="size-5 animate-spin" aria-label="Connecting" /> : "Allow"}
      </button>
      <button
        type="submit"
        name="decision"
        value="deny"
        aria-disabled={choice !== null}
        className="grid h-11 place-items-center rounded-full text-[14.5px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:opacity-60"
      >
        Deny
      </button>
    </form>
  );
}
