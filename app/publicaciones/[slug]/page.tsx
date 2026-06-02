import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedPosts from "@/components/RelatedPosts";
import SubscribeModule from "@/components/SubscribeModule";
import {
  getAllPosts,
  getPostWithHtml,
  getRelatedPosts,
  formatDate,
} from "@/lib/blog";
import { getAuthorByName } from "@/lib/authors";
import { getSectionByName } from "@/lib/sections";
import { getCurrentIssue } from "@/lib/issues";

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

/** Article page — Codex article formula:
    cover → 10-col shell (left author rail / center body / right spacer)
    → subscribe module → related posts → footer. */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostWithHtml(slug);
  if (!post) notFound();

  const author = getAuthorByName(post.author);
  const section = getSectionByName(post.section);
  const related = getRelatedPosts(post);
  const currentIssue = getCurrentIssue();

  return (
    <>
      <Header compact />

      {/* Warm paper reading background — every.to article mode */}
      <main className="bg-paper-warm/40">
        {/* Full-width cover band */}
        <div className="mx-auto max-w-[1248px] px-4 pt-12">
          <div className="aspect-[16/9] w-full bg-paper-cream" />
        </div>

        {/* 10-column article grid */}
        <article className="mx-auto max-w-[1248px] px-4 py-12">
          <div className="grid gap-10 lg:grid-cols-[2fr_6fr_2fr]">
            {/* Left rail: author credentials + issue + citation */}
            <aside className="order-2 lg:order-1">
              <div className="lg:sticky lg:top-32 lg:border-r lg:border-dashed lg:border-line-dark lg:pr-8">
                <p className="text-xs uppercase tracking-widest text-ink-muted">
                  Autor
                </p>
                {author ? (
                  <Link
                    href={`/autores/${author.slug}`}
                    className="group mt-2 block"
                  >
                    <p className="text-sm font-medium text-ink underline-offset-4 group-hover:underline">
                      {post.author}
                    </p>
                    <p className="text-sm text-ink-muted">
                      {author.role} · {author.institution}
                    </p>
                  </Link>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-ink">
                      {post.author}
                    </p>
                    {post.authorRole && (
                      <p className="text-sm text-ink-muted">
                        {post.authorRole}
                      </p>
                    )}
                  </div>
                )}

                <p className="mt-8 text-xs uppercase tracking-widest text-ink-muted">
                  Publicado
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  {formatDate(post.date)}
                </p>

                <p className="mt-8 text-xs uppercase tracking-widest text-ink-muted">
                  Sección
                </p>
                {section ? (
                  <Link
                    href={`/secciones/${section.slug}`}
                    className="mt-2 block text-sm text-ink-soft underline-offset-4 hover:underline"
                  >
                    {post.section}
                  </Link>
                ) : (
                  <p className="mt-2 text-sm text-ink-soft">{post.section}</p>
                )}

                <p className="mt-8 text-xs uppercase tracking-widest text-ink-muted">
                  Tema
                </p>
                <p className="mt-2 text-sm text-ink-soft">{post.category}</p>

                {currentIssue && (
                  <>
                    <p className="mt-8 text-xs uppercase tracking-widest text-ink-muted">
                      Edición
                    </p>
                    <p className="mt-2 text-sm text-ink-soft">
                      {currentIssue.number} ({currentIssue.year}) · Vol.{" "}
                      {currentIssue.volume}
                    </p>
                  </>
                )}
              </div>
            </aside>

            {/* Center: article body */}
            <div className="order-1 lg:order-2">
              <p className="text-xs uppercase tracking-widest text-ink-muted">
                {post.section} · {post.category}
              </p>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                {post.title}
              </h1>
              <p className="mt-5 font-serif text-xl leading-relaxed text-ink-muted">
                {post.excerpt}
              </p>

              <div className="mt-8 border-y border-line py-4">
                <p className="text-sm">
                  <span className="font-medium text-ink">{post.author}</span>
                  <span className="text-ink-muted">
                    {" "}
                    · {formatDate(post.date)}
                  </span>
                </p>
              </div>

              {/* Safe: HTML comes from local repo markdown via remark-html, which
                  sanitizes by default (hast-util-sanitize). No untrusted input. */}
              <div
                className="prose-article mt-10"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />

              {/* Post-body modules: access module → related reading */}
              <div className="mt-16 space-y-12">
                <SubscribeModule />
                <RelatedPosts posts={related} />
              </div>
            </div>

            {/* Right: spacer (actions rail in the future) */}
            <div className="hidden lg:order-3 lg:block" />
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
