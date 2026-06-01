import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostListItem from "@/components/PostListItem";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Publicaciones — Revista de Derecho Comercial y de la Empresa",
};

export default function PublicacionesPage() {
  const posts = getAllPosts();

  return (
    <>
      <Header />

      <main>
        <section className="mx-auto max-w-2xl px-6 pb-20 pt-10">
          <h1 className="font-serif text-3xl text-ink">Publicaciones</h1>

          <div className="mt-4 divide-y divide-line">
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
