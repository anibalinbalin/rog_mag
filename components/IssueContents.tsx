const AUTHOR_SEPARATOR = " — ";

/** Splits "Título — Autor" into its parts. Falls back to a title-only
    render when an item has no separator. Compound authors ("X y Y") are
    split into individual names so each gets its own pill. */
function parseContentItem(item: string) {
  const sepIndex = item.indexOf(AUTHOR_SEPARATOR);
  if (sepIndex === -1) {
    return { title: item, authors: [] as string[] };
  }
  const title = item.slice(0, sepIndex);
  const authorText = item.slice(sepIndex + AUTHOR_SEPARATOR.length);
  const authors = authorText.split(" y ").map((a) => a.trim());
  return { title, authors };
}

function ContentItem({ item }: { item: string }) {
  const { title, authors } = parseContentItem(item);
  return (
    <li className="font-serif text-lg text-ink-soft">
      {title}
      {authors.length > 0 && (
        <span className="mt-1.5 flex flex-wrap gap-1.5">
          {authors.map((author) => (
            <span
              key={author}
              className="inline-flex items-center rounded-full bg-burgundy/10 px-3 py-1 font-sans text-xs text-burgundy"
            >
              {author}
            </span>
          ))}
        </span>
      )}
    </li>
  );
}

/** Issue table of contents — Doctrina + De interés + Actualidad Sociedades
    Comerciales + Concursos lists. Shared by the revista landing (current
    issue) and issue detail pages. The optional *Field props carry
    data-tina-field values so the issue detail page can make these lists
    contextually editable. */
export default function IssueContents({
  doctrina,
  deInteres,
  actualidadSociedades,
  concursos,
  doctrinaField,
  deInteresField,
  actualidadSociedadesField,
  concursosField,
}: {
  doctrina?: (string | null)[] | null;
  deInteres?: (string | null)[] | null;
  actualidadSociedades?: (string | null)[] | null;
  concursos?: (string | null)[] | null;
  doctrinaField?: string;
  deInteresField?: string;
  actualidadSociedadesField?: string;
  concursosField?: string;
}) {
  const doctrinaItems = (doctrina ?? []).filter((i): i is string => Boolean(i));
  const deInteresItems = (deInteres ?? []).filter((i): i is string =>
    Boolean(i)
  );
  const actualidadSociedadesItems = (actualidadSociedades ?? []).filter(
    (i): i is string => Boolean(i)
  );
  const concursosItems = (concursos ?? []).filter((i): i is string =>
    Boolean(i)
  );

  return (
    <>
      <h2 className="mt-10 text-xl font-medium uppercase tracking-wide text-ink">
        Contenido
      </h2>

      <div className="mt-5" data-tina-field={doctrinaField}>
        <p className="text-xs font-medium uppercase tracking-widest text-burgundy">
          Doctrina
        </p>
        <ul className="mt-3 space-y-3">
          {doctrinaItems.map((item) => (
            <ContentItem key={item} item={item} />
          ))}
        </ul>
      </div>

      {deInteresItems.length > 0 && (
        <div className="mt-8" data-tina-field={deInteresField}>
          <p className="text-xs font-medium uppercase tracking-widest text-burgundy">
            De interés
          </p>
          <ul className="mt-3 space-y-3">
            {deInteresItems.map((item) => (
              <ContentItem key={item} item={item} />
            ))}
          </ul>
        </div>
      )}

      {actualidadSociedadesItems.length > 0 && (
        <div className="mt-8" data-tina-field={actualidadSociedadesField}>
          <p className="text-xs font-medium uppercase tracking-widest text-burgundy">
            Actualidad Sociedades Comerciales
          </p>
          <ul className="mt-3 space-y-3">
            {actualidadSociedadesItems.map((item) => (
              <ContentItem key={item} item={item} />
            ))}
          </ul>
        </div>
      )}

      {concursosItems.length > 0 && (
        <div className="mt-8" data-tina-field={concursosField}>
          <p className="text-xs font-medium uppercase tracking-widest text-burgundy">
            Concursos
          </p>
          <ul className="mt-3 space-y-3">
            {concursosItems.map((item) => (
              <ContentItem key={item} item={item} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
