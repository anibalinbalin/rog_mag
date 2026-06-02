import type { Collection } from 'tinacms';

// Maps the flat frontmatter that lib/issues.ts reads via gray-matter
// (title/number/year/volume/issue/season/articleCount/current/doctrina/deInteres)
// + the markdown body (description). FILENAME must equal the URL slug
// (/revista/<slug>), e.g. "2024-no-3-4".
const Issue: Collection = {
  label: 'Revista (ediciones)',
  name: 'issue',
  path: 'content/issues',
  format: 'md',
  ui: {
    router: ({ document }) => `/revista/${document._sys.filename}`,
    filename: {
      // Filename pattern matches the existing archive: "<año>-<número>", e.g. 2024-no-3-4.
      slugify: (values) => {
        const year = values?.year || '';
        const number = (values?.number || '')
          .toString()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        return `${year}-${number}`;
      },
    },
  },
  defaultItem: () => ({
    title: 'Revista de Derecho Comercial y de la Empresa',
    year: new Date().getFullYear(),
    current: false,
    articleCount: 0,
  }),
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Título',
      isTitle: true,
      required: true,
      description: 'Normalmente: Revista de Derecho Comercial y de la Empresa.',
    },
    {
      type: 'string',
      name: 'number',
      label: 'Número',
      required: true,
      description: 'Ej: No. 3-4',
    },
    {
      type: 'number',
      name: 'year',
      label: 'Año',
      required: true,
      description: 'Ej: 2026',
    },
    {
      type: 'number',
      name: 'volume',
      label: 'Volumen',
      description: 'Ej: 41',
    },
    {
      type: 'number',
      name: 'issue',
      label: 'N.º de edición',
      description: 'Número de edición dentro del volumen. Ej: 2',
    },
    {
      type: 'string',
      name: 'season',
      label: 'Temporada',
      description: 'Ej: Primavera, Otoño.',
    },
    {
      type: 'number',
      name: 'articleCount',
      label: 'Cantidad de artículos',
      description: 'Se muestra en el archivo de ediciones.',
    },
    {
      type: 'boolean',
      name: 'current',
      label: 'Edición actual',
      description:
        'Marca SOLO UNA edición como actual: es la que aparece destacada en la portada y en /revista.',
    },
    {
      type: 'string',
      name: 'doctrina',
      label: 'Artículos de Doctrina',
      list: true,
      description: 'Títulos de los artículos de doctrina de esta edición.',
    },
    {
      type: 'string',
      name: 'deInteres',
      label: 'Artículos de interés',
      list: true,
      description: 'Títulos de jurisprudencia comentada, reseñas, etc.',
    },
    {
      type: 'rich-text',
      name: 'body',
      label: 'Descripción',
      isBody: true,
      description: 'Descripción breve de la edición. Opcional.',
    },
  ],
};

export default Issue;
