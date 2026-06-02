import { redirect } from "next/navigation";

/** Noticias is now an editorial section — permanent home at /b/secciones/noticias. */
export default function NoticiasBPage() {
  redirect("/b/secciones/noticias");
}
