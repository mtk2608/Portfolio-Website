import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

export const ROOT = join(import.meta.dirname, '..');
export const DIST = join(ROOT, 'dist');

export const read = (...p: string[]) => readFileSync(join(ROOT, ...p), 'utf8');

/** Map a URL path like "/about" to its built file in dist/. */
export function distFile(urlPath: string): string {
  const clean = urlPath.split('#')[0].split('?')[0];
  const direct = join(DIST, clean);
  if (/\.[a-z0-9]+$/i.test(clean)) return direct;
  return join(DIST, clean, 'index.html');
}

export function loadPage(urlPath: string): Document {
  const file = distFile(urlPath);
  if (!existsSync(file)) throw new Error(`Missing build output ${file}. Run "npm run build" first.`);
  return new JSDOM(readFileSync(file, 'utf8')).window.document;
}

/** Minimal frontmatter parser for the simple key: value files in this repo. */
export function frontmatter(src: string): Record<string, string> {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error('No frontmatter found');
  const out: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

export const files = (dir: string, ext: string) =>
  readdirSync(join(ROOT, dir)).filter((f) => f.endsWith(ext));

/** Routes the site currently serves. */
export const ROUTES = ['/', '/about', '/projects', '/projects/hangman', '/blog', '/blog/hello-world'];
