import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Users</h1>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Supabase Auth directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Wire this view to <code className="text-primary">supabase.auth.admin.listUsers</code> using the service role key on the server only. Never expose service keys to the browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
