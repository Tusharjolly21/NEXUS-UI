import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPricingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Pricing controls</h1>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Stripe price IDs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Manage <code className="text-primary">STRIPE_PRICE_PREMIUM_MONTHLY</code> and{" "}
            <code className="text-primary">STRIPE_PRICE_PREMIUM_LIFETIME</code> in your deployment environment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
