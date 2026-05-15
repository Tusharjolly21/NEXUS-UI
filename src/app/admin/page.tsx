import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/admin/users", title: "Users", body: "Directory, roles, premium flags." },
  { href: "/admin/content", title: "CMS", body: "Components, templates, and blog drafts." },
  { href: "/admin/analytics", title: "Analytics", body: "Traffic, conversions, Stripe events." },
  { href: "/admin/pricing", title: "Pricing", body: "Plans, coupons, and Stripe price IDs." },
];

export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Operational cockpit for Nexus-UI. All routes require an authenticated admin email from{" "}
          <code className="text-primary">ADMIN_EMAILS</code>.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="h-full border-border bg-card transition hover:border-primary/40">
              <CardHeader>
                <CardTitle className="text-card-foreground">{l.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{l.body}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
