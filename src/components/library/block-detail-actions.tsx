"use client";

import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDiscovery } from "@/hooks/use-discovery";

export function BlockDetailActions({ slug, source }: { slug: string; source: string }) {
  const { toggleBookmark, isBookmarked } = useDiscovery();

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      toast.success("Copied block source");
    } catch {
      toast.error("Clipboard unavailable");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button className="rounded-full bg-white text-zinc-950" type="button" onClick={copy}>
        <Copy className="mr-2 size-4" />
        Copy export
      </Button>
      <Button
        type="button"
        variant="outline"
        className="rounded-full border-border text-foreground"
        onClick={() => toggleBookmark("block", slug)}
      >
        {isBookmarked("block", slug) ? "Bookmarked" : "Bookmark"}
      </Button>
    </div>
  );
}
