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
  num: string; // "06", or "05-06" for combined issues (up to "03-04-05-06")
  label: string; // "Junio", or "Mayo-Junio" for combined issues
  cover: string;
  sumario: string | null;
  sumarios: string[];
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
    let match = epocas[0];
    for (const e of epocas) {
      if (year >= e.startYear) match = e;
    }
    return cleanDirector(match?.director ?? "");
  };

  return fs
    .readdirSync(archivoDirectory)
    .filter((name) => /^\d{4}$/.test(name))
    .sort()
    .map((yearDir) => {
      const dir = path.join(archivoDirectory, yearDir);
      const files = fs.readdirSync(dir);
      // Issue keys are "MM" for monthly numbers and "MM-MM"(-MM…) for the
      // combined ones the magazine published from time to time ("05-06",
      // 1969's quarterly "03-04-05-06"). Combined issues are labeled as a
      // first-to-last month range ("Mayo-Junio").
      const months: ArchivoMonth[] = files
        .map((f) => /^(\d{2}(?:-\d{2})*)-cover\.jpg$/.exec(f))
        .filter((m): m is RegExpExecArray => m !== null)
        .map((m) => m[1])
        .filter((key) => key.split("-").every((mm) => mm in MONTH_LABELS))
        // Numeric sort on the first month: JS would otherwise order
        // integer-like keys ("10".."12") ahead of the leading-zero string
        // keys ("01".."09").
        .sort((a, b) => Number(a.slice(0, 2)) - Number(b.slice(0, 2)))
        .map((key) => {
          const parts = key.split("-");
          const label =
            parts.length === 1
              ? MONTH_LABELS[key]
              : `${MONTH_LABELS[parts[0]]}-${MONTH_LABELS[parts[parts.length - 1]]}`;
          const sumPages: string[] = [];
          if (files.includes(`${key}-sum.jpg`))
            sumPages.push(`/archivo/${yearDir}/${key}-sum.jpg`);
          for (let i = 2; i <= 9; i++) {
            if (files.includes(`${key}-sum${i}.jpg`))
              sumPages.push(`/archivo/${yearDir}/${key}-sum${i}.jpg`);
          }
          return {
            num: key,
            label,
            cover: `/archivo/${yearDir}/${key}-cover.jpg`,
            sumario: sumPages[0] ?? null,
            sumarios: sumPages,
          };
        });
      return {
        year: Number(yearDir),
        director: directorForYear(Number(yearDir)),
        months,
      };
    })
    .filter((y) => y.months.length > 0);
}
