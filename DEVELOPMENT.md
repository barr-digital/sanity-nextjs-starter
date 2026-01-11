# Development Guide

This guide provides detailed instructions for extending and customizing your Sanity + Next.js starter template.

## Table of Contents

- [Adding New Page Types](#adding-new-page-types)
- [Creating Custom PageBuilder Blocks](#creating-custom-pagebuilder-blocks)
- [Setting Up Collection Pages](#setting-up-collection-pages)
- [Configuring SEO and Metadata](#configuring-seo-and-metadata)
- [Working with Images](#working-with-images)
- [Internationalization](#internationalization)
- [TypeScript and Type Safety](#typescript-and-type-safety)

---

## Adding New Page Types

Follow these steps to add a new page type (e.g., "About Page"):

### 1. Create the Schema (Studio)

Create a new file in `studio/src/schemaTypes/documents/`:

```typescript
// studio/src/schemaTypes/documents/aboutPage.ts
import {defineType} from 'sanity'
import {basePage} from './basePage'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    ...basePage.fields, // Includes title, slug, SEO fields
    {
      name: 'pageBuilder',
      title: 'Page Builder',
      type: 'array',
      of: pageBuilderBlocks, // Import from blocks/config.ts
      options: pageBuilderFieldOptions,
    },
  ],
})
```

**Register the schema** in `studio/src/schemaTypes/index.ts`:

```typescript
import {aboutPage} from './documents/aboutPage'

export const schemaTypes = [
  // ... existing types
  aboutPage,
]
```

### 2. Create the Query (Frontend)

Add a query in `frontend/sanity/lib/queries.ts`:

```typescript
export const aboutPageQuery = defineQuery(`
  *[_type == "aboutPage" && language == $lang][0]{
    _id,
    _type,
    title,
    seo{
      seoTitle,
      seoDescription,
      seoImage${imageFragment},
    },
    "pageBuilder": pageBuilder[]${pageBuilderFragment}
  }
`)
```

### 3. Create the Page Component (Frontend)

Create a component in `frontend/app/_pages/`:

```typescript
// frontend/app/_pages/AboutPage.tsx
import { PageBuilder } from "@/components/Layout";
import { AboutPageQueryResult } from "@/sanity.types";

interface AboutPageProps {
  page: AboutPageQueryResult;
}

export function AboutPage({ page }: AboutPageProps) {
  return (
    <div>
      <h1>{page.title}</h1>
      {page.pageBuilder && <PageBuilder page={page} />}
    </div>
  );
}
```

### 4. Update the Main Page Handler

Update `frontend/app/[locale]/[[...slug]]/page.tsx`:

**In `generateMetadata`:**

```typescript
// Add metadata handling for about page
const slugPath = slug.join('/')

if (slugPath === 'about') {
  const {data: aboutPage} = await sanityFetch({
    query: aboutPageQuery,
    params: {lang: locale},
  })

  // Return metadata (see existing homepage example)
}
```

**In the Page component:**

```typescript
// Add page fetching logic
if (slugPath === 'about') {
  const {data: aboutPage} = await sanityFetch({
    query: aboutPageQuery,
    params: {lang: locale},
  })

  if (!aboutPage) notFound()
  return renderPageComponent(aboutPage)
}
```

**In `renderPageComponent`:**

```typescript
function renderPageComponent(content: any, items?: any) {
  switch (content._type) {
    case "homepage":
      return <HomePage page={content} />;
    case "aboutPage":
      return <AboutPage page={content} />;
    // ...
  }
}
```

### 5. Update Static Params Generation

Update `frontend/lib/helpers/sitemap.ts`:

```typescript
export async function generateStaticParamsForLocale(locale: string) {
  const result: StaticParam[] = []

  // Homepage
  result.push({locale, slug: undefined})

  // About page
  const aboutPage = await client.fetch(
    `*[_type == "aboutPage" && language == $lang][0]{ "slug": slug.current }`,
    {lang: locale},
  )

  if (aboutPage?.slug) {
    result.push({locale, slug: [aboutPage.slug]})
  }

  return result
}
```

---

## Creating Custom PageBuilder Blocks

### 1. Create the Schema (Studio)

Create a block schema in `studio/src/schemaTypes/blocks/`:

```typescript
// studio/src/schemaTypes/blocks/heroBlock.ts
import {defineType} from 'sanity'

export const heroBlock = defineType({
  name: 'heroBlock',
  title: 'Hero Block',
  type: 'object',
  fields: [
    {
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
    },
    {
      name: 'image',
      title: 'Background Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    },
    {
      name: 'cta',
      title: 'Call to Action',
      type: 'link', // Using the link object
    },
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'subheading',
      media: 'image',
    },
  },
})
```

### 2. Register the Block

Update `studio/src/schemaTypes/blocks/config.ts`:

```typescript
export const pageBuilderBlocks = [
  {type: 'exampleBlock'},
  {type: 'heroBlock'}, // Add your block
]
```

Also export it from `studio/src/schemaTypes/blocks/index.ts`:

```typescript
export {heroBlock} from './heroBlock'
```

### 3. Add to Query Fragment (Frontend)

Update `frontend/sanity/lib/queries.ts`:

```typescript
const pageBuilderFragment = /* groq */ `{
  ...,
  _type == 'exampleBlock' => {
    ...,
    title,
    text
  },
  _type == 'heroBlock' => {
    ...,
    heading,
    subheading,
    image${imageFragment},
    cta${linkFragment}
  }
}`
```

### 4. Create the Component (Frontend)

Create the React component in `frontend/components/Blocks/`:

```typescript
// frontend/components/Blocks/HeroBlock.tsx
import { Picture } from "@/components/Ui/Picture";
import { Link } from "@/components/Ui/Link";
import { ExtractPageBuilderType } from "@/sanity/lib/types";

type HeroBlockProps = {
  block: ExtractPageBuilderType<"heroBlock">;
  index: number;
};

export function HeroBlock({ block }: HeroBlockProps) {
  return (
    <section className="relative h-screen">
      {block.image && (
        <Picture
          image={block.image}
          fill
          objectFit="cover"
          priority={true}
        />
      )}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold">{block.heading}</h1>
          {block.subheading && (
            <p className="mt-4 text-xl">{block.subheading}</p>
          )}
          {block.cta && (
            <Link link={block.cta} className="mt-8">
              {block.cta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
```

### 5. Register the Component

Update `frontend/components/Layout/BlockRenderer.tsx`:

```typescript
import {HeroBlock} from '@/components/Blocks/HeroBlock'

const getBlocks = () => ({
  exampleBlock: ExampleBlock,
  heroBlock: HeroBlock, // Add your block
})
```

---

## Setting Up Collection Pages

Example: Creating a blog with posts listing and detail pages.

### 1. Create Collection Item Schema (Studio)

```typescript
// studio/src/schemaTypes/documents/post.ts
import {defineType} from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [{title: 'Italian', value: 'it'}],
      },
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string'}],
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}],
    },
  ],
})
```

### 2. Create Listing Page Schema

```typescript
// studio/src/schemaTypes/documents/singletons/blogListing.ts
import {defineType} from 'sanity'
import {basePage} from '../basePage'

export const blogListing = defineType({
  name: 'blogListing',
  title: 'Blog Listing',
  type: 'document',
  fields: [...basePage.fields],
})
```

### 3. Create Queries (Frontend)

```typescript
// Get all posts for listing
export const allPostsQuery = defineQuery(`
  *[_type == "post" && language == $lang] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    featuredImage${imageFragment},
    publishedAt
  }
`)

// Get single post by slug
export const postBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug && language == $lang][0]{
    _id,
    _type,
    title,
    excerpt,
    featuredImage${imageFragment},
    content[]${portableTextFragment},
    publishedAt
  }
`)

// Get blog listing page
export const blogListingQuery = defineQuery(`
  *[_type == "blogListing" && language == $lang][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    seo{...}
  }
`)
```

### 4. Update Page Handler

```typescript
// In page.tsx
export default async function Page({params}: Props) {
  const {locale, slug} = await params

  // Homepage
  if (!slug || slug.length === 0) {
    // ... homepage logic
  }

  const slugPath = slug.join('/')

  // Blog listing
  if (slugPath === 'blog') {
    const {data: blogPage} = await sanityFetch({
      query: blogListingQuery,
      params: {lang: locale},
    })

    const {data: posts} = await sanityFetch({
      query: allPostsQuery,
      params: {lang: locale},
    })

    if (!blogPage) notFound()
    return renderPageComponent(blogPage, posts)
  }

  // Blog post detail
  if (slug.length === 2 && slug[0] === 'blog') {
    const postSlug = slug[1]
    const {data: post} = await sanityFetch({
      query: postBySlugQuery,
      params: {lang: locale, slug: postSlug},
    })

    if (!post) notFound()
    return renderPageComponent(post)
  }

  notFound()
}
```

### 5. Update Static Params

```typescript
// In lib/helpers/sitemap.ts
const blogPage = await client.fetch(
  `*[_type == "blogListing" && language == $lang][0]{ "slug": slug.current }`,
  {lang: locale},
)

if (blogPage?.slug) {
  // Add blog listing page
  result.push({locale, slug: [blogPage.slug]})

  // Add all blog posts
  const posts = await client.fetch(
    `*[_type == "post" && language == $lang]{ "slug": slug.current }`,
    {lang: locale},
  )

  posts?.forEach((post: {slug: string}) => {
    if (post.slug) {
      result.push({locale, slug: [blogPage.slug, post.slug]})
    }
  })
}
```

---

## Configuring SEO and Metadata

The template includes complete SEO support with:

- Dynamic metadata generation
- Open Graph images
- Canonical URLs
- Automatic sitemap

### Metadata Helper Functions

Located in `frontend/lib/helpers/metadata.ts`:

- `getMetadataBase()` - Gets the base URL from headers or env
- `buildCanonicalPath()` - Builds canonical URLs with locale handling

### Adding Metadata to a Page

The `generateMetadata` function in `page.tsx` shows the pattern:

```typescript
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params
  const metadataBase = await getMetadataBase()
  const canonicalPath = buildCanonicalPath(locale, slug, routing.defaultLocale)

  // Fetch your page data
  const {data: page} = await sanityFetch({
    query: yourPageQuery,
    params: {lang: locale},
  })

  // Generate Open Graph image
  const ogImage = resolveOpenGraphImage(page?.seo?.seoImage)

  return {
    metadataBase,
    ...(page?.seo?.seoTitle && {title: page.seo.seoTitle}),
    ...(page?.seo?.seoDescription && {
      description: page.seo.seoDescription,
    }),
    ...(ogImage && {
      openGraph: {
        images: [ogImage],
      },
    }),
    alternates: {
      canonical: canonicalPath,
    },
  }
}
```

### Sitemap Configuration

The sitemap is auto-generated from your static params. Update `lib/helpers/sitemap.ts` to include your pages.

Priority and change frequency can be customized in `app/sitemap.ts`:

```typescript
// Customize based on content type
if (!slug || slug.length === 0) {
  priority = 1 // Homepage
} else if (slug[0] === 'blog' && slug.length === 2) {
  priority = 0.6 // Blog posts
  changeFrequency = 'weekly'
} else {
  priority = 0.8 // Other pages
}
```

---

## Working with Images

### Using the Picture Component

```typescript
import { Picture } from "@/components/Ui/Picture";

<Picture
  image={sanityImageObject}
  width={800}
  height={600}
  alt="Description"
  objectFit="cover"
/>
```

### Image with Crop and Hotspot

The `urlForImage` utility automatically handles crop and hotspot:

```typescript
import {urlForImage} from '@/sanity/lib/utils'

const imageUrl = urlForImage(sanityImageObject)?.width(1200).height(630).url()
```

### Open Graph Images

```typescript
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

const ogImage = resolveOpenGraphImage(sanityImageObject)
// Returns: { url, alt, width, height }
```

---

## Internationalization

### Adding a New Language

1. **Update routing** (`frontend/i18n/routing.ts`):

```typescript
export const routing = defineRouting({
  locales: ['it', 'en'], // Add language
  defaultLocale: 'it',
})
```

2. **Update Studio config** (`studio/sanity.config.ts`):

```typescript
;(documentInternationalization({
  supportedLanguages: [
    {id: 'it', title: 'Italian'},
    {id: 'en', title: 'English'}, // Add language
  ],
  schemaTypes: ['homepage', 'header', 'footer', 'settings'],
}),
  languageFilter({
    supportedLanguages: [
      {id: 'it', title: 'Italian'},
      {id: 'en', title: 'English'}, // Add language
    ],
    defaultLanguages: ['it'],
    documentTypes: ['homepage', 'header', 'footer', 'settings'],
  }))
```

3. **Create message files**:

```bash
cp frontend/messages/it.json frontend/messages/en.json
```

### Translation Files

Located in `frontend/messages/[locale].json`:

```json
{
  "languageSwitcher": {
    "label": "Language",
    "it": "Italiano",
    "en": "English"
  }
}
```

---

## TypeScript and Type Safety

### Generated Types

Types are automatically generated from your Sanity schema:

```bash
npm run typegen --workspace=frontend
```

This creates `frontend/sanity.types.ts` with all your schema types.

### Using Generated Types

```typescript
import {HomepageQueryResult} from '@/sanity.types'

function HomePage({page}: {page: HomepageQueryResult}) {
  // page is fully typed
}
```

### Custom Type Helpers

Located in `frontend/sanity/lib/types.ts`:

```typescript
// Extract a specific block type
type HeroBlockType = ExtractPageBuilderType<'heroBlock'>

// Get all PageBuilder blocks
type AllBlocks = PageBuilderBlock
```

---

## Deployment

### Studio Deployment

Deploy your Sanity Studio to a hosted `*.sanity.studio` URL for production use.

#### First Time Deployment

1. **Build and deploy the studio:**

   ```bash
   npm run deploy --workspace=studio
   ```

2. **Choose a hostname:**

   When prompted, enter a unique hostname for your studio (e.g., `my-project`).

   Your studio will be available at: `https://my-project.sanity.studio`

   **Important notes about hostnames:**

   - Studio hostnames are **globally unique** across all Sanity projects worldwide
   - They are NOT scoped to your account or organization
   - Similar to domain names - if someone else is using it, you can't use it
   - Choose specific names: `yourcompany-project`, `client-cms`, `brandname-studio`
   - Generic names like `test`, `demo`, `project` are likely taken

3. **Save the appId:**

   After successful deployment, Sanity will display an `appId`. Add it to `studio/sanity.cli.ts`:

   ```typescript
   export default defineCliConfig({
     api: {
       projectId,
       dataset,
     },
     deployment: {
       appId: 'YOUR_APP_ID_HERE', // From deploy output
       autoUpdates: true,
     },
   })
   ```

   This prevents the CLI from prompting for the application ID on future deploys.

#### Subsequent Deployments

Once the `appId` is configured, simply run:

```bash
npm run deploy --workspace=studio
```

The CLI will use the saved `appId` and deploy to the same hostname automatically.

#### Troubleshooting

**Error: "Hostname already taken"**

- The hostname is globally unique and someone else is using it
- Try adding your company/project name: `barr-digital-projectname`
- Or use a more specific identifier

**Error: "Cannot read properties of undefined (reading 'length')"**

- This happens when `studioHost` is set to an empty string `''` in `sanity.cli.ts`
- Either remove the `studioHost` field or set it to a proper value
- Use the `--hostname` flag: `npx sanity deploy --hostname your-name`

### Frontend Deployment (Vercel)

1. **Push to GitHub:**

   ```bash
   git push origin main
   ```

2. **Import in Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository
   - Set **Root Directory** to `frontend`

3. **Configure Environment Variables:**

   Add these in Vercel's project settings:

   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_READ_TOKEN=your-read-token
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

   **How to get the read token:**

   ```bash
   cd studio
   npx sanity manage
   ```

   Then go to **API** → **Tokens** → **Add API token** with "Read" permissions.

4. **Deploy:**
   Vercel will automatically deploy on push to your main branch.

### Environment-Specific Deployments

For staging/production environments, use environment variables in `studio/sanity.cli.ts`:

```typescript
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  ...(process.env.SANITY_STUDIO_HOSTNAME && {
    studioHost: process.env.SANITY_STUDIO_HOSTNAME,
  }),
})
```

Then deploy with:

```bash
SANITY_STUDIO_HOSTNAME=staging npm run deploy --workspace=studio
```

---

## Best Practices & Coding Standards

### 📁 File Organization

#### Component Structure

All components go in the `frontend/components/` directory following these rules:

1. **Single Component** → Direct file in appropriate folder

   ```
   components/Ui/Button.tsx
   components/Ui/Picture.tsx
   ```

2. **Multiple Related Components** → Group in named folder

   ```
   components/HomePage/
   ├── Hero.tsx
   ├── Features.tsx
   └── Testimonials.tsx
   ```

3. **Page Templates** → Always in `_pages` folder
   ```
   app/_pages/
   ├── HomePage.tsx
   ├── AboutPage.tsx
   └── BlogListingPage.tsx
   ```

#### Component Folders

- **`components/Blocks/`** - PageBuilder blocks only (e.g., HeroBlock, TextBlock)
- **`components/Layout/`** - Layout components (Header, Footer, PageBuilder, BlockRenderer)
- **`components/Ui/`** - Reusable UI components (Button, Picture, Link)
- **`components/[FeatureName]/`** - Feature-specific component groups

**Example:**

```
components/
├── Blocks/
│   ├── HeroBlock.tsx
│   └── TextBlock.tsx
├── Layout/
│   ├── Header.tsx
│   └── Footer.tsx
├── Ui/
│   ├── Button.tsx
│   └── Picture.tsx
└── ProjectsPage/          # Feature group
    ├── ProjectCard.tsx
    ├── ProjectGrid.tsx
    └── ProjectFilters.tsx
```

### 🔄 Development Workflow

#### Before Committing

**ALWAYS run these commands from the project root:**

```bash
# 1. Format all code
npm run format

# 2. Run type checking
npm run type-check

# 3. Verify builds pass
npm run build --workspace=frontend
npm run build --workspace=studio
```

#### After Schema Changes (Studio)

When you modify schemas in `studio/src/schemaTypes/`:

```bash
# 1. Extract schema types (generates schema.json)
npm run extract-types --workspace=studio

# 2. Generate TypeScript types for frontend
npm run typegen --workspace=frontend
```

#### After Query Changes (Frontend)

When you modify queries in `frontend/sanity/lib/queries.ts`:

```bash
# Generate updated query result types
npm run typegen --workspace=frontend
```

### 📝 Naming Conventions

#### Schema Types (Studio)

- **Blocks**: `heroBlock`, `textBlock`, `imageGalleryBlock`
- **Pages**: `homepage`, `aboutPage`, `blogListing`
- **Objects**: `seo`, `link`, `customImage`
- **Documents**: `post`, `project`, `author`

#### Components (Frontend)

- **Blocks**: `HeroBlock`, `TextBlock`, `ImageGalleryBlock`
- **Pages**: `HomePage`, `AboutPage`, `BlogListingPage`
- **UI Components**: `Button`, `Picture`, `Link`

#### Files

- **Components**: PascalCase - `HeroBlock.tsx`, `ProjectCard.tsx`
- **Utilities**: camelCase - `helpers.ts`, `utils.ts`
- **Config**: kebab-case - `sanity.config.ts`, `i18n-config.ts`

### 🎯 Code Quality Standards

#### TypeScript

**DO:**

```typescript
// ✅ Use generated types
import {HomepageQueryResult} from '@/sanity.types'

// ✅ Extract specific block types
type HeroBlockType = ExtractPageBuilderType<'heroBlock'>

// ✅ Type component props properly
interface HeroBlockProps {
  block: HeroBlockType
  index: number
}
```

**DON'T:**

```typescript
// ❌ Use 'any' types
function MyComponent({block}: {block: any}) {}

// ❌ Skip type annotations
function MyComponent({block}) {}
```

#### GROQ Queries

**DO:**

```typescript
// ✅ Use fragments for reusability
const imageFragment = /* groq */ `{
  asset,
  hotspot,
  crop,
  alt
}`

export const pageQuery = defineQuery(`
  *[_type == "page"][0]{
    image${imageFragment}
  }
`)

// ✅ Wrap field names in quotes for projections
export const query = defineQuery(`
  *[_type == "post"]{
    _id,
    "slug": slug.current,
    "authorName": author->name
  }
`)
```

**DON'T:**

```typescript
// ❌ Duplicate image fields across queries
export const pageQuery = defineQuery(`
  *[_type == "page"][0]{
    image{
      asset,
      hotspot,
      crop,
      alt
    }
  }
`)

// ❌ Forget quotes on aliased fields
export const query = defineQuery(`
  *[_type == "post"]{
    slug: slug.current  // ❌ Will error
  }
`)
```

#### Component Structure

**DO:**

```typescript
// ✅ Proper component structure
import { ExtractPageBuilderType } from "@/sanity/lib/types";

type HeroBlockProps = {
  block: ExtractPageBuilderType<"heroBlock">;
  index: number;
};

export function HeroBlock({ block, index }: HeroBlockProps) {
  return (
    <section>
      <h1>{block.heading}</h1>
    </section>
  );
}
```

**DON'T:**

```typescript
// ❌ Missing types and exports
function HeroBlock({ block }) {
  return <section>{block.heading}</section>;
}
```

### 🔍 Testing Checklist

Before pushing to production:

- [ ] Frontend build passes (`npm run build --workspace=frontend`)
- [ ] Studio build passes (`npm run build --workspace=studio`)
- [ ] TypeScript has no errors (`npm run type-check`)
- [ ] Code is formatted (`npm run format`)
- [ ] Test in Studio: Create/edit content
- [ ] Test in Frontend: Verify content displays correctly
- [ ] Test on mobile viewport
- [ ] Verify SEO metadata in browser inspector
- [ ] Check sitemap.xml is generating correctly

### 📚 Additional Best Practices

#### Schema Design

1. **Always include language field** for internationalized content
2. **Use validation rules** to ensure data quality
3. **Provide preview configurations** for better Studio UX
4. **Group related fields** with fieldsets for complex schemas

#### Performance

1. **Use `priority` prop** on above-the-fold images
2. **Implement proper image sizing** with `width` and `height`
3. **Lazy load** below-the-fold content
4. **Keep queries focused** - only fetch needed fields

#### SEO

1. **Always provide alt text** for images
2. **Include SEO fields** on all page types
3. **Use semantic HTML** (`<article>`, `<section>`, `<nav>`)
4. **Implement structured data** where appropriate

#### Accessibility

1. **Use semantic HTML elements**
2. **Provide proper ARIA labels** when needed
3. **Ensure keyboard navigation** works
4. **Test with screen readers**

### 🚨 Common Pitfalls to Avoid

1. **Don't commit `.env` files** - Use `.env.example` instead
2. **Don't skip type generation** - Always run typegen after schema changes
3. **Don't hardcode content** - Use Sanity for all content
4. **Don't forget to update static params** when adding new routes
5. **Don't use `any` types** - Leverage TypeScript's type safety
6. **Don't duplicate GROQ fragments** - Reuse existing fragments
7. **Don't skip the format command** - Keep code style consistent

### 📦 Recommended VS Code Extensions

For the best development experience:

- **Sanity.io** - Syntax highlighting for GROQ
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class autocomplete
- **TypeScript Vue Plugin (Volar)** - Better TypeScript support

---

## Need Help?

- Check the inline comments and TODOs in the codebase
- [Sanity Documentation](https://www.sanity.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Join Sanity Community](https://slack.sanity.io)
