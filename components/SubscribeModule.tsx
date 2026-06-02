import SubscribeBox from "@/components/SubscribeBox";

/** Toned-down access module (Codex's suggestion): institutional invitation
    rather than product-heavy promotion. Sits after the article body. */
export default function SubscribeModule() {
  return (
    <div className="border-t border-dashed border-line-dark pt-10">
      <div className="bg-paper-warm p-10 text-center">
        <p className="font-serif text-2xl leading-snug text-ink">
          Suscríbase para acceder al número completo
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          Reciba las publicaciones de la Revista de Derecho Comercial y de la
          Empresa y las novedades editoriales en su correo.
        </p>
        <div className="mt-8 flex justify-center">
          <SubscribeBox centered />
        </div>
      </div>
    </div>
  );
}
