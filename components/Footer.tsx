import Link from "next/link";
import SubscribeBox from "@/components/SubscribeBox";

/** every.to-style footer: ink band, newsletter block left, link columns right. */
export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[1280px] px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:gap-24">
          {/* Newsletter block */}
          <div className="max-w-md">
            <p className="font-serif text-2xl tracking-wide">REVISTA DCE</p>
            <p className="mt-4 font-serif text-xl leading-snug">
              Regístrese para recibir nuestras publicaciones y novedades
              editoriales.
            </p>
            <p className="mt-3 text-sm text-paper/60">
              Una comunidad de análisis jurídico y pensamiento comercial
              contemporáneo.
            </p>
            <form className="mt-6 flex" action="#">
              <input
                type="email"
                required
                placeholder="Ingresar correo electrónico"
                className="w-full border border-paper/30 bg-transparent px-4 py-3 text-sm text-paper outline-none placeholder:text-paper/40 focus:border-paper"
              />
              <button
                type="submit"
                className="shrink-0 bg-paper px-6 py-3 text-sm text-ink transition-opacity hover:opacity-85"
              >
                Suscribirme
              </button>
            </form>
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
                    href="/revista"
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
