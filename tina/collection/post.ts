import type { Collection } from 'tinacms';

// Maps the flat frontmatter that lib/blog.ts reads via gray-matter
// (title/category/section/excerpt/author/authorRole/date) + the markdown body.
// Field `name`s MUST stay flat and match those keys, and the FILENAME must equal
// the URL slug (lib/blog.ts getPostBySlug reads `${slug}.md`).
const Post: Collection = {
  label: 'Artículos',
  name: 'post',
  path: 'content/blog',
  format: 'md',
  ui: {
    // Post URL is /publicaciones/<slug>, and filename === slug.
    router: ({ document }) => `/publicaciones/${document._sys.filename}`,
    filename: {
      // Derive the filename from the title: lowercase, no accents, hyphens.
      slugify: (values) =>
        (values?.title || '')
          .toString()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
    },
  },
  // New-post defaults (collection level, NOT ui — ui.defaultItem fails tsc).
  defaultItem: () => ({
    section: 'Doctrina',
    author: 'Dr. Ricardo Olivera',
    authorRole: 'Abogado',
    date: new Date().toISOString(),
  }),
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Título',
      isTitle: true,
      required: true,
      description: 'El titular del artículo.',
    },
    {
      type: 'string',
      name: 'section',
      label: 'Sección',
      required: true,
      options: ['Doctrina', 'Jurisprudencia', 'Noticias'],
      description:
        'Sección editorial de la revista. Define dónde aparece el artículo.',
    },
    {
      type: 'string',
      name: 'category',
      label: 'Categoría (tema)',
      required: true,
      description: 'Tema del artículo. Ej: Derecho Societario, Contratos.',
    },
    {
      type: 'string',
      name: 'excerpt',
      label: 'Resumen',
      description: 'Resumen corto. Se muestra en las tarjetas de la portada.',
      ui: { component: 'textarea' },
    },
    {
      type: 'image',
      name: 'coverImage',
      label: 'Imagen de portada',
      description:
        'Imagen del artículo. Se muestra en las tarjetas y en la cabecera. Opcional.',
    },
    {
      type: 'string',
      name: 'author',
      label: 'Autor',
      required: true,
      description:
        'Debe coincidir EXACTAMENTE con el nombre de un autor existente (ver colección Autores). Ej: Dr. Ricardo Olivera.',
    },
    {
      type: 'string',
      name: 'authorRole',
      label: 'Cargo del autor',
      description: 'Ej: Abogado, Profesora de Derecho Comercial.',
    },
    {
      type: 'datetime',
      name: 'date',
      label: 'Fecha de publicación',
      required: true,
      description: 'Ordena los artículos: el más reciente aparece primero.',
      ui: { dateFormat: 'YYYY-MM-DD' },
    },
    {
      type: 'rich-text',
      name: 'body',
      label: 'Contenido',
      isBody: true,
      description: 'El cuerpo del artículo.',
    },
  ],
};

export default Post;
