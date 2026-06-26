import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicacionesSearch from "@/components/PublicacionesSearch";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Publicaciones — Revista de Derecho Comercial y de la Empresa",
};

export default function PublicacionesPage() {
  // Lightweight shape for the client list (drops the full markdown body).
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    author: p.author,
    date: p.date,
    section: p.section,
    coverImage: p.coverImage,
  }));

  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 py-12 lg:py-16">
          {/* Title + search + searchable list */}
          <PublicacionesSearch posts={posts} />
        </section>
      </main>

      <Footer />
    </>
  );
}
