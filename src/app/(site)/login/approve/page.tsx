import type { Metadata } from "next";
import Link from "next/link";
import { MonitorSmartphone } from "lucide-react";
import { pillClassName } from "@/components/site/pill-link";
import { getPendingHandoff, isHandoffId, isOtpType } from "@/lib/login-handoff";
import { safeNextPath } from "@/lib/safe-redirect";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Approve sign-in · Nexus-UI",
  robots: { index: false, follow: false },
  /* The URL carries the one-time sign-in token; never leak it through Referer. */
  referrer: "no-referrer",
};

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function requestedAgo(createdAt: string) {
  const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
}

export default async function ApprovePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rid = first(params.rid);
  const tokenHash = first(params.token_hash);
  const type = first(params.type);
  const next = safeNextPath(first(params.next));

  const handoff = isHandoffId(rid) ? await getPendingHandoff(rid) : null;

  if (!handoff || !rid || !tokenHash || !isOtpType(type)) {
    return (
      <AuthShell title="Link expired" description="This sign-in request is no longer open.">
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Sign-in requests expire after 10 minutes. Go back to the page you started on and ask for a new link.
        </p>
        <Link href="/login" className={pillClassName("ink", "md", "mt-6 w-full")}>
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  const where = handoff.location ? ` near ${handoff.location}` : "";

  return (
    <AuthShell title="Approve sign-in" description="Someone asked to sign in to Nexus UI with your email.">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-foreground">
        <MonitorSmartphone className="size-6" aria-hidden />
      </span>
      <p className="mt-4 text-[15px] text-muted-foreground">Requested {requestedAgo(handoff.created_at)} from</p>
      <p className="mt-0.5 text-[19px] font-semibold text-foreground">{handoff.device ?? "an unknown device"}</p>
      {where ? <p className="text-[14px] text-muted-foreground">{where.trim()}</p> : null}
      <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
        Only approve if that was you. Approving signs you in here, and signs in the device that asked.
      </p>

      <form action="/api/auth/approve" method="post" className="mt-6 grid gap-2">
        <input type="hidden" name="rid" value={rid} />
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next} />
        <button type="submit" className={pillClassName("ink", "md", "w-full")}>
          Approve sign-in
        </button>
        <Link
          href="/"
          className="grid h-11 place-items-center rounded-full text-[14.5px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          That wasn&apos;t me
        </Link>
      </form>
    </AuthShell>
  );
}
