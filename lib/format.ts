/** Client-safe date formatting — no fs/node imports, usable from
    "use client" components (lib/blog.ts re-exports this for server code). */

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/** Format "2026-05-15" or "2026-05-15T00:00:00.000Z" as "Mayo 2026". */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const dayPart = dateString.split("T")[0];
  const date = new Date(dayPart + "T00:00:00");
  if (isNaN(date.getTime())) return "";
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
