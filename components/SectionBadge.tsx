import Link from "next/link";

/** Section badge — Belen's direction (2026-06). Default: soft burgundy pill.
    Centralized on purpose: the final badge style is pending Belen's pick from
    the playground, so when she chooses, this ONE component changes and every
    section pill across the site (detail pages, and later the cards) updates.

    Pass `field` to forward a data-tina-field for contextual editing. */
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
    "inline-flex items-center rounded-full bg-burgundy/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-burgundy";

  if (href) {
    return (
      <Link
        href={href}
        data-tina-field={field}
        className={`${base} transition-colors hover:bg-burgundy/15 ${className}`}
      >
        {section}
      </Link>
    );
  }

  return (
    <span data-tina-field={field} className={`${base} ${className}`}>
      {section}
    </span>
  );
}
