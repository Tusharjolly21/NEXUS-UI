import { ItemShell } from "@/components/listing/item-shell";
import { componentGroups } from "@/lib/catalog/listing-groups/components";
import { totalOf } from "@/lib/catalog/listing-groups/total";

/** Every component page keeps the names column beside it, so moving to the next one is one click. */
export default function ComponentsItemLayout({ children }: { children: React.ReactNode }) {
  return (
    // "All components" counts what the wall it links to shows, which leaves out the "For fun" toys
    <ItemShell title="Components" groups={componentGroups()} total={totalOf(componentGroups(undefined, { withFun: false }))}>
      {children}
    </ItemShell>
  );
}
