"use client";

import { tinaField, useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageIdentity from "@/components/PageIdentity";
import PostGrid from "@/components/PostGrid";
import { getSectionByName } from "@/lib/sections";
import type { AuthorQuery } from "@/tina/__generated__/types";
import type { Post } from "@/lib/blog";

interface AuthorClientProps {
  // Tina contextual-editing payload (query + variables + data from databaseClient)
  data: AuthorQuery;
  variables: { relativePath: string };
  query: string;
  // Context resolved server-side (not contextually edited)
  posts: Post[];
}

/** Author profile body — "use client" so useTina can live-update the preview
    inside the Tina admin iframe (contextual editing). */
export default function AuthorClient(props: AuthorClientProps) {
  const { posts } = props;
  const { data } = useTina({
    data: props.data,
    variables: props.variables,
    query: props.query,
  });
  const author = data.author;

  // Derived from live Tina data so the pill updates while editing sections.
  const primarySectionName = (author.sections ?? []).find(Boolean) ?? null;
  const primarySection = primarySectionName
    ? getSectionByName(primarySectionName)
    : null;

  const subtitle =
    [author.role, author.institution].filter(Boolean).join(" · ") || undefined;

  return (
    <>
      <Header compact />

      <main>
        <PageIdentity
          avatar
          avatarSrc={author.photo ?? undefined}
          avatarField={tinaField(author, "photo")}
          pill={
            primarySection ? `Escribe en ${primarySection.name}` : undefined
          }
          pillHref={
            primarySection ? `/secciones/${primarySection.slug}` : undefined
          }
          pillField={tinaField(author, "sections")}
          title={author.name}
          titleField={tinaField(author, "name")}
          subtitle={subtitle}
          subtitleField={tinaField(author, "role")}
          bio={author.body ? <TinaMarkdown content={author.body} /> : undefined}
          bioField={tinaField(author, "body")}
          links={
            author.linkedin
              ? [{ label: "LinkedIn", href: author.linkedin }]
              : undefined
          }
          linksField={tinaField(author, "linkedin")}
        />

        <section className="mx-auto max-w-[1280px] px-4 pb-24 pt-6 lg:pb-32">
          {posts.length > 0 ? (
            <PostGrid posts={posts} />
          ) : (
            <p className="border-t border-dashed border-line-dark pt-10 text-center font-serif text-lg text-ink-muted">
              Este autor aún no tiene publicaciones.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
