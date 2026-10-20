"use client";

import SimpleSidebar from "@/components/blocks/sidebar/simple-sidebar";
import CollapsibleSidebar, { type CollapsibleSidebarProps } from "@/components/blocks/sidebar/collapsible-sidebar";
import GroupedSidebar, { type GroupedSidebarProps } from "@/components/blocks/sidebar/grouped-sidebar";
import { CollapsingRail, type CollapsingRailProps } from "@/components/blocks/motion-kit/collapsing-rail";
import type { BlockPlaygrounds } from "./types";

/*
 * `defaultCollapsed` and `defaultActive` only set the starting state, so the stages remount the
 * real component when one of them changes. Everything else is passed through untouched.
 */

function CollapsibleSidebarStage(props: CollapsibleSidebarProps) {
  return <CollapsibleSidebar key={String(Boolean(props.defaultCollapsed))} {...props} />;
}

function GroupedSidebarStage(props: GroupedSidebarProps) {
  return <GroupedSidebar key={String(Boolean(props.defaultCollapsed))} {...props} />;
}

/** The default accent means "not set", so the rail keeps its own light/dark pair (#0071e3 / #0a84ff). */
function CollapsingRailStage({ accent, defaultActive, ...props }: CollapsingRailProps) {
  const custom = accent?.trim() && accent.trim().toLowerCase() !== "#0071e3" ? accent : undefined;
  return <CollapsingRail key={defaultActive ?? "analytics"} defaultActive={defaultActive} accent={custom} {...props} />;
}

const playgrounds: BlockPlaygrounds = {
  "sidebar-simple": {
    Component: SimpleSidebar,
    jsxName: "SimpleSidebar",
    importLine: `import SimpleSidebar from "@/components/blocks/sidebar/simple-sidebar";`,
    props: [
      { name: "workspaceName", type: "string", description: "Workspace name in the sidebar header; its first letter fills the logo tile.", defaultValue: `"Nexus Labs"` },
      { name: "accent", type: "string", description: "Selection pill, row icons, focus ring and the latest revenue bar. Left at #0071e3 the icons keep their #2997ff dark-mode tint.", defaultValue: `"#0071e3"` },
      { name: "greeting", type: "string", description: "Dashboard headline.", defaultValue: `"Good morning, Alex"` },
      { name: "dateLabel", type: "string", description: "Small line above the dashboard headline.", defaultValue: `"Tuesday, 14 October"` },
      { name: "userName", type: "string", description: "Account name in the footer; its initials fill the monogram.", defaultValue: `"Alex Morgan"` },
      { name: "userEmail", type: "string", description: "Line under the account name.", defaultValue: `"alex@nexuslabs.io"` },
      { name: "compactBreakpoint", type: "number", description: "Frame width (px) below which the sidebar becomes a slide-over drawer.", defaultValue: "640", min: 320, max: 1200, step: 20 },
      { name: "sections", type: "SimpleSidebarSection[]", description: "Navigation groups ({ id, title, items: { id, label, icon, badge?, active? }[] }). Mark one item active to start on it.", defaultValue: "SIMPLE_SIDEBAR_SECTIONS" },
      { name: "className", type: "string", description: "Classes for the 560px-tall frame, e.g. a different height or radius." },
    ],
  },

  "sidebar-collapsible": {
    Component: CollapsibleSidebarStage,
    jsxName: "CollapsibleSidebar",
    importLine: `import CollapsibleSidebar from "@/components/blocks/sidebar/collapsible-sidebar";`,
    props: [
      { name: "defaultCollapsed", type: "boolean", description: "Start with the sidebar folded down to a 64px icon rail.", defaultValue: "false" },
      { name: "className", type: "string", description: "Classes for the 560px-tall frame." },
    ],
  },

  "sidebar-grouped": {
    Component: GroupedSidebarStage,
    jsxName: "GroupedSidebar",
    importLine: `import GroupedSidebar from "@/components/blocks/sidebar/grouped-sidebar";`,
    props: [
      { name: "defaultCollapsed", type: "boolean", description: "Start with the sidebar folded down to a 64px icon rail.", defaultValue: "false" },
      { name: "defaultOpenGroups", type: "string[]", description: `Group ids that start disclosed: "platform", "workspace", "team".`, defaultValue: `["platform"]` },
      { name: "className", type: "string", description: "Classes for the 560px-tall frame." },
    ],
  },

  "mk-collapsing-rail": {
    Component: CollapsingRailStage,
    jsxName: "CollapsingRail",
    importLine: `import { CollapsingRail } from "@/components/blocks/motion-kit/collapsing-rail";`,
    props: [
      { name: "workspace", type: "string", description: "Workspace name in the header, logo tile and breadcrumb.", defaultValue: `"Northwind"` },
      { name: "accent", type: "string", description: "Active icon, badges, logo tile and storage bar. Left at #0071e3 it switches to #0a84ff in dark mode.", defaultValue: `"#0071e3"` },
      { name: "defaultActive", type: `"home" | "inbox" | "analytics" | "customers" | "settings"`, description: "Item selected on first render (a project name also works).", defaultValue: `"analytics"` },
      { name: "autoplay", type: "boolean", description: "Walks through items and folds the rail by itself until the visitor touches the section.", defaultValue: "false" },
      { name: "onNavigate", type: "(id: string) => void", description: "Runs when a nav item or project is chosen." },
      { name: "onUpgrade", type: "() => void", description: "Runs from the Upgrade plan link in the storage card." },
      { name: "className", type: "string", description: "Classes for the outer section." },
    ],
  },
};

export default playgrounds;
