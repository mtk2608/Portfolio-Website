// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Cloudflare Pages sets CF_PAGES_BRANCH / CF_PAGES_URL on every build.
// Production = the `main` branch build; everything else is a preview.
const branch = process.env.CF_PAGES_BRANCH;
const isProduction = process.env.DEPLOY_ENV
  ? process.env.DEPLOY_ENV === 'production'
  : branch === 'main';

// Set SITE_URL in the Cloudflare *production* environment to your real domain
// (used for sitemap/RSS/OG tags). Previews fall back to their own pages.dev URL.
const site = process.env.SITE_URL ?? process.env.CF_PAGES_URL ?? 'https://example.com';

export default defineConfig({
  site,
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  env: {
    schema: {
      // Keeps preview/dev builds out of search engines.
      SITE_NOINDEX: envField.boolean({ context: 'server', access: 'public', default: !isProduction }),
    },
  },
});
