import Link from "next/link";
import type { Post } from "@/lib/blog";
import { formatDate } from "@/lib/blog";

/** Related posts as a calm vertical list (every.to under-article pattern) —
    a continuation of reading, not another homepage grid. */
export default function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="border-t border-dashed border-line-dark pt-10">
      <p className="text-xs uppercase tracking-widest text-ink-muted">
        Lecturas relacionadas
      </p>
      <div className="mt-4 divide-y divide-line">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/publicaciones/${post.slug}`}
            className="group block py-6"
          >
            <p className="text-xs uppercase tracking-widest text-ink-muted">
              {post.section} · {post.category}
            </p>
            <p className="mt-2 font-serif text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-ink-soft">
              {post.title}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-medium text-ink">{post.author}</span>
              <span className="text-ink-muted"> · {formatDate(post.date)}</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
