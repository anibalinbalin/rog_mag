import type { Issue } from "@/lib/issues";

/** Issue table of contents — Doctrina + De interés lists.
    Shared by the revista landing (current issue) and issue detail pages. */
export default function IssueContents({ issue }: { issue: Issue }) {
  return (
    <>
      <h2 className="mt-10 text-xl font-medium uppercase tracking-wide text-ink">
        Contenido
      </h2>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-widest text-ink-muted">
          Doctrina
        </p>
        <ul className="mt-3 space-y-2">
          {issue.doctrina.map((item) => (
            <li key={item} className="font-serif text-lg text-ink-soft">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {issue.deInteres.length > 0 && (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-widest text-ink-muted">
            De interés
          </p>
          <ul className="mt-3 space-y-2">
            {issue.deInteres.map((item) => (
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
