import { ItemShell } from "@/components/listing/item-shell";
import { iconGroups } from "@/lib/catalog/listing-groups/icons";

/** Every icon page keeps the names column beside it, so moving to the next one is one click. */
export default function IconsItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <ItemShell title="Icons" groups={iconGroups()}>
      {children}
    </ItemShell>
  );
}
