import type { Collection } from 'tinacms';

// Editable page content rendered from the filesystem (NOT the GraphQL API).
// One collection, two fixed documents:
//   content/paginas/inicio.md   → homepage hero carousel (the `slides` list)
//   content/paginas/80-anos.md  → anniversary page intro (the flat fields)
// Each document only populates the fields it needs; lib/paginas.ts reads the
// relevant frontmatter keys per slug via gray-matter.
const Pagina: Collection = {
  label: 'Páginas',
  name: 'pagina',
  path: 'content/paginas',
  format: 'md',
  ui: {
    // Inicio = homepage; 80-anos = anniversary page.
    router: ({ document }) =>
      document._sys.filename === 'inicio'
        ? `/`
        : `/${document._sys.filename}`,
    // These are fixed documents — don't let editors create/rename them.
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Título',
      isTitle: true,
      required: true,
      description: 'Título de la página.',
    },
    // --- Homepage hero carousel (inicio.md) -------------------------------
    {
      type: 'object',
      name: 'slides',
      label: 'Slides del carrusel (portada)',
      list: true,
      description:
        'Diapositivas del carrusel de la portada. Solo para la página de inicio.',
      ui: {
        itemProps: (item) => ({ label: item?.heading || 'Slide' }),
      },
      fields: [
        {
          type: 'image',
          name: 'image',
          label: 'Imagen',
          description: 'Imagen de fondo del slide. Opcional.',
        },
        {
          type: 'string',
          name: 'heading',
          label: 'Título',
          description: 'Ej: Última edición.',
        },
        {
          type: 'string',
          name: 'subheading',
          label: 'Subtítulo',
          description: 'Ej: DISPONIBLE. Opcional.',
        },
        {
          type: 'string',
          name: 'ctaLabel',
          label: 'Texto del botón',
          description: 'Ej: Ver la revista.',
        },
        {
          type: 'string',
          name: 'ctaHref',
          label: 'Enlace del botón',
          description: 'Ej: /revista.',
        },
      ],
    },
    // --- Anniversary page intro (80-anos.md) ------------------------------
    {
      type: 'string',
      name: 'yearsLabel',
      label: 'Etiqueta de años',
      description: 'Ej: (1946-2026). Solo para la página 80 años.',
    },
    {
      type: 'string',
      name: 'lede',
      label: 'Entradilla',
      description: 'Párrafo de apertura. Solo para la página 80 años.',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'intro',
      label: 'Introducción',
      description: 'Párrafo introductorio. Solo para la página 80 años.',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'bibliografiaLabel',
      label: 'Texto del enlace de bibliografía',
      description: 'Ej: Bibliografía Fontana. Solo para la página 80 años.',
    },
    {
      type: 'string',
      name: 'bibliografiaHref',
      label: 'Enlace de bibliografía',
      description: 'Destino del enlace de bibliografía. Solo para la página 80 años.',
    },
    {
      type: 'string',
      name: 'timelineHeading',
      label: 'Título de la línea de tiempo',
      description:
        'Ej: Seis épocas de historia en ocho décadas. Solo para la página 80 años.',
    },
    {
      type: 'image',
      name: 'founderImage',
      label: 'Retrato del fundador',
      description: 'Retrato de Sagunto Pérez Fontana. Solo para la página 80 Años.',
    },
    {
      type: 'string',
      name: 'founderCaption',
      label: 'Pie del retrato del fundador',
      description: 'Pie de foto del retrato. Solo para la página 80 Años.',
    },
  ],
};

export default Pagina;
