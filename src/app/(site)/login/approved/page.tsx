import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { pillClassName } from "@/components/site/pill-link";
import { safeNextPath } from "@/lib/safe-redirect";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Signed in · Nexus-UI",
  robots: { index: false, follow: false },
};

export default async function ApprovedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const handedOff = params.handoff === "1";

  return (
    <AuthShell
      title="You're signed in"
      description={
        handedOff
          ? "Your other device will sign in automatically in a few seconds."
          : "You're all set. Continue to your account."
      }
    >
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-foreground">
        <CircleCheck className="size-6" aria-hidden />
      </span>
      <Link href={next} className={pillClassName("ink", "md", "mt-6 w-full")}>
        Continue
      </Link>
    </AuthShell>
  );
}
