# Next.js + Sanity Starter with i18n & PageBuilder

A production-ready starter template combining **Next.js 16**, **Sanity v5**, **internationalization** (next-intl), a flexible **PageBuilder system**, **Tailwind CSS v4**, and **Sanity Live Content API**. Perfect for building scalable, multi-language content-driven websites.

## ✨ Features

### 🚀 Core Stack

- **Next.js 16 with App Router** - Blazing-fast performance with React Server Components
- **Sanity v5** - Powerful headless CMS with real-time collaboration
- **TypeScript** - Full type safety across frontend and studio
- **Tailwind CSS v4** - Pure CSS-first approach with modular utilities
- **Monorepo Structure** - npm workspaces for frontend and studio

### 🌍 Internationalization

- **next-intl** - Built-in i18n with Italian as default (easily add more languages)
- **Document-level translation** - Separate documents per language in Sanity
- **Automatic routing** - `/` for default locale, `/en` for others
- **Language switcher** - Ready-to-use component

### 🎨 Content Management

- **PageBuilder System** - Drag-and-drop block-based content creation
- **Live Content API** - No rebuilds needed, content updates instantly
- **Grid View** - Intuitive visual block arrangement

### 🛠️ Developer Experience

- **Complete Type Generation** - Automatic TypeScript types from Sanity schema
- **GROQ Fragments** - Reusable query patterns for images, links, portable text
- **SEO Ready** - Complete metadata generation with Open Graph support
- **Dynamic Sitemap** - Automatically generated from Sanity content
- **Comprehensive Documentation** - Inline TODOs and examples throughout

### 📦 Pre-configured Components

- **HomePage** - Example page with PageBuilder integration
- **ExampleBlock** - Starter block for PageBuilder
- **Layout System** - Header, Footer, and LanguageSelector components
- **Sanity Schemas** - Base schemas for pages, settings, and singletons

## 🎯 What's Included

### Frontend (`/frontend`)

- Next.js 16 with App Router
- Tailwind CSS v4 (pure CSS, no config file)
- next-intl for internationalization
- Sanity Live Content API integration
- SEO metadata and sitemap generation
- Helper functions for metadata and routing

### Studio (`/studio`)

- Sanity Studio v5
- Document internationalization
- Language filter
- Media library plugin
- Vision tool for testing GROQ queries
- Custom structure with singletons

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Sanity account ([sign up for free](https://www.sanity.io/get-started))

### Installation

#### 1. Initialize template with Sanity CLI

```bash
npm create sanity@latest -- --template barr-digital/sanity-nextjs-starter
```

The CLI will guide you through:

- Creating a new Sanity project
- Setting up your dataset
- Configuring environment variables

#### 2. Start development servers

Navigate to your project directory and run:

```bash
npm run dev
```

This starts both:

- **Frontend**: http://localhost:3000
- **Studio**: http://localhost:3333

#### 3. Sign in to the Studio

Open http://localhost:3333 and sign in with the same credentials you used during setup.

### Manual Setup (Alternative)

If you prefer to set up manually:

1. **Clone the repository**

   ```bash
   git clone https://github.com/barr-digital/sanity-nextjs-starter.git my-project
   cd my-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` files and fill in your Sanity project details:

   ```bash
   # In /frontend
   cp frontend/.env.example frontend/.env.local

   # In /studio
   cp studio/.env.example studio/.env
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## 📖 Usage Guide

### Adding a New Language

1. **Update routing configuration** (`frontend/i18n/routing.ts`):

   ```typescript
   export const routing = defineRouting({
     locales: ['it', 'en', 'es'], // Add your language
     defaultLocale: 'it',
   })
   ```

2. **Add language support in Studio** (`studio/sanity.config.ts`):

   ```typescript
   documentInternationalization({
     supportedLanguages: [
       { id: 'it', title: 'Italian' },
       { id: 'en', title: 'English' }, // Add your language
     ],
     // ...
   })
   ```

3. **Create translation files** in `frontend/messages/`:
   ```bash
   cp frontend/messages/it.json frontend/messages/en.json
   ```

### Creating a New Page Type

See [`DEVELOPMENT.md`](DEVELOPMENT.md) for detailed guides on:

- Adding new page types
- Creating custom blocks for PageBuilder
- Setting up collection pages (like blogs or projects)
- Configuring SEO and metadata

### Customizing Styles

This template uses Tailwind CSS v4 with a pure CSS-first approach:

- **Colors**: `frontend/app/styles/colors.css`
- **Typography**: `frontend/app/styles/typography.css`
- **Global styles**: `frontend/app/globals.css`

Example of adding a color:

```css
/* frontend/app/styles/colors.css */
@theme {
  --color-primary-50: #e6f0ff;
  --color-primary-500: #0066ff;
  --color-primary-900: #001a4d;
}
```

## 🏗️ Project Structure

```
.
├── frontend/                  # Next.js application
│   ├── app/                   # App router pages
│   │   ├── [locale]/          # Localized routes
│   │   ├── _pages/            # Page components
│   │   └── styles/            # Tailwind CSS modules
│   ├── components/            # React components
│   │   ├── Blocks/            # PageBuilder blocks
│   │   ├── Layout/            # Layout components
│   │   └── Ui/                # UI components
│   ├── lib/                   # Utilities and helpers
│   │   └── helpers/           # Server-side helpers
│   └── sanity/                # Sanity integration
│       └── lib/               # Queries and utilities
│
└── studio/                    # Sanity Studio
    └── src/
        ├── schemaTypes/       # Content schemas
        │   ├── blocks/        # PageBuilder blocks
        │   ├── documents/     # Document types
        │   └── objects/       # Reusable objects
        ├── structure/         # Studio structure
        └── templates/         # Document templates
```

## 🚢 Deployment

### Deploy Studio to Sanity

Deploy your Sanity Studio to a hosted `*.sanity.studio` URL:

```bash
npm run deploy --workspace=studio
```

**On first deploy:**

- You'll be prompted to choose a unique hostname (e.g., `my-project.sanity.studio`)
- Studio hostnames are **globally unique** across all Sanity projects, so choose a specific name
- Good examples: `yourcompany-projectname`, `client-website`, `your-org-cms`
- After deploy, you'll receive an `appId` - add it manually to `studio/sanity.cli.ts` (see [DEVELOPMENT.md](DEVELOPMENT.md#studio-deployment) for details)

**On subsequent deploys:**

- Once the `appId` is configured, the CLI will use it automatically
- Your studio will be updated at the same URL without prompts

> **Note:** If you get "hostname already taken", someone else is using that name. Try adding your company/project name to make it unique.

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the **Root Directory** to `frontend`
4. Configure environment variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_READ_TOKEN`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)

## 📚 Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Complete development guide with implementation examples
- **[Sanity Documentation](https://www.sanity.io/docs)**
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[next-intl Documentation](https://next-intl-docs.vercel.app/)**

## 🤝 Contributing

Contributions are welcome! Please see [DEVELOPMENT.md](DEVELOPMENT.md) for guidelines.

## 📝 License

MIT © [Barr Digital](https://github.com/barr-digital)

## 🔗 Resources

- [Join the Sanity Community](https://slack.sanity.io)
- [Learn Sanity](https://www.sanity.io/learn)
- [Sanity Exchange](https://www.sanity.io/exchange)

---

**Built with ❤️ by [Luca Gennaro - Barr Digital](https://github.com/luca-gennaro)**
