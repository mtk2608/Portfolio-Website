// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Hosting detection. Works on Netlify (CONTEXT / URL / DEPLOY_PRIME_URL) and,
// as a fallback, Cloudflare Pages (CF_PAGES_BRANCH / CF_PAGES_URL).
// Production = the live site build; everything else is a preview and is kept out of search engines.
const env = process.env;
const isProduction = env.DEPLOY_ENV
  ? env.DEPLOY_ENV === 'production'
  : env.CONTEXT
    ? env.CONTEXT === 'production'
    : env.CF_PAGES_BRANCH === 'main';

// Set SITE_URL to your real domain once you have one (used for sitemap/RSS/OG tags).
// Otherwise use the host's own URL: Netlify's primary URL for production, or the
// preview URL for branch/deploy previews.
const site =
  env.SITE_URL ??
  (isProduction ? env.URL : env.DEPLOY_PRIME_URL) ??
  env.CF_PAGES_URL ??
  'https://example.com';

export default defineConfig({
  site,
  // Old multi-page URLs now live as sections on the landing page.
  redirects: {
    '/about': '/#about',
    '/projects': '/#projects',
  },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  env: {
    schema: {
      // Keeps preview/dev builds out of search engines.
      SITE_NOINDEX: envField.boolean({ context: 'server', access: 'public', default: !isProduction }),
    },
  },
});
