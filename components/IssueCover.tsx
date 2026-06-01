import Link from "next/link";
import type { Issue } from "@/lib/issues";

export default function IssueCover({ issue }: { issue: Issue }) {
  return (
    <div className="border border-line bg-paper p-4">
      {/* Cover placeholder */}
      <div className="aspect-[3/4] w-full bg-paper-cream" />

      <p className="mt-4 text-xs uppercase tracking-wide text-ink-muted">
        Volumen {issue.volume}, N.º {issue.issue}
      </p>
      <p className="mt-1 font-serif text-sm font-semibold leading-snug text-ink">
        {issue.title}
      </p>

      <Link
        href={`/revista/${issue.slug}`}
        className="mt-4 block border border-ink-soft py-2 text-center text-sm tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        VER
      </Link>
    </div>
  );
}
