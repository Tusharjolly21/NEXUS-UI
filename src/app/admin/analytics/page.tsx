import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Product metrics</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect Supabase + Stripe events to chart checkout conversion, template downloads, and cohort retention.
        </CardContent>
      </Card>
    </div>
  );
}
