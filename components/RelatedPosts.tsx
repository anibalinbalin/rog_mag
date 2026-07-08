import Link from "next/link";
import SectionBadge from "@/components/SectionBadge";
import type { Post } from "@/lib/blog";
import { formatDate } from "@/lib/format";

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
            <div className="flex items-center gap-3">
              <SectionBadge section={post.section} />
              <span className="text-[11px] uppercase tracking-widest text-ink-muted">
                {post.category}
              </span>
            </div>
            <p className="mt-2 font-serif text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-ink-soft">
              {post.title}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-serif text-base italic text-burgundy">
                {post.author}
              </span>
              <span className="text-ink-muted"> · {formatDate(post.date)}</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
