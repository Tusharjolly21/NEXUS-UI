"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { pillClassName } from "@/components/site/pill-link";

/**
 * Allow / Deny. The decision is sent with fetch and the browser then goes to the app's address itself: the site's
 * Content-Security-Policy has `form-action 'self'`, and Chrome applies that to the redirect after a form post, so a
 * plain form would be stopped before it reached the app (claude.ai). Supabase accepts one decision per request, so
 * the buttons lock after the first tap. Without JavaScript the form still posts natively.
 */
export function ConsentForm({ authorizationId }: { authorizationId: string }) {
  const [choice, setChoice] = React.useState<"approve" | "deny" | null>(null);
  const [problem, setProblem] = React.useState<string | null>(null);
  const busy = React.useRef(false);

  async function decide(decision: "approve" | "deny") {
    if (busy.current) return;
    busy.current = true;
    setChoice(decision);
    setProblem(null);
    try {
      const body = new FormData();
      body.set("authorization_id", authorizationId);
      body.set("decision", decision);
      const res = await fetch("/api/oauth/consent", { method: "POST", body, headers: { Accept: "application/json" } });
      const data = (await res.json().catch(() => null)) as { redirect_url?: string; error?: string } | null;
      if (res.ok && data?.redirect_url) {
        window.location.assign(data.redirect_url);
        return;
      }
      if (data?.redirect_url) {
        // e.g. not signed in any more: go where the server says.
        window.location.assign(data.redirect_url);
        return;
      }
      setProblem(data?.error ?? "That didn't go through. Go back to the app and connect again.");
    } catch {
      setProblem("Couldn't reach Nexus UI. Check your connection and try again.");
    }
    busy.current = false;
    setChoice(null);
  }

  return (
    <form
      action="/api/oauth/consent"
      method="post"
      className="mt-6 grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        void decide(submitter?.value === "deny" ? "deny" : "approve");
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
      {problem ? (
        <p role="alert" className="mt-2 text-center text-[14px] leading-relaxed text-destructive">
          {problem}
        </p>
      ) : null}
    </form>
  );
}
