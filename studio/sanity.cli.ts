/**
 * Sanity CLI Configuration
 * This file configures the Sanity CLI tool with project-specific settings
 * and customizes the Vite bundler configuration.
 * Learn more: https://www.sanity.io/docs/cli
 */

import { defineCliConfig } from 'sanity/cli'

/**
 * Which environment this invocation targets. Every npm script sets
 * SANITY_ACTIVE_ENV explicitly (see studio/package.json).
 *
 * The default is **development on purpose**: a bare `sanity` invocation with no
 * environment set must never silently target the production dataset. Production
 * has to be asked for.
 */
const isDev = (process.env.SANITY_ACTIVE_ENV ?? 'development') !== 'production'

/**
 * Per-environment defaults are hardcoded on purpose. None of these are secrets
 * (project ID, hostnames and app IDs are all public), and the per-mode `.env`
 * files cannot be committed — the BARR guard hook blocks every `.env*`. Without
 * these fallbacks a fresh clone would deploy with an empty studio host and
 * create a THIRD Sanity application instead of updating one of ours.
 * Env vars still win, so a local override keeps working.
 *
 * The placeholders below are filled by /barr-init at project init (appIds after
 * the first deploy of each Studio — the CLI prints them).
 */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '<your project ID>'
const dataset = process.env.SANITY_STUDIO_DATASET || (isDev ? 'development' : 'production')
const studioHost = process.env.SANITY_STUDIO_STUDIO_HOST || (isDev ? '<project>-dev' : '<project>')
const appId = process.env.SANITY_STUDIO_APP_ID || (isDev ? '' : '') // dev / prod appId — set by /barr-init

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  studioHost,
  ...(appId ? { deployment: { appId } } : {}),
})
