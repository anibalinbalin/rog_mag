import Link from "next/link";
import type { Post } from "@/lib/blog";
import { formatDate } from "@/lib/blog";

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
      <Link href={`/b/publicaciones/${post.slug}`} className="group block py-4">
        <p className="font-serif text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-ink-soft">
          {post.title}
        </p>
        <p className="mt-2 text-xs uppercase tracking-widest text-ink-muted">
          {post.author}
        </p>
      </Link>
    );
  }

  const isFeature = size === "feature";

  return (
    <Link
      href={`/b/publicaciones/${post.slug}`}
      className={`group block ${isFeature ? "text-center" : ""}`}
    >
      {/* Cover placeholder — cream, like the journal covers */}
      <div
        className={`w-full bg-paper-cream ${
          isFeature ? "aspect-[16/10]" : "aspect-square"
        }`}
      />

      {/* Metadata row */}
      <p className="mt-5 text-xs uppercase tracking-widest text-ink-muted">
        {formatDate(post.date)} · {post.section}
      </p>

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
        className={`mt-3 font-serif leading-relaxed text-ink-muted ${
          isFeature ? "mx-auto max-w-xl text-lg" : "text-base"
        }`}
      >
        {post.excerpt}
      </p>

      {/* Author row */}
      <p className="mt-4 text-xs uppercase tracking-widest text-ink">
        {post.author}
      </p>
    </Link>
  );
}
