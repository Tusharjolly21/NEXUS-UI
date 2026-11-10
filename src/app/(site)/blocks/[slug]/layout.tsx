import { ItemShell } from "@/components/listing/item-shell";
import { blockGroups } from "@/lib/catalog/listing-groups/blocks";

/** Every block page keeps the names column beside it, so moving to the next one is one click. */
export default function BlocksItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <ItemShell title="Blocks" groups={blockGroups()}>
      {children}
    </ItemShell>
  );
}
