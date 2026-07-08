import fs from "fs";
import path from "path";
import { getEpocas } from "./epocas";

const archivoDirectory = path.join(process.cwd(), "public/archivo");

const MONTH_LABELS: Record<string, string> = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Setiembre", // Uruguayan spelling, matches the masthead
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
};

export interface ArchivoMonth {
  num: string; // "06"
  label: string; // "Junio"
  cover: string; // "/archivo/1946/06-cover.jpg"
  sumario: string | null; // "/archivo/1946/06-sum.jpg" (may be absent)
}

export interface ArchivoYear {
  year: number;
  director: string; // resolved from the época that contains this year
  months: ArchivoMonth[];
}

/** Época director fields are written as prose ("Director: X", "Dirección
    compartida por X e Y") for reuse elsewhere (see ScrollMapClient), and may
    span multiple lines when they also list editorial roles (see 1977's
    content/epocas/1977.md). The archive only needs the resolved name(s) on a
    single line, so take the first line and strip both the leading label
    (the archive UI adds its own "Director: ") and an academic prefix
    ("Prof. ") so the byline reads like the mockup
    ("Director: Sagunto Pérez Fontana") instead of duplicating the label. */
function cleanDirector(director: string): string {
  const firstLine = director.split("\n")[0] ?? "";
  return firstLine
    .replace(
      /^\s*(direcci[oó]n(?:\s+(compartida\s+por|conjunta\s+de))?|directora?)\s*:?\s*/i,
      ""
    )
    .replace(/^\s*(prof\.?|dr\.?|esc\.?)\s+/i, "")
    .trim();
}

/** The original "Sociedades Anónimas" issues, digitized by year. Years (and the
    months inside them) are derived from the optimized scans in
    /public/archivo/<year>/<MM>-{cover,sum}.jpg — drop a new year's folder in and
    it appears automatically. The director is matched from the época that spans
    the year (see content/epocas). */
export function getArchivoYears(): ArchivoYear[] {
  if (!fs.existsSync(archivoDirectory)) return [];
  const epocas = getEpocas();

  const directorForYear = (year: number): string => {
    const epoca = epocas.find(
      (e) => year >= e.startYear && (e.endYear === 0 || year <= e.endYear)
    );
    return cleanDirector(epoca?.director ?? "");
  };

  return fs
    .readdirSync(archivoDirectory)
    .filter((name) => /^\d{4}$/.test(name))
    .sort()
    .map((yearDir) => {
      const dir = path.join(archivoDirectory, yearDir);
      const files = fs.readdirSync(dir);
      const months: ArchivoMonth[] = Object.keys(MONTH_LABELS)
        .filter((mm) => files.includes(`${mm}-cover.jpg`))
        // Numeric sort: JS would otherwise order integer-like keys ("10".."12")
        // ahead of the leading-zero string keys ("01".."09").
        .sort((a, b) => Number(a) - Number(b))
        .map((mm) => ({
          num: mm,
          label: MONTH_LABELS[mm],
          cover: `/archivo/${yearDir}/${mm}-cover.jpg`,
          sumario: files.includes(`${mm}-sum.jpg`)
            ? `/archivo/${yearDir}/${mm}-sum.jpg`
            : null,
        }));
      return {
        year: Number(yearDir),
        director: directorForYear(Number(yearDir)),
        months,
      };
    })
    .filter((y) => y.months.length > 0);
}
