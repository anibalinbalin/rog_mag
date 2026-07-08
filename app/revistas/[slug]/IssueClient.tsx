"use client";

import Image from "next/image";
import { tinaField, useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IssueContents from "@/components/IssueContents";
import type { IssueQuery } from "@/tina/__generated__/types";

interface IssueClientProps {
  // Tina contextual-editing payload (query + variables + data from databaseClient)
  data: IssueQuery;
  variables: { relativePath: string };
  query: string;
}

/** Issue detail body — "use client" so useTina can live-update the preview
    inside the Tina admin iframe (contextual editing). */
export default function IssueClient(props: IssueClientProps) {
  const { data } = useTina({
    data: props.data,
    variables: props.variables,
    query: props.query,
  });
  const issue = data.issue;

  const metaParts = [
    issue.volume ? `Vol. ${issue.volume}` : null,
    issue.number,
    issue.season,
  ].filter(Boolean);

  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 pb-24 pt-12 lg:pb-32">
          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            <div>
              <p
                data-tina-field={tinaField(issue, "number")}
                className="text-xs uppercase tracking-widest text-ink-muted"
              >
                {metaParts.join(" · ")}
              </p>
              <h1
                data-tina-field={tinaField(issue, "title")}
                className="mt-4 font-serif text-4xl leading-tight text-ink"
              >
                {issue.number} ({issue.year}): {issue.title}
              </h1>

              {/* Issue description (rich-text body) */}
              {issue.body && (
                <div
                  data-tina-field={tinaField(issue, "body")}
                  className="mt-5 font-serif text-lg leading-relaxed text-ink-muted"
                >
                  <TinaMarkdown content={issue.body} />
                </div>
              )}

              <IssueContents
                doctrina={issue.doctrina}
                deInteres={issue.deInteres}
                actualidadSociedades={issue.actualidadSociedades}
                concursos={issue.concursos}
                doctrinaField={tinaField(issue, "doctrina")}
                deInteresField={tinaField(issue, "deInteres")}
                actualidadSociedadesField={tinaField(issue, "actualidadSociedades")}
                concursosField={tinaField(issue, "concursos")}
              />
            </div>

            <div>
              {/* Cover: a pre-rendered 3D book with its own shadow on a
                  transparent background — object-contain, no cream box,
                  no extra shadow (mirrors app/revistas/page.tsx). */}
              <div
                data-tina-field={tinaField(issue, "cover")}
                className="post-cover-transition relative aspect-[3/4] w-full"
              >
                {issue.cover && (
                  <Image
                    src={issue.cover}
                    alt={`${issue.number} (${issue.year})`}
                    fill
                    sizes="(min-width: 1024px) 300px, 100vw"
                    className="object-contain object-left"
                  />
                )}
              </div>
              <p
                data-tina-field={tinaField(issue, "volume")}
                className="mt-4 text-xs uppercase tracking-widest text-ink-muted"
              >
                Volumen {issue.volume}, N.º {issue.issue}
              </p>
              <p
                data-tina-field={tinaField(issue, "articleCount")}
                className="mt-1 text-xs uppercase tracking-widest text-ink-muted"
              >
                {issue.articleCount} artículos
              </p>
              <a
                href={issue.fcuLink || "#"}
                data-tina-field={tinaField(issue, "fcuLink")}
                {...(issue.fcuLink
                  ? { target: "_blank", rel: "noopener" }
                  : {})}
                className="mt-6 inline-flex w-full items-center justify-center rounded-sm border border-action-dark px-7 py-3 text-sm uppercase tracking-widest text-action-dark transition-colors hover:bg-action-dark hover:text-paper"
              >
                Fundación
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
