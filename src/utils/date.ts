// Returns YYYY-MM-DD in the device's LOCAL timezone, not UTC.
// Using toISOString() for date-only comparisons is the wrong tool —
// it silently shifts dates for anyone not in UTC (e.g. all of India,
// UTC+5:30 — a session at 1 AM local time would log as "yesterday").
export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Whole-day difference between two YYYY-MM-DD local date strings.
export function daysBetween(dateStrA: string, dateStrB: string): number {
  const a = new Date(dateStrA + "T00:00:00");
  const b = new Date(dateStrB + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
