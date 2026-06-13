import type { Collection } from 'tinacms';

// Maps the flat frontmatter that lib/epocas.ts reads via gray-matter
// (title/startYear/endYear/director/detail) + the markdown body (description).
// Rendered inline on the /80-años anniversary page (no per-época URL).
// FILENAME is the época range, e.g. "1946-1977".
const Epoca: Collection = {
  label: 'Épocas (80 años)',
  name: 'epoca',
  path: 'content/epocas',
  format: 'md',
  ui: {
    // No dedicated route — épocas render inline on the anniversary page.
    router: () => `/80-años`,
    filename: {
      // Filename pattern matches the época range: "<inicio>-<fin>", e.g. 1946-1977.
      slugify: (values) => {
        const start = values?.startYear || '';
        const end = values?.endYear || '';
        if (start && end) return `${start}-${end}`;
        return (values?.title || '')
          .toString()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      },
    },
  },
  defaultItem: () => ({
    director: 'Director: [a completar por Belén]',
    detail: '[Información pendiente — a completar por Belén]',
  }),
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Época (rango)',
      isTitle: true,
      required: true,
      description: 'Rango de años de la época. Ej: 1946-1977.',
    },
    {
      type: 'number',
      name: 'startYear',
      label: 'Año de inicio',
      description: 'Se usa en la píldora de la línea de tiempo y para ordenar.',
    },
    {
      type: 'number',
      name: 'endYear',
      label: 'Año de fin',
      description: 'Ej: 1977.',
    },
    {
      type: 'string',
      name: 'director',
      label: 'Director',
      description: 'Ej: Prof. Sagunto Pérez Fontana.',
    },
    {
      type: 'string',
      name: 'detail',
      label: 'Detalle',
      description: 'Ej: línea de meses de publicación y año.',
      ui: { component: 'textarea' },
    },
    {
      type: 'rich-text',
      name: 'body',
      label: 'Descripción',
      isBody: true,
      description: 'Descripción de la época. Opcional.',
    },
  ],
};

export default Epoca;
