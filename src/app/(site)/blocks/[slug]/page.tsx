import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getBlock, blocks } from "@/lib/catalog/blocks";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata, siteConfig } from "@/lib/seo";
import { BlockDetailActions } from "@/components/library/block-detail-actions";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blocks.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = getBlock(slug);
  if (!b) return {};
  return createMetadata({
    title: b.name,
    description: b.description,
    openGraph: { title: `${b.name} · ${siteConfig.name}` },
  });
}

export default async function BlockDetailPage({ params }: Props) {
  const { slug } = await params;
  const block = getBlock(slug);
  if (!block) notFound();
  const Preview = block.Preview;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="border-border text-muted-foreground">
            {block.category}
          </Badge>
          <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{block.name}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{block.description}</p>
          <div className="flex flex-wrap gap-2">
            {block.tags.map((t) => (
              <span key={t} className="rounded-full border border-border bg-muted/50 dark:bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/blocks"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-full border-border text-foreground",
          )}
        >
          All blocks
        </Link>
      </div>

      <Card className="border-border bg-muted/50 dark:bg-white/5 p-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted dark:bg-zinc-950 p-4">
          <Preview />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-muted/50 dark:bg-white/5">
          <CardHeader>
            <CardTitle className="text-foreground">Variants</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {block.variants.map((v) => (
              <Badge key={v} variant="outline" className="border-border text-muted-foreground">
                {v}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border bg-muted/50 dark:bg-white/5">
          <CardHeader>
            <CardTitle className="text-foreground">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <BlockDetailActions slug={block.slug} source={block.reactSource} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
