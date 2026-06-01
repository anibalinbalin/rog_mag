export default function SubscribeBox({
  centered = false,
}: {
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-md" : "max-w-md"}>
      <form className="flex" action="#">
        <input
          type="email"
          required
          placeholder="Ingresar correo electrónico"
          className="w-full border border-line-dark bg-paper px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-ink"
        />
        <button
          type="submit"
          className="shrink-0 bg-ink px-6 py-3 text-sm text-paper transition-opacity hover:opacity-85"
        >
          Suscribirme
        </button>
      </form>
      <p className={`mt-3 text-xs text-ink-muted ${centered ? "text-center" : ""}`}>
        Al suscribirte, aceptas nuestra Política de Privacidad y das tu
        consentimiento para recibir actualizaciones.
      </p>
    </div>
  );
}
