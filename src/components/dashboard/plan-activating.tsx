"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const MAX_TRIES = 20; // about a minute at 3s apiece

/**
 * Shown on /dashboard after Dodo Payments sends the buyer back but before the webhook has unlocked
 * their plan. Re-checks every 3 seconds; once access exists the server renders the page without it.
 */
export function PlanActivating({ contact }: { contact: string }) {
  const router = useRouter();
  const [tries, setTries] = React.useState(0);

  React.useEffect(() => {
    if (tries >= MAX_TRIES) return;
    const id = setTimeout(() => {
      router.refresh();
      setTries((n) => n + 1);
    }, 3000);
    return () => clearTimeout(id);
  }, [tries, router]);

  const slow = tries >= MAX_TRIES;
  return (
    <div role="status" className="mt-6 rounded-tile bg-tint-sky px-5 py-4 text-[15px] text-body">
      {slow ? (
        <>
          Your payment went through, but your plan hasn&apos;t unlocked yet. This is rare. Email{" "}
          <a href={`mailto:${contact}`} className="underline underline-offset-2">
            {contact}
          </a>{" "}
          with the email you paid with and we&apos;ll fix it.
        </>
      ) : (
        <>Payment received. Activating your plan... this takes a few seconds.</>
      )}
    </div>
  );
}
