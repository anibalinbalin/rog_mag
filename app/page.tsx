import { MastheadHeader } from "@/components/Header";
import Footer from "@/components/Footer";
import PostListItem from "@/components/PostListItem";
import { getAllPosts } from "@/lib/blog";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <>
      <MastheadHeader />

      <main>
        <section className="mx-auto max-w-2xl px-6 pb-20 pt-4">
          <div className="divide-y divide-line">
            {posts.map((post) => (
              <PostListItem key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
