"use client";

import Link from "next/link";
import Image from "next/image";
import { tinaField, useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedPosts from "@/components/RelatedPosts";
import SectionBadge from "@/components/SectionBadge";
import { formatDate } from "@/lib/format";
import type { PostQuery } from "@/tina/__generated__/types";
import type { Post } from "@/lib/blog";
import type { Author } from "@/lib/authors";
import type { Section } from "@/lib/sections";
import type { Issue } from "@/lib/issues";

interface ArticleClientProps {
  // Tina contextual-editing payload (query + variables + data from databaseClient)
  data: PostQuery;
  variables: { relativePath: string };
  query: string;
  // Context resolved server-side (not contextually edited)
  author: Author | null;
  section: Section | null;
  related: Post[];
  currentIssue: Issue | null;
}

/** Article page body — "use client" so useTina can live-update the preview
    inside the Tina admin iframe (contextual editing). Outside the admin it
    renders the static data exactly like a server component would. */
export default function ArticleClient(props: ArticleClientProps) {
  const { author, section, related, currentIssue } = props;
  const { data } = useTina({
    data: props.data,
    variables: props.variables,
    query: props.query,
  });
  const post = data.post;

  return (
    <>
      <Header compact />

      {/* Warm paper reading background — every.to article mode */}
      <main className="bg-paper-warm/40">
        {/* Full-width cover band — uploaded image, or cream placeholder */}
        <div className="mx-auto max-w-[1248px] px-4 pt-12">
          <div
            data-tina-field={tinaField(post, "coverImage")}
            className="relative aspect-[16/9] w-full overflow-hidden bg-paper-cream"
          >
            {post.coverImage && (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 1280px) 1216px, 100vw"
                className="object-cover"
              />
            )}
          </div>
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
                    <span
                      data-tina-field={tinaField(post, "author")}
                      className="font-serif text-base italic text-burgundy transition-colors group-hover:text-burgundy-dark"
                    >
                      {post.author}
                    </span>
                    <p className="mt-2 text-sm text-ink-muted">
                      {author.role} · {author.institution}
                    </p>
                  </Link>
                ) : (
                  <div className="mt-2">
                    <span
                      data-tina-field={tinaField(post, "author")}
                      className="font-serif text-base italic text-burgundy"
                    >
                      {post.author}
                    </span>
                    {post.authorRole && (
                      <p
                        data-tina-field={tinaField(post, "authorRole")}
                        className="mt-2 text-sm text-ink-muted"
                      >
                        {post.authorRole}
                      </p>
                    )}
                  </div>
                )}

                <p className="mt-8 text-xs uppercase tracking-widest text-ink-muted">
                  Publicado
                </p>
                <p
                  data-tina-field={tinaField(post, "date")}
                  className="mt-2 text-sm text-ink-soft"
                >
                  {formatDate(post.date)}
                </p>

                <p className="mt-8 text-xs uppercase tracking-widest text-ink-muted">
                  Sección
                </p>
                {section ? (
                  <Link
                    href={`/secciones/${section.slug}`}
                    data-tina-field={tinaField(post, "section")}
                    className="mt-2 block text-sm text-ink-soft underline-offset-4 transition-colors hover:text-burgundy hover:underline"
                  >
                    {post.section}
                  </Link>
                ) : (
                  <p
                    data-tina-field={tinaField(post, "section")}
                    className="mt-2 text-sm text-ink-soft"
                  >
                    {post.section}
                  </p>
                )}

                <p className="mt-8 text-xs uppercase tracking-widest text-ink-muted">
                  Tema
                </p>
                <p
                  data-tina-field={tinaField(post, "category")}
                  className="mt-2 text-sm text-ink-soft"
                >
                  {post.category}
                </p>

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
              <div className="flex flex-wrap items-center gap-3">
                <SectionBadge
                  section={post.section}
                  field={tinaField(post, "section")}
                  href={section ? `/secciones/${section.slug}` : undefined}
                />
                <span
                  data-tina-field={tinaField(post, "category")}
                  className="text-xs uppercase tracking-widest text-ink-muted"
                >
                  {post.category}
                </span>
              </div>
              <h1
                data-tina-field={tinaField(post, "title")}
                className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl"
              >
                {post.title}
              </h1>
              <p
                data-tina-field={tinaField(post, "excerpt")}
                className="mt-5 font-serif text-xl leading-relaxed text-ink-muted"
              >
                {post.excerpt}
              </p>

              <div className="mt-8 border-y border-line py-4">
                <p className="text-sm">
                  <span
                    data-tina-field={tinaField(post, "author")}
                    className="font-medium text-ink"
                  >
                    {post.author}
                  </span>
                  <span className="text-ink-muted">
                    {" "}
                    · {formatDate(post.date)}
                  </span>
                </p>
              </div>

              {/* Rich-text body — TinaMarkdown renders the same semantic
                  elements (h2/h3/p/ul/ol/blockquote) that .prose-article styles */}
              <div
                data-tina-field={tinaField(post, "body")}
                className="prose-article mt-10"
              >
                <TinaMarkdown content={post.body} />
              </div>

              {/* Post-body modules: related reading */}
              <div className="mt-16 space-y-12">
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
