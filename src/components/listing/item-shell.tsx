import * as React from "react";
import { ListingBrowse, ListingSidebar, type SidebarGroup } from "./listing-sidebar";
import { totalOf } from "@/lib/catalog/listing-groups/total";

/**
 * The frame around a single component, block or template: the same names column as its listing page, so the next
 * one is a click away. It lives in the route's layout, so it stays put (open groups, its own scroll) while you move
 * from one page to the next. From 1280px it is a column on the left; below that the page keeps its full width and a
 * small "All components" pill at the bottom left opens the names in a sheet.
 */
export function ItemShell({ title, groups, children }: { title: string; groups: SidebarGroup[]; children: React.ReactNode }) {
  const total = totalOf(groups);
  return (
    <div className="xl:grid xl:w-full xl:grid-cols-[248px_minmax(0,1fr)] xl:gap-2 xl:pl-6 2xl:grid-cols-[264px_minmax(0,1fr)] 2xl:pl-8">
      <div className="hidden xl:block xl:pt-6">
        <ListingSidebar title={title} total={total} groups={groups} />
      </div>
      <div className="min-w-0">{children}</div>
      <ListingBrowse title={title} total={total} groups={groups} floating />
    </div>
  );
}
