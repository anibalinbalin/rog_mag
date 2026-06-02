import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Publicaciones — Revista de Derecho Comercial y de la Empresa",
};

export default function PublicacionesPage() {
  const posts = getAllPosts();

  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-xl font-medium uppercase tracking-wide text-ink">
                Publicaciones
              </h1>
              <p className="mt-1 text-base text-ink-muted">
                Doctrina, jurisprudencia y análisis del derecho comercial.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
