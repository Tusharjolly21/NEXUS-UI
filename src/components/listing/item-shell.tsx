import * as React from "react";
import { ListingBrowse, ListingSidebar, type SidebarGroup } from "./listing-sidebar";
import { ItemPager } from "./item-pager";
import { totalOf } from "@/lib/catalog/listing-groups/total";

/**
 * The frame around a single component, block or template: the same names column as its listing page, so the next
 * one is a click away. It lives in the route's layout, so it stays put (open groups, its own scroll) while you move
 * from one page to the next. From 1280px it is a column on the left; below that a bar at the top of the page says
 * where you are and opens the names in a sheet (with a small pill for it once the bar has scrolled away).
 */
export function ItemShell({
  title,
  groups,
  total: given,
  children,
}: {
  title: string;
  groups: SidebarGroup[];
  /** The count beside "All <title>", when the listing page it links to shows fewer than this column (the components wall leaves out the "For fun" toys). */
  total?: number;
  children: React.ReactNode;
}) {
  const total = given ?? totalOf(groups);
  return (
    <div className="relative xl:grid xl:w-full xl:grid-cols-[248px_minmax(0,1fr)] xl:gap-2 xl:pl-6 2xl:grid-cols-[264px_minmax(0,1fr)] 2xl:pl-8">
      {/* with the column beside it, the page's top glow is drawn once across the full width (the page's own would
          stop at the column's edge and leave a seam) */}
      <div aria-hidden className="pg-dotgrid pointer-events-none absolute inset-x-0 -top-[64px] hidden h-[700px] [mask-image:linear-gradient(black_55%,transparent)] xl:block">
        <div className="pg-bloom absolute inset-0" />
      </div>
      <div className="relative hidden xl:block xl:pt-6">
        <ListingSidebar title={title} total={total} groups={groups} />
      </div>
      {/* beside the column the page's sections may run wider than their usual 1152px */}
      <div className="relative min-w-0 xl:[--item-w:1280px] 2xl:[--item-w:1360px] xl:[&_section.pg-dotgrid]:[background:none] xl:[&_section.pg-dotgrid>.pg-bloom]:hidden">
        <ListingBrowse title={title} total={total} groups={groups} floating />
        {children}
        <ItemPager groups={groups} title={title} />
      </div>
    </div>
  );
}
