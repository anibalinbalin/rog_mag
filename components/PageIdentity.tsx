import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

/** Codex page-header formula:
    identity image → title → subtitle/role → relationship pill → bio
    → social links → dashed divider.
    Sections use it institutionally (no avatar); authors personally.
    The optional *Field props carry data-tina-field values so author pages
    can make these elements contextually editable. */
export default function PageIdentity({
  avatar = false,
  avatarSrc,
  avatarField,
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
  avatarSrc?: string;
  avatarField?: string;
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
    <div className="mx-auto max-w-[1280px] px-4 pb-6 pt-12">
      {/* Identity image — uploaded photo, or cream placeholder circle */}
      {avatar && (
        <div
          data-tina-field={avatarField}
          className="relative mb-6 h-36 w-36 overflow-hidden rounded-full bg-paper-cream sm:h-44 sm:w-44"
        >
          {avatarSrc && (
            <Image
              src={avatarSrc}
              alt={title}
              fill
              sizes="176px"
              className="object-cover"
            />
          )}
        </div>
      )}

      {/* Relationship pill */}
      {pill &&
        (pillHref ? (
          <Link
            href={pillHref}
            data-tina-field={pillField}
            className="mb-4 inline-flex items-center rounded-sm bg-burgundy/10 px-3 py-1 text-xs uppercase tracking-widest text-burgundy transition-colors hover:bg-burgundy/15"
          >
            {pill}
          </Link>
        ) : (
          <p
            data-tina-field={pillField}
            className="mb-4 inline-flex items-center rounded-sm bg-burgundy/10 px-3 py-1 text-xs uppercase tracking-widest text-burgundy"
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
          className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-ink-soft"
        >
          {bio}
        </div>
      )}

      {/* Social / action links */}
      {links && links.length > 0 && (
        <div
          data-tina-field={linksField}
          className="mt-6 flex items-center justify-start gap-5"
        >
          {links.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-muted underline underline-offset-4 transition-colors hover:text-burgundy"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
