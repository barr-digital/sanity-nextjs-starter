# Next.js + Sanity Starter with i18n & PageBuilder

A production-ready starter template combining **Next.js 16**, **Sanity v5**, **internationalization** (next-intl), a flexible **PageBuilder system**, **Tailwind CSS v4**, and **Sanity Live Content API**. Perfect for building scalable, multi-language content-driven websites.

## Stack

- **Next.js 16** (App Router, React Server Components)
- **Sanity v5** (headless CMS with real-time collaboration)
- **TypeScript** (full type safety across frontend and studio)
- **Tailwind CSS v4** (CSS-first approach)
- **next-intl** (document-level i18n, Italian default)
- **Monorepo** (npm workspaces: `frontend/` + `studio/`)

## Prerequisites

- Node.js 18+ and npm
- A Sanity account ([sign up for free](https://www.sanity.io/get-started))

## Setup

### 1. Initialize with Sanity CLI

```bash
npm create sanity@latest -- --template barr-digital/sanity-nextjs-starter
```

The CLI guides you through creating a Sanity project, dataset, and environment variables.

### 2. Manual setup (alternative)

```bash
git clone https://github.com/barr-digital/sanity-nextjs-starter.git my-project
cd my-project
npm install

# Configure environment variables
cp frontend/.env.example frontend/.env.local
cp studio/.env.example studio/.env
# Fill in your Sanity project ID, dataset, and API token
```

### 3. Start development

```bash
npm run dev
```

This starts both:

- **Frontend**: http://localhost:3000
- **Studio**: http://localhost:3333

## Architecture

```
.
├── frontend/                     # Next.js application
│   ├── app/
│   │   ├── [locale]/[[...slug]]/ # Catch-all localized routes
│   │   ├── _pages/               # Page components (home-page.tsx, ...)
│   │   └── styles/               # Tailwind CSS modules
│   ├── components/
│   │   ├── blocks/               # PageBuilder block components
│   │   ├── layout/               # Layout components (page-builder, block-renderer)
│   │   └── ui/                   # UI components (link, picture, text, ...)
│   ├── hooks/                    # Custom React hooks
│   ├── lib/
│   │   ├── actions/              # Server actions
│   │   └── helpers/              # Server-side helpers (metadata, sitemap, ...)
│   ├── types/                    # Shared TypeScript types
│   ├── utils/                    # Utility functions (cn, ...)
│   ├── sanity/
│   │   └── lib/                  # Sanity client, queries, utils
│   └── i18n/                     # Internationalization config
│
└── studio/                       # Sanity Studio
    └── src/
        ├── schema-types/         # Content schemas
        │   ├── blocks/           # PageBuilder block schemas
        │   ├── documents/
        │   │   ├── singletons/   # Single-instance documents (homepage, header, footer, settings)
        │   │   └── collections/  # Multi-instance documents (future: pages, posts, ...)
        │   ├── objects/          # Reusable object types (link, image, seo)
        │   └── validation/       # Custom validation rules
        ├── components/           # Custom Studio components
        ├── contexts/             # React contexts for Studio
        ├── structure/            # Studio structure (sidebar navigation)
        └── templates/            # Document templates for i18n
```

## Adding a New PageBuilder Block

Three steps:

1. **Create the schema** in `studio/src/schema-types/blocks/my-block.ts`
   - Define the block with `defineType({ type: 'object', ... })`
   - Register it in `studio/src/schema-types/index.ts`
   - Add `{ type: 'myBlock' }` to `pageBuilderBlocks` in `studio/src/schema-types/blocks/config.ts`

2. **Create the component** in `frontend/components/blocks/my-block.tsx`

3. **Register it** in `frontend/components/layout/block-renderer.tsx`
   - Import the component and add it to the `getBlocks()` map

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable                        | Description                                   |
| ------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID                             |
| `NEXT_PUBLIC_SANITY_DATASET`    | Dataset name (e.g., `production`)             |
| `SANITY_API_READ_TOKEN`         | API token with read access (for live preview) |
| `NEXT_PUBLIC_SITE_URL`          | Production URL (for SEO/sitemap)              |

### Studio (`studio/.env`)

| Variable                   | Description       |
| -------------------------- | ----------------- |
| `SANITY_STUDIO_PROJECT_ID` | Sanity project ID |
| `SANITY_STUDIO_DATASET`    | Dataset name      |

## Available Commands

| Command                       | Description                                  |
| ----------------------------- | -------------------------------------------- |
| `npm run dev`                 | Start frontend + studio in parallel          |
| `npm run format`              | Format all files with Prettier               |
| `npm run lint`                | Lint frontend with ESLint                    |
| `npm run type-check`          | TypeScript check across all workspaces       |
| `npm run build -w frontend`   | Build the frontend for production            |
| `npm run typegen -w frontend` | Generate TypeScript types from Sanity schema |
| `npm run deploy -w studio`    | Deploy Studio to `*.sanity.studio`           |

## Deployment

### Studio

```bash
npm run deploy -w studio
```

First deploy prompts for a unique hostname (e.g., `my-project.sanity.studio`).

### Frontend (Vercel)

1. Push to GitHub
2. Import in Vercel with **Root Directory** set to `frontend`
3. Set environment variables listed above

## Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Detailed development guide
- **[Sanity Documentation](https://www.sanity.io/docs)**
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[next-intl Documentation](https://next-intl-docs.vercel.app/)**

## License

MIT

---

**Built by [Luca Gennaro - Barr Digital](https://github.com/luca-gennaro)**
