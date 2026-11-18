// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// TODO: replace with your real domain once deployed (used for sitemap/RSS/OG tags)
export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
