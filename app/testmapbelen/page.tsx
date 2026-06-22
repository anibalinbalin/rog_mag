import ScrollMapClient from "./ScrollMapClient";
import { getEpocas } from "@/lib/epocas";
import { getPagina80Anos } from "@/lib/paginas";

export const metadata = {
  title: "Test · Mapa 80 Años",
  robots: { index: false, follow: false },
};

// Test route: the CodePen "Scroll Map, Split-Screen & Expandable" mechanic
// applied to the 80 Años épocas, with the real anniversary hero on the right.
export default function TestMapBelenPage() {
  const epocas = getEpocas();
  const pagina = getPagina80Anos();

  return (
    <ScrollMapClient
      epocas={epocas}
      hero={{
        title: pagina.title,
        yearsLabel: pagina.yearsLabel,
        lede: pagina.lede,
        intro: pagina.intro,
      }}
    />
  );
}
