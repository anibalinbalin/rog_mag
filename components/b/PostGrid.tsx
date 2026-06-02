import PostCard from "./PostCard";
import type { Post } from "@/lib/blog";

/** Codex post-grid formula: adaptive 1/2/4 columns, dashed top rule,
    dashed internal dividers. */
export default function PostGrid({
  posts,
  columns = 4,
}: {
  posts: Post[];
  columns?: 3 | 4;
}) {
  const colsClass =
    columns === 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="border-t border-dashed border-line-dark pt-10">
      <div className={`grid gap-10 ${colsClass}`}>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
