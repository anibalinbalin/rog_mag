import Image from "next/image";
import Link from "next/link";

/** every.to-style footer: ink band, brand block left, link columns right. */
export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[1280px] px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:gap-24">
          {/* Brand block */}
          <div className="max-w-md">
            <Image
              src="/logo-rdcydle-footer.svg"
              alt="Revista de Derecho Comercial y de la Empresa"
              width={244}
              height={149}
              className="h-24 w-auto"
            />
            <p className="mt-8 text-xs text-paper/40">
              © 2026 Revista de Derecho Comercial y de la Empresa
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-16">
            <div>
              <p className="text-xs uppercase tracking-widest text-paper/40">
                Secciones
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-paper/80 transition-colors hover:text-paper"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/publicaciones"
                    className="text-sm text-paper/80 transition-colors hover:text-paper"
                  >
                    Publicaciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/revistas"
                    className="text-sm text-paper/80 transition-colors hover:text-paper"
                  >
                    Revista
                  </Link>
                </li>
                <li>
                  <Link
                    href="/secciones/noticias"
                    className="text-sm text-paper/80 transition-colors hover:text-paper"
                  >
                    Noticias
                  </Link>
                </li>
                <li>
                  <Link
                    href="/buscar"
                    className="text-sm text-paper/80 transition-colors hover:text-paper"
                  >
                    Buscar
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-paper/40">
                Institucional
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/nosotros"
                    className="text-sm text-paper/80 transition-colors hover:text-paper"
                  >
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legales"
                    className="text-sm text-paper/80 transition-colors hover:text-paper"
                  >
                    Legales
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
