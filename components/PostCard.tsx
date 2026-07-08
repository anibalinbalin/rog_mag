import Link from "next/link";
import Image from "next/image";
import SectionBadge from "@/components/SectionBadge";
import type { Post } from "@/lib/blog";
import { formatDate } from "@/lib/format";

/** every.to collection-card anatomy: cover, metadata row, serif title,
    serif dek, uppercase author row. No card borders — dividers come from
    the parent grid. */
export default function PostCard({
  post,
  size = "default",
}: {
  post: Post;
  size?: "default" | "feature" | "compact";
}) {
  if (size === "compact") {
    return (
      <Link href={`/publicaciones/${post.slug}`} className="group block py-4">
        <p className="font-serif text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-ink-soft">
          {post.title}
        </p>
        <p className="mt-2 font-serif text-sm italic text-burgundy">
          {post.author}
        </p>
      </Link>
    );
  }

  const isFeature = size === "feature";

  return (
    <Link
      href={`/publicaciones/${post.slug}`}
      className={`group block ${isFeature ? "text-center" : ""}`}
    >
      {/* Cover — uploaded image, or cream placeholder like the journal covers */}
      <div
        className={`relative w-full overflow-hidden bg-paper-cream ${
          isFeature ? "aspect-[16/10]" : "aspect-square"
        }`}
      >
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes={
              isFeature
                ? "(min-width: 1024px) 50vw, 100vw"
                : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover"
          />
        )}
      </div>

      {/* Metadata row — accent-bar section + date (Belen's pick) */}
      <div
        className={`mt-5 flex items-center gap-3 ${
          isFeature ? "justify-center" : ""
        }`}
      >
        <SectionBadge section={post.section} />
        <span className="text-[11px] uppercase tracking-widest text-ink-muted">
          {formatDate(post.date)}
        </span>
      </div>

      {/* Title */}
      <h3
        className={`mt-3 font-serif font-semibold leading-tight text-ink transition-colors group-hover:text-ink-soft ${
          isFeature ? "text-3xl sm:text-4xl" : "text-2xl"
        }`}
      >
        {post.title}
      </h3>

      {/* Dek */}
      <p
        className={`mt-3 leading-relaxed text-ink-soft ${
          isFeature ? "mx-auto max-w-xl text-lg" : "text-sm"
        }`}
      >
        {post.excerpt}
      </p>

      {/* Author — same italic serif burgundy byline as the issue contenidos */}
      <div className={`mt-5 ${isFeature ? "text-center" : ""}`}>
        <span className="font-serif text-base italic text-burgundy">
          {post.author}
        </span>
      </div>
    </Link>
  );
}
