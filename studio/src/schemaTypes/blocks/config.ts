/**
 * Block configurations
 * Separate file to avoid circular dependencies
 *
 * When adding a new block:
 * 1. Add the block schema to studio/src/schemaTypes/blocks/
 * 2. Add the block type to the pageBuilderBlocks array below
 * 3. Export the block schema in studio/src/schemaTypes/blocks/index.ts
 * 4. Register the block in studio/src/schemaTypes/index.ts
 * 5. Create the frontend component in frontend/components/Blocks/
 * 6. Register the component in frontend/components/Layout/BlockRenderer.tsx
 * 7. Update the pageBuilderFragment in frontend/sanity/lib/queries.ts if needed
 */

/**
 * All available blocks for the page builder
 * Add your custom blocks here as you create them
 *
 * Example blocks (uncomment and customize as needed):
 */
export const pageBuilderBlocks = [
  {type: 'exampleBlock'},
  // { type: "heroBlock" },
  // { type: "textBlock" },
  // { type: "imageGallery" },
  // { type: "ctaBlock" },
]

/**
 * Options for pageBuilder fields to enable grid view with thumbnails
 * Use this in all pageBuilder field definitions
 */
export const pageBuilderFieldOptions = {
  insertMenu: {
    views: [
      {
        name: 'grid' as const,
      },
    ],
  },
}
