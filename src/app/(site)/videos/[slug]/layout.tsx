import { ItemShell } from "@/components/listing/item-shell";
import { videoGroups } from "@/lib/catalog/listing-groups/videos";

/** Every video page keeps the names column beside it, so moving to the next one is one click. */
export default function VideosItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <ItemShell title="Videos" groups={videoGroups()}>
      {children}
    </ItemShell>
  );
}
