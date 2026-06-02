import type { ReactNode } from "react";
import Link from "next/link";

/** Codex page-header formula:
    identity image → title → subtitle/role → relationship pill → bio
    → social links → dashed divider.
    Sections use it institutionally (no avatar); authors personally.
    The optional *Field props carry data-tina-field values so author pages
    can make these elements contextually editable. */
export default function PageIdentity({
  avatar = false,
  pill,
  pillHref,
  pillField,
  title,
  titleField,
  subtitle,
  subtitleField,
  bio,
  bioField,
  links,
  linksField,
}: {
  avatar?: boolean;
  pill?: string;
  pillHref?: string;
  pillField?: string;
  title: string;
  titleField?: string;
  subtitle?: string;
  subtitleField?: string;
  bio?: ReactNode;
  bioField?: string;
  links?: { label: string; href: string }[];
  linksField?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-6 pt-12 text-center">
      {/* Identity image — cream placeholder circle for authors */}
      {avatar && (
        <div className="mx-auto mb-6 h-36 w-36 rounded-full bg-paper-cream sm:h-44 sm:w-44" />
      )}

      {/* Relationship pill */}
      {pill &&
        (pillHref ? (
          <Link
            href={pillHref}
            data-tina-field={pillField}
            className="mb-4 inline-block border border-line px-3 py-1 text-xs uppercase tracking-widest text-ink-muted transition-colors hover:border-line-dark hover:text-ink"
          >
            {pill}
          </Link>
        ) : (
          <p
            data-tina-field={pillField}
            className="mb-4 inline-block border border-line px-3 py-1 text-xs uppercase tracking-widest text-ink-muted"
          >
            {pill}
          </p>
        ))}

      {/* Title */}
      <h1
        data-tina-field={titleField}
        className="font-serif text-4xl leading-tight text-ink sm:text-5xl"
      >
        {title}
      </h1>

      {/* Subtitle / tagline / role */}
      {subtitle && (
        <p
          data-tina-field={subtitleField}
          className="mt-4 text-sm uppercase tracking-widest text-ink-muted"
        >
          {subtitle}
        </p>
      )}

      {/* Bio / description — div (not p) so rich-text children nest validly */}
      {bio && (
        <div
          data-tina-field={bioField}
          className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-ink-soft"
        >
          {bio}
        </div>
      )}

      {/* Social / action links */}
      {links && links.length > 0 && (
        <div
          data-tina-field={linksField}
          className="mt-6 flex items-center justify-center gap-5"
        >
          {links.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
