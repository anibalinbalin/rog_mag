import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscribeBox from "@/components/SubscribeBox";
import { getAllPosts, getPostWithHtml, formatDate } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostWithHtml(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Revista de Derecho Comercial y de la Empresa`,
    description: post.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostWithHtml(slug);
  if (!post) notFound();

  return (
    <>
      <Header />

      <main>
        <article className="mx-auto max-w-2xl px-6 py-14">
          {/* Substack-style article header */}
          <header>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-ink">
              {post.title}
            </h1>
            <p className="mt-4 font-serif text-xl leading-relaxed text-ink-muted">
              {post.excerpt}
            </p>
            <div className="mt-8 flex items-center gap-3 border-y border-line py-4">
              <p className="text-sm">
                <span className="font-medium text-ink">{post.author}</span>
                {post.authorRole && (
                  <span className="text-ink-muted"> · {post.authorRole}</span>
                )}
                <span className="text-ink-muted">
                  {" "}
                  · {formatDate(post.date)}
                </span>
              </p>
            </div>
          </header>

          {/* Safe: HTML comes from local repo markdown via remark-html, which
              sanitizes by default (hast-util-sanitize). No untrusted input. */}
          <div
            className="prose-article mt-10"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* Subscribe CTA at end of article — Substack pattern */}
          <div className="mt-16 border border-line bg-paper-warm p-8 text-center">
            <p className="font-serif text-xl text-ink">
              Regístrese para recibir nuestras publicaciones
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Una comunidad de análisis jurídico y pensamiento comercial
              contemporáneo.
            </p>
            <div className="mt-6">
              <SubscribeBox centered />
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
