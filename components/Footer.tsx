import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-2xl px-6">
        <div className="flex items-center justify-between border-t border-line py-10">
          <p className="text-sm text-ink-muted">
            © 2026 Revista de Derecho Comercial y de la Empresa
          </p>
          <Link
            href="/legales"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Legales
          </Link>
        </div>
      </div>
    </footer>
  );
}
