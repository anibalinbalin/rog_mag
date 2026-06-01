import Link from "next/link";
import type { Post } from "@/lib/blog";
import { formatDate } from "@/lib/blog";

export default function PostListItem({ post }: { post: Post }) {
  return (
    <article className="py-10">
      <p className="text-xs uppercase tracking-widest text-ink-muted">
        {post.category}
      </p>
      <h2 className="mt-2 font-serif text-2xl font-semibold leading-snug text-ink sm:text-[1.75rem]">
        <Link
          href={`/publicaciones/${post.slug}`}
          className="transition-colors hover:text-ink-soft"
        >
          {post.title}
        </Link>
      </h2>
      <p className="mt-3 text-base leading-relaxed text-ink-muted">
        {post.excerpt}
      </p>
      <p className="mt-4 text-sm">
        <span className="font-medium text-ink">{post.author}</span>
        <span className="text-ink-muted"> · {formatDate(post.date)}</span>
      </p>
    </article>
  );
}
