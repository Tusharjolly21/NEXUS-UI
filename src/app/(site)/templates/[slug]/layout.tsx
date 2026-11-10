import { ItemShell } from "@/components/listing/item-shell";
import { templateGroups } from "@/lib/catalog/listing-groups/templates";

/** Every template page keeps the names column beside it, so moving to the next one is one click. */
export default function TemplatesItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <ItemShell title="Templates" groups={templateGroups()}>
      {children}
    </ItemShell>
  );
}
