/** One point of a chart series: its axis label, a longer label for the tooltip, the value and the previous period's. */
export type SeriesPoint = { l: string; long: string; v: number; p: number };

/** The home page's three ranges. */
export type Range = "Week" | "Month" | "Year";

/** A customer account in the customers table. `active` is minutes since it was last active. */
export type Customer = {
  id: string;
  name: string;
  contact: string;
  email: string;
  plan: string;
  seats: number;
  status: string;
  active: number;
  joined: Date;
  hue: number;
};

export type ChecklistItem = { t: string; done: boolean };
/** A comment on a task, with when it was posted ("2h ago"). */
export type TaskComment = { id: string; who: string; text: string; when: string };

/** A card on the board: its tag (team), priority, assignees, due date, checklist, comments and hours logged per day. */
export type Task = {
  id: string;
  title: string;
  tag: string;
  prio: string;
  who: string[];
  due: Date;
  desc: string;
  list: ChecklistItem[];
  comments: TaskComment[];
  hours: number[];
};

/** Task ids by column id. */
export type Board = Record<string, string[]>;

/** An event on the calendar. */
export type CalEvent = {
  id: string;
  title: string;
  kind: string;
  date: Date;
  time: string;
  who: string[];
  place?: string;
};

export type Notification = { id: string; icon: string; title: string; body: string; when: string; unread: boolean };

/** A transient message at the top of the screen, optionally with Undo. */
export type Toast = { id: number; msg: string; undo?: () => void };

/** Shows a toast; with `undo`, the toast offers Undo and stays a little longer. */
export type ToastFn = (text: string, undo?: () => void) => void;

/** The finance page's ranges. */
export type FinanceRange = "Month" | "Quarter" | "Year";

/** An entry in the command palette. Customers show their initials, tasks their assignee's face. */
export type Command = {
  id: string;
  group: "Pages" | "Actions" | "Customers" | "Tasks";
  label: string;
  sub?: string;
  icon?: string;
  mono?: { name: string; hue: number };
  face?: string;
  run: () => void;
};

export type Theme = "light" | "dark";
