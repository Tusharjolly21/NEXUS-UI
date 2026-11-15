export const TODAY = new Date(2026, 10, 13);

export const DAY_MS = 864e5;

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const formatShortDate = (date: Date) => `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;

export const formatDayDate = (date: Date) =>
  `${WEEKDAYS_SHORT[date.getDay()]}, ${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;

/** The days shown for a month: whole weeks from the Monday on or before the 1st. */
export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const start = addDays(first, -lead);
  const weeks = Math.ceil((lead + new Date(year, month + 1, 0).getDate()) / 7);
  return Array.from(
    {
      length: weeks * 7,
    },
    (a, index) => addDays(start, index),
  );
}
