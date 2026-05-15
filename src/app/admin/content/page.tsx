import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminContentPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Content CMS</h1>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">New component entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Slug</Label>
            <Input className="mt-1 bg-background" placeholder="hero-aurora-v2" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Markdown / MDX body</Label>
            <textarea
              className="mt-1 min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Publishing pipeline can POST to Supabase Storage + table rows."
            />
          </div>
          <Button type="button" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            Save draft (wire to API)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
