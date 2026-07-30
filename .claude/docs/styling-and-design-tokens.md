# Styling, design tokens & reuse

How styling works and what to reuse. Read this before writing any UI code. **Guiding rule:** before writing styles or creating an element, **reuse what exists** — typography tokens, utilities, components, helpers. Don't hardcode values the project already exposes as tokens.

## Tailwind v4, CSS-first

- **No `tailwind.config.js`.** All configuration lives in CSS: `frontend/app/globals.css` imports Tailwind plus the token files in `frontend/app/styles/` (`typography.css`, `colors.css`).
- New tokens go in `@theme` (design values → generated utilities); new composite utilities in `@utility`:

```css
/* styles/colors.css */
@theme {
  --color-brand: #0066ff; /* example — derive real tokens from the project design system */
  --color-ink: #1a1a1a;
}
/* → usable as bg-brand, text-ink, border-brand, … */
```

- Prefer standard Tailwind classes (`gap-8`, `rounded-2xl`) over arbitrary values (`gap-[32px]`); arbitrary values only when neither a token nor a standard class fits.
- Mobile-first: base styles for mobile, `md:`/`lg:` for larger breakpoints.

## Typography tokens

Define the responsive type scale once as `t-*` utilities that handle mobile → desktop internally, then **use these, not hardcoded `text-[Npx]`**:

```css
/* styles/typography.css */
@utility t-h1 {
  @apply text-4xl leading-tight font-semibold lg:text-7xl;
}
@utility t-p {
  @apply text-lg leading-normal lg:text-xl;
}
```

Recommended set: `t-h1`/`t-h2`/`t-h3` (headings), `t-p` (paragraphs), `t-small`, plus project-specific ones (buttons, tags). Derive the scale from the Figma design system at project start. Always start headings/paragraphs from a `t-*` utility: `<h1 className="t-h1 text-white">`.

## Colors

- Every recurring design color becomes a `@theme` token — no stray hex in components.
- If you find a color hardcoded in more than one place, propose promoting it to a token instead of spreading more hex.
- Theme variants (e.g. per-section/per-page palettes) override CSS variables via a `data-theme` attribute, not per-component conditionals.

## Reusable components & helpers

| Thing             | Where                                           | When                                                                           |
| ----------------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| `Picture`         | `frontend/components/ui/picture.tsx`            | every content image (Sanity CDN, hotspot/crop, alt, fade-in)                   |
| `Link`            | `frontend/components/ui/link.tsx`               | every link/CTA built from the `link` object (internal i18n + external)         |
| `Text`            | `frontend/components/ui/text.tsx`               | heading/paragraph wrapper with a dynamic HTML tag                              |
| `PortableText`    | `frontend/components/ui/portable-text.tsx`      | every rich-text field                                                          |
| `Skeleton`        | `frontend/components/ui/skeleton.tsx`           | loading placeholders, sized via `className`                                    |
| `cn()`            | `frontend/utils/cn.ts`                          | conditional/merged class names (clsx + tailwind-merge) — not `lib/utils`       |
| Image URL helpers | `frontend/sanity/lib/utils.ts`                  | `urlForImage`, `linkResolver`, OG image resolution                             |
| Hooks             | `frontend/hooks/` (one file per hook)           | `use-media-query`, `use-in-view`, `use-reduced-motion`, `use-click-outside`, … |
| Icons             | `lucide-react`                                  | default icon set for UI icons                                                  |
| SVG assets/logos  | `frontend/public/` imported as React components | brand logos and one-off vectors only                                           |

Before creating a new base UI component, **check `components/ui/` first** — extend, don't duplicate.

### Icons (`lucide-react`)

Don't inline raw `<svg>` or add generic icons to `public/`. Lucide icons are outline/stroke (`stroke="currentColor"`), so:

- **Color** via text color: `className="text-ink"` (not `fill-*`).
- **Size** via the `size` prop or a `size-*` utility (`className="size-10 lg:size-14"`).
- **Stroke weight** via `strokeWidth` when the design needs it (default `2`).

`public/` SVGs are reserved for logos/brand assets and brand glyphs lucide doesn't cover.

## From Figma to tokens

When implementing a design: map Figma text styles onto `t-*` utilities and Figma color styles onto `@theme` tokens **before** writing component markup. Spacing converts px → Tailwind units (4px = 1: 16px = `4`, 32px = `8`). A design value with no token match is a signal to add a token (if recurring) — not to hardcode.

## Style checklist

- [ ] Headings/paragraphs use `t-*` utilities, not hardcoded px
- [ ] Images use `Picture`; links/CTAs use the shared `Link` component
- [ ] Colors come from tokens; no new hex without reason
- [ ] Spacing/radius consistent with nearby blocks
- [ ] No base component recreated when one exists in `components/ui/`
