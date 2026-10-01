/* ---------------------------------------------------------------------------
   Date formatting shared by server and client components. No Node APIs here,
   so client components can import it (unlike src/lib/blog.ts).
   --------------------------------------------------------------------------- */

/** "2026-06-25" → "Jun 25, 2026". Unparseable strings come back unchanged. */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  // timeZone: UTC so "2026-08-28" never displays as the 27th west of Greenwich
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** "2026-06-25" → "Jun 2026". */
export function formatMonthYear(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" });
}
