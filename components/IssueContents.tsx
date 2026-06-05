/** Issue table of contents — Doctrina + De interés lists.
    Shared by the revista landing (current issue) and issue detail pages.
    The optional *Field props carry data-tina-field values so the issue
    detail page can make these lists contextually editable. */
export default function IssueContents({
  doctrina,
  deInteres,
  doctrinaField,
  deInteresField,
}: {
  doctrina?: (string | null)[] | null;
  deInteres?: (string | null)[] | null;
  doctrinaField?: string;
  deInteresField?: string;
}) {
  const doctrinaItems = (doctrina ?? []).filter((i): i is string => Boolean(i));
  const deInteresItems = (deInteres ?? []).filter((i): i is string =>
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
        <ul className="mt-3 space-y-2">
          {doctrinaItems.map((item) => (
            <li key={item} className="font-serif text-lg text-ink-soft">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {deInteresItems.length > 0 && (
        <div className="mt-8" data-tina-field={deInteresField}>
          <p className="text-xs font-medium uppercase tracking-widest text-burgundy">
            De interés
          </p>
          <ul className="mt-3 space-y-2">
            {deInteresItems.map((item) => (
              <li key={item} className="font-serif text-lg text-ink-soft">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
