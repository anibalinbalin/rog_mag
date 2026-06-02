import type { Collection } from 'tinacms';

// Maps the flat frontmatter that lib/authors.ts reads via gray-matter
// (name/role/institution/linkedin/sections) + the markdown body (bio).
// FILENAME must equal the URL slug (/autores/<slug>).
const Author: Collection = {
  label: 'Autores',
  name: 'author',
  path: 'content/authors',
  format: 'md',
  ui: {
    router: ({ document }) => `/autores/${document._sys.filename}`,
    filename: {
      // Derive the filename from the name, dropping titles like "Dr." / "Dra.".
      slugify: (values) =>
        (values?.name || '')
          .toString()
          .toLowerCase()
          .replace(/\b(dr|dra|lic|lc|esc)\.?\s+/g, '')
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
    },
  },
  defaultItem: () => ({
    role: 'Abogado',
    institution: 'Olivera Abogados',
  }),
  fields: [
    {
      type: 'string',
      name: 'name',
      label: 'Nombre',
      isTitle: true,
      required: true,
      description:
        'Nombre completo con título. Ej: Dr. Ricardo Olivera. Los artículos lo referencian por este nombre exacto.',
    },
    {
      type: 'string',
      name: 'role',
      label: 'Cargo',
      description: 'Ej: Abogado, Profesora de Derecho Comercial.',
    },
    {
      type: 'string',
      name: 'institution',
      label: 'Institución',
      description: 'Ej: Olivera Abogados, Universidad de la República.',
    },
    {
      type: 'string',
      name: 'linkedin',
      label: 'LinkedIn (URL)',
      description: 'URL completa del perfil de LinkedIn. Opcional.',
    },
    {
      type: 'string',
      name: 'sections',
      label: 'Secciones',
      list: true,
      options: ['Doctrina', 'Jurisprudencia', 'Noticias'],
      description: 'Secciones en las que escribe este autor.',
    },
    {
      type: 'rich-text',
      name: 'body',
      label: 'Biografía',
      isBody: true,
      description: 'Biografía del autor. Se muestra en su página de perfil.',
    },
  ],
};

export default Author;
