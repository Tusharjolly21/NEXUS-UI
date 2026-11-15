"use client";

/**
 * Meridian: an operations workspace for a small software company, in a dark theme with a light one a click away
 * (it spreads from the click as a circle). Home has revenue against the previous period as two smooth lines that
 * morph between week, month and year, KPI cards with sparklines, net new MRR bars, half a year of releases as a
 * heatmap, the newest hires, and a customers table you can search, filter, sort, select, bulk-edit, archive with Undo
 * and export as CSV. Board is a kanban whose cards tilt with your drag speed and can be moved with the keyboard, with a
 * task panel of checklist, assignees, hours and comments. Finance shows cash flowing from income sources through to
 * spending, budgets as rings and recent transactions; Calendar is a month that slides, with filters and a day panel to
 * add events. A command palette (Ctrl K) reaches every page, action, customer and task.
 *
 * Meridian, Fieldnote and every person, customer, figure and event are invented sample content. The icons are
 * Phosphor (MIT), the avatars are DiceBear Notionists (CC0), and Inter and Geist Mono are self-hosted.
 */

import { MotionConfig } from "framer-motion";
import { MeridianApp } from "./meridian/app";

export function MeridianPage() {
  return (
    <MotionConfig reducedMotion="user">
      <MeridianApp />
    </MotionConfig>
  );
}
