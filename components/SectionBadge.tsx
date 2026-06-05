import Link from "next/link";

/** Section badge — Belen's pick (2026-06): a burgundy accent bar + the section
    name in burgundy. Centralized on purpose, so every section meta (cards,
    lists, article eyebrow, author roster) stays consistent — change it here and
    it changes everywhere. Pass `field` to forward a data-tina-field. */
export default function SectionBadge({
  section,
  href,
  field,
  className = "",
}: {
  section: string;
  href?: string;
  field?: string;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-burgundy";

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="h-4 w-[3px] shrink-0 rounded-[1px] bg-burgundy"
      />
      {section}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        data-tina-field={field}
        className={`${base} transition-opacity hover:opacity-75 ${className}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <span data-tina-field={field} className={`${base} ${className}`}>
      {inner}
    </span>
  );
}
