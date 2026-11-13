import { ItemShell } from "@/components/listing/item-shell";
import { componentGroups } from "@/lib/catalog/listing-groups/components";

/** Every component page keeps the names column beside it, so moving to the next one is one click. */
export default function ComponentsItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <ItemShell title="Components" groups={componentGroups()}>
      {children}
    </ItemShell>
  );
}
