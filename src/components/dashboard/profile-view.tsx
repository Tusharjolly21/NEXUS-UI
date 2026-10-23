import Link from "next/link";
import { Card, CardTitle, DashboardPage, formatDate, PageHeader } from "@/components/dashboard/ui";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { pillClassName } from "@/components/site/pill-link";

export type ProfileData = {
  name: string;
  email: string;
  avatarLetter: string;
  provider: string;
  createdAt: string | null;
  userId: string;
  planLabel: string;
};

const PROVIDERS: Record<string, string> = { google: "Google", github: "GitHub", email: "Email link" };

export function ProfileView({ data }: { data: ProfileData }) {
  const rows = [
    { label: "Name", value: data.name },
    { label: "Email", value: data.email },
    { label: "Signed in with", value: PROVIDERS[data.provider] ?? data.provider },
    { label: "Member since", value: formatDate(data.createdAt) },
    { label: "Plan", value: data.planLabel },
  ];

  return (
    <DashboardPage>
      <PageHeader title="Account" description="Who you're signed in as." />

      <div className="flex flex-col gap-5">
        <Card className="flex items-center gap-5">
          <div
            aria-hidden
            className="grid size-16 shrink-0 place-items-center rounded-full bg-muted text-[26px] font-semibold text-foreground"
          >
            {data.avatarLetter}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[22px] font-semibold tracking-[-0.02em] text-foreground">{data.name}</p>
            <p className="truncate text-[15px] text-muted-foreground">{data.email}</p>
          </div>
        </Card>

        <Card>
          <CardTitle>Details</CardTitle>
          <dl className="divide-y divide-border">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-[15px] text-muted-foreground">{r.label}</dt>
                <dd className="min-w-0 truncate text-right text-[15px] font-medium text-foreground">{r.value}</dd>
              </div>
            ))}
            <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <dt className="text-[15px] text-muted-foreground">User ID</dt>
              <dd className="min-w-0 break-all font-mono text-[12.5px] text-muted-foreground sm:text-right">{data.userId}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardTitle>Shortcuts</CardTitle>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/dashboard/billing" className={pillClassName("white", "sm")}>
              Billing
            </Link>
            <Link href="/dashboard/api-key" className={pillClassName("white", "sm")}>
              API key
            </Link>
          </div>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[17px] font-semibold text-foreground">Sign out</h2>
            <p className="mt-1 text-[14.5px] text-muted-foreground">You can sign back in any time with the same email.</p>
          </div>
          <SignOutButton className={pillClassName("white", "md", "gap-2")} />
        </Card>
      </div>
    </DashboardPage>
  );
}
