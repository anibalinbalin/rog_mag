import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { getAllPosts, getPostsBySection } from "@/lib/blog";
import { getCurrentIssue } from "@/lib/issues";
import { sections } from "@/lib/sections";

export const metadata = {
  title: "Revista de Derecho Comercial y de la Empresa",
  description:
    "Análisis jurídico y pensamiento comercial contemporáneo.",
};

export default function HomePage() {
  const posts = getAllPosts();
  const currentIssue = getCurrentIssue();

  const [feature, ...rest] = posts;
  const secondary = rest.slice(0, 2);
  const recent = posts.slice(0, 4);

  return (
    <>
      <Header />

      <main>
        {/* Asymmetrical feature grid — every.to's signature pattern:
            secondary stories left, dominant feature center, recent list right.
            Dashed dividers, not cards. */}
        <section className="mx-auto max-w-[1280px] px-4 py-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr_1fr] lg:gap-0">
            {/* Left: secondary stories */}
            <div className="flex flex-col gap-10 lg:border-r lg:border-dashed lg:border-line-dark lg:pr-8">
              {secondary.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>

            {/* Center: dominant feature */}
            <div className="lg:px-8">
              {feature && <PostCard post={feature} size="feature" />}
            </div>

            {/* Right: recent essays + current issue */}
            <div className="lg:border-l lg:border-dashed lg:border-line-dark lg:pl-8">
              <p className="text-xs uppercase tracking-widest text-ink-muted">
                Recientes
              </p>
              <div className="mt-2 divide-y divide-line">
                {recent.map((post) => (
                  <PostCard key={post.slug} post={post} size="compact" />
                ))}
              </div>

              {currentIssue && (
                <div className="mt-10 border-t border-dashed border-line-dark pt-8">
                  <p className="text-xs uppercase tracking-widest text-ink-muted">
                    Última edición
                  </p>
                  <Link
                    href={`/revista`}
                    className="group mt-4 block"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-cream">
                      {currentIssue.cover && (
                        <Image
                          src={currentIssue.cover}
                          alt={`${currentIssue.number} (${currentIssue.year})`}
                          fill
                          sizes="(min-width: 1024px) 300px, 100vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="mt-4 font-serif text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-ink-soft">
                      {currentIssue.number} ({currentIssue.year})
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-widest text-ink-muted">
                      Volumen {currentIssue.volume} · N.º {currentIssue.issue}
                    </p>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Per-section rows — every.to section rhythm:
            uppercase header + description + arrow, then 4-col grid */}
        {sections.map((section) => {
          const sectionPosts = getPostsBySection(section.name);
          if (sectionPosts.length === 0) return null;

          return (
            <section
              key={section.slug}
              className="mx-auto max-w-[1280px] border-t border-line px-4 py-12"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="text-xl font-medium uppercase tracking-wide text-ink">
                    {section.name}
                  </h2>
                  <p className="mt-1 text-base text-ink-muted">
                    {section.tagline}
                  </p>
                </div>
                <Link
                  href={`/secciones/${section.slug}`}
                  className="shrink-0 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  Ver sección →
                </Link>
              </div>

              <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {sectionPosts.slice(0, 4).map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />
    </>
  );
}
